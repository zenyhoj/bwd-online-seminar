alter table public.payments
add column if not exists office_payment_at timestamptz;
