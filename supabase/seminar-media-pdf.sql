alter table public.seminar_items drop constraint if exists seminar_items_media_type_check;

alter table public.seminar_items
  add constraint seminar_items_media_type_check
  check (media_type in ('text', 'image', 'video', 'pdf'));

insert into storage.buckets (id, name, public)
values ('seminar-media', 'seminar-media', true)
on conflict (id) do update set public = true;

create policy "Public access to seminar media"
on storage.objects for select
to public
using (bucket_id = 'seminar-media');

create policy "Admin can insert seminar media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'seminar-media' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admin can update seminar media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'seminar-media' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Admin can delete seminar media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'seminar-media' and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
