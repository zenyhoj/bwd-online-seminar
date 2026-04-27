create table if not exists public.accredited_plumbers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  full_name text not null,
  license_number text,
  phone text,
  notes text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.applications
add column if not exists accredited_plumber_id uuid references public.accredited_plumbers (id) on delete set null;

alter table public.applications
add column if not exists inhouse_installation_completed boolean not null default false;

alter table public.applications
add column if not exists inhouse_installation_completed_at timestamptz;

alter table public.applications
add column if not exists inhouse_installation_updated_by uuid references public.profiles (id) on delete set null;

create index if not exists idx_accredited_plumbers_org_active
on public.accredited_plumbers (organization_id, is_active, full_name);

drop trigger if exists accredited_plumbers_updated_at on public.accredited_plumbers;
create trigger accredited_plumbers_updated_at
before update on public.accredited_plumbers
for each row execute function public.set_updated_at();

alter table public.accredited_plumbers enable row level security;

drop policy if exists "accredited_plumbers_select_same_org" on public.accredited_plumbers;
create policy "accredited_plumbers_select_same_org"
on public.accredited_plumbers
for select
using (organization_id = public.current_profile_organization_id());

drop policy if exists "accredited_plumbers_admin_manage" on public.accredited_plumbers;
create policy "accredited_plumbers_admin_manage"
on public.accredited_plumbers
for all
using (
  public.current_profile_role() = 'admin'
  and organization_id = public.current_profile_organization_id()
)
with check (
  public.current_profile_role() = 'admin'
  and organization_id = public.current_profile_organization_id()
);
