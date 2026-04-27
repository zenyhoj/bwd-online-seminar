alter table public.inspections
add column if not exists reference_account_number text,
add column if not exists reference_account_name text,
add column if not exists account_number text;
