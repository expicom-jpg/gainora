-- File ingestion stays closed until a separately reviewed real-data release.
-- A client-supplied synthetic flag is not a trust boundary.
revoke all on function public.commit_financial_import(uuid,text,jsonb,boolean) from public,anon,authenticated;
revoke insert,update,delete on public.financial_rows from public,anon,authenticated;
revoke insert,update,delete on public.imports from public,anon,authenticated;
-- SELECT FOR UPDATE in the audit RPC requires UPDATE on at least one column.
-- Referenced demo/audit IDs cannot be changed because of foreign keys.
grant update(id) on public.imports to authenticated;
drop policy "members can upload tenant import files" on storage.objects;
-- Restrictive policy also blocks future permissive policies and upsert for this bucket.
create policy "financial uploads remain closed" on storage.objects as restrictive
  for insert to anon,authenticated with check (bucket_id <> 'financial-imports');
create policy "financial upload replacements remain closed" on storage.objects as restrictive
  for update to anon,authenticated using (bucket_id <> 'financial-imports')
  with check (bucket_id <> 'financial-imports');

create table private.fixed_demo_imports (
  organization_id uuid primary key references public.organizations(id),
  import_id uuid not null unique references public.imports(id)
);
alter table private.fixed_demo_imports enable row level security;
revoke all on private.fixed_demo_imports from public,anon,authenticated;

-- Narrow privilege boundary: only this function can insert the fixed fixture.
-- It accepts no filename, amounts, rows, JSON or user-controlled financial content.
create function private.create_fixed_demo_import(target_org uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare demo_id uuid;
begin
  if auth.uid() is null or not private.has_org_role(target_org,array['owner','admin','member']) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  -- Serialize repeated/concurrent requests; one fixed demo per organization.
  perform 1 from public.organizations where id=target_org for update;
  if not found then raise exception 'forbidden' using errcode='42501'; end if;
  select import_id into demo_id from private.fixed_demo_imports where organization_id=target_org;
  if demo_id is not null then return demo_id; end if;
  demo_id := public.commit_financial_import(target_org,'Gainora fast demo v1 (syntetisk)',
    '[{"date":"2026-09-30","account":"Salg","description":"Syntetisk demo: salg","amount":200000},
      {"date":"2026-09-30","account":"Vareindkøb","description":"Syntetisk demo: varer","amount":-70000},
      {"date":"2026-09-30","account":"Løn","description":"Syntetisk demo: løn","amount":-60000},
      {"date":"2026-09-30","account":"Husleje","description":"Syntetisk demo: husleje","amount":-18000},
      {"date":"2026-09-30","account":"Software","description":"Syntetisk demo: software","amount":-2500},
      {"date":"2026-09-30","account":"Forsikring","description":"Syntetisk demo: forsikring","amount":-2000},
      {"date":"2026-09-30","account":"Energi","description":"Syntetisk demo: energi","amount":-4500},
      {"date":"2026-09-30","account":"Markedsføring","description":"Syntetisk demo: marketing","amount":-7000}]'::jsonb,true);
  insert into private.fixed_demo_imports values(target_org,demo_id);
  return demo_id;
end;
$$;
revoke all on function private.create_fixed_demo_import(uuid) from public,anon;
grant execute on function private.create_fixed_demo_import(uuid) to authenticated;

create function public.create_demo_import(target_org uuid)
returns uuid language sql security invoker set search_path = '' as $$
  select private.create_fixed_demo_import(target_org);
$$;
revoke all on function public.create_demo_import(uuid) from public,anon;
grant execute on function public.create_demo_import(uuid) to authenticated;
