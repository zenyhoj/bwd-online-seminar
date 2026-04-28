-- Migration script to support multiple applicants per public profile
-- 1. Create the new applicants table
create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete restrict,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  gender text,
  age integer check (age >= 0),
  address text,
  cellphone_number text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger handle_updated_at before update on public.applicants
  for each row execute procedure public.set_updated_at();

-- 2. Backfill existing profiles into the applicants table
-- We'll use the profile's ID as the applicant's ID to preserve existing foreign key relationships seamlessly.
insert into public.applicants (id, organization_id, profile_id, full_name, gender, age, address, cellphone_number)
select 
  p.id, 
  p.organization_id, 
  p.id, 
  p.full_name, 
  p.gender, 
  p.age, 
  p.address, 
  p.phone
from public.profiles p
where p.role = 'applicant';

-- 3. Update applications table to reference applicants instead of profiles
alter table public.applications
  drop constraint if exists applications_applicant_id_fkey;

alter table public.applications
  add constraint applications_applicant_id_fkey
  foreign key (applicant_id) references public.applicants (id) on delete cascade;

-- 4. Update applicant_seminar_progress table to reference applicants instead of profiles
alter table public.applicant_seminar_progress
  drop constraint if exists applicant_seminar_progress_applicant_id_fkey;

alter table public.applicant_seminar_progress
  add constraint applicant_seminar_progress_applicant_id_fkey
  foreign key (applicant_id) references public.applicants (id) on delete cascade;

-- 5. Update documents table to reference applicants instead of profiles
alter table public.documents
  drop constraint if exists documents_applicant_id_fkey;

alter table public.documents
  add constraint documents_applicant_id_fkey
  foreign key (applicant_id) references public.applicants (id) on delete cascade;

-- 6. Update concessionaires table
alter table public.concessionaires
  drop constraint if exists concessionaires_profile_id_fkey;

alter table public.concessionaires
  rename column profile_id to applicant_id;

alter table public.concessionaires
  add constraint concessionaires_applicant_id_fkey
  foreign key (applicant_id) references public.applicants (id) on delete restrict;

-- 7. RLS Helper Function and Policies for Applicants
create or replace function public.user_owns_applicant(a_id uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.applicants
    where id = a_id and profile_id = auth.uid()
  );
$$;

alter table public.applicants enable row level security;

create policy "applicants_own_rows"
on public.applicants
for all
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "applicants_admin_org"
on public.applicants
for all
using (
  public.current_profile_role() = 'admin'
  and organization_id = public.current_profile_organization_id()
)
with check (
  public.current_profile_role() = 'admin'
  and organization_id = public.current_profile_organization_id()
);

-- Note: You will need to update existing RLS policies in public-user-seminar-flow.sql or rls.sql
-- For example, changing `applicant_id = auth.uid()` to `public.user_owns_applicant(applicant_id)`
-- for tables like applications, documents, applicant_seminar_progress, etc.
