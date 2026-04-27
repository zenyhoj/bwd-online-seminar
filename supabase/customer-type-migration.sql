create type public.customer_type as enum ('residential', 'commercial', 'government', 'industrial', 'others');

alter table public.profiles
add column if not exists customer_type public.customer_type;
