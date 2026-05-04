alter table public.applications
add column if not exists water_meter_installation_scheduled_at timestamptz;

alter table public.applications
add column if not exists water_meter_installation_scheduled_by uuid references public.profiles (id) on delete set null;
