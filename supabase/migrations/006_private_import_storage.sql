insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'financial-imports',
  'financial-imports',
  false,
  5242880,
  array[
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "members can read tenant import files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'financial-imports'
  and public.is_org_member(((storage.foldername(name))[1])::uuid)
);

create policy "members can upload tenant import files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'financial-imports'
  and public.has_org_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','member']
  )
);

create policy "members can delete tenant import files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'financial-imports'
  and public.has_org_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','admin','member']
  )
);
