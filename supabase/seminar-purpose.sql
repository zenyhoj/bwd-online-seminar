create type public.seminar_purpose as enum ('new_service', 'reconnection', 'change_name', 'others');

alter table public.applicants
add column purpose_of_seminar public.seminar_purpose;
