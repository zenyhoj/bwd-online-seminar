alter table public.inspections
drop column if exists inspector_id,
drop column if exists account_reference;
