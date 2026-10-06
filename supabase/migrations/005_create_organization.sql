create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'unauthenticated';
  end if;

  if length(trim(org_name)) < 2 or length(trim(org_name)) > 120 then
    raise exception 'invalid organization name';
  end if;

  insert into public.organizations (name)
  values (trim(org_name))
  returning id into new_org_id;

  insert into public.memberships (
    organization_id,
    user_id,
    role
  )
  values (
    new_org_id,
    auth.uid(),
    'owner'
  );

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    new_org_id,
    auth.uid(),
    'organization_created',
    'organization',
    new_org_id,
    jsonb_build_object('name', trim(org_name))
  );

  return new_org_id;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;
