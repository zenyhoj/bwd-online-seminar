create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.current_profile_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.organization_id
  from public.profiles p
  where p.id = auth.uid()
$$;

revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_role() to anon, authenticated, service_role;

revoke all on function public.current_profile_organization_id() from public;
grant execute on function public.current_profile_organization_id() to anon, authenticated, service_role;
