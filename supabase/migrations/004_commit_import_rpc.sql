create or replace function public.commit_financial_import(
  target_org uuid,
  source_filename text,
  normalized_rows jsonb,
  is_synthetic boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_import_id uuid;
  item jsonb;
begin
  if not public.has_org_role(target_org, array['owner','admin','member']) then
    raise exception 'forbidden';
  end if;

  if jsonb_typeof(normalized_rows) <> 'array' then
    raise exception 'normalized_rows must be an array';
  end if;

  insert into public.imports (
    organization_id,
    uploaded_by,
    original_filename,
    status
  )
  values (
    target_org,
    auth.uid(),
    source_filename,
    'complete'
  )
  returning id into new_import_id;

  for item in select * from jsonb_array_elements(normalized_rows)
  loop
    insert into public.financial_rows (
      organization_id,
      import_id,
      transaction_date,
      account,
      description,
      amount
    )
    values (
      target_org,
      new_import_id,
      (item->>'date')::date,
      item->>'account',
      coalesce(item->>'description', ''),
      (item->>'amount')::numeric
    );
  end loop;

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    target_org,
    auth.uid(),
    'financial_import_committed',
    'import',
    new_import_id,
    jsonb_build_object(
      'filename', source_filename,
      'row_count', jsonb_array_length(normalized_rows),
      'synthetic', is_synthetic
    )
  );

  return new_import_id;
end;
$$;

revoke all on function public.commit_financial_import(uuid, text, jsonb, boolean) from public;
grant execute on function public.commit_financial_import(uuid, text, jsonb, boolean) to authenticated;
