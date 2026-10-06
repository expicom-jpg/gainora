create or replace function private.bootstrap_org_membership()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated';
  end if;

  insert into public.memberships (organization_id, user_id, role)
  values (new.id, (select auth.uid()), 'owner');

  insert into public.audit_events (
    organization_id,
    actor_user_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  )
  values (
    new.id,
    (select auth.uid()),
    'organization_created',
    'organization',
    new.id,
    jsonb_build_object('name', new.name)
  );

  return new;
end;
$$;

revoke all on function private.bootstrap_org_membership() from public;

drop trigger if exists organizations_bootstrap_owner on public.organizations;
create trigger organizations_bootstrap_owner
after insert on public.organizations
for each row execute function private.bootstrap_org_membership();

create or replace function public.create_organization(org_name text)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  new_org_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'unauthenticated';
  end if;

  if length(trim(org_name)) < 2 or length(trim(org_name)) > 120 then
    raise exception 'invalid organization name';
  end if;

  insert into public.organizations (name)
  values (trim(org_name))
  returning id into new_org_id;

  return new_org_id;
end;
$$;

revoke all on function public.create_organization(text) from public;
grant execute on function public.create_organization(text) to authenticated;
