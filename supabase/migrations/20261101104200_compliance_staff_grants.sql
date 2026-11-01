-- Review-only P0 foundation: protected Master-approved Compliance staff grants.
-- DO NOT apply to a hosted/production Supabase project without separate approval.
-- CI applies this file only to disposable PostgreSQL; no customer data.
--
-- No authenticated/anon table grants or public write functions are created.
-- The single Master identity is provisioned/revoked only by a trusted DBA.
create table private.compliance_master_principal (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique,
  active boolean not null default false,
  changed_at timestamptz not null default now()
);

create table private.compliance_staff_grants (
  user_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'pending_master_approval'
    check (status in ('invited','pending_master_approval','active','suspended','revoked')),
  permissions text[] not null default '{}'::text[]
    check (
      array_position(permissions, null) is null
      and permissions <@ array[
        'compliance.case.read','compliance.case.reply','compliance.case.export',
        'compliance.history.search','compliance.knowledge.approve',
        'compliance.knowledge.publish'
      ]::text[]
    ),
  grant_version bigint not null default 1
    check (grant_version between 1 and 9007199254740991),
  approved_version bigint,
  master_approved boolean not null default false,
  approved_by uuid,
  approved_at timestamptz,
  changed_at timestamptz not null default now(),
  primary key (user_id, organization_id),
  check (approved_by is null or approved_by <> user_id),
  check (
    (master_approved and approved_by is not null and approved_at is not null
      and approved_version = grant_version)
    or
    (not master_approved and approved_by is null and approved_at is null
      and approved_version is null)
  )
);

-- A security-relevant change invalidates prior approval, including a change
-- that tries to carry the previous approval forward. Approval must be redone
-- as a separate privileged operation on the NEW version.
create function private.invalidate_compliance_grant_approval()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id
     or new.organization_id is distinct from old.organization_id then
    raise exception 'compliance_grant_scope_immutable' using errcode = '23514';
  end if;
  if new.status is distinct from old.status
     or new.permissions is distinct from old.permissions then
    if old.grant_version >= 9007199254740991 then
      raise exception 'compliance_grant_version_exhausted' using errcode = '23514';
    end if;
    new.grant_version := old.grant_version + 1;
    new.master_approved := false;
    new.approved_version := null;
    new.approved_by := null;
    new.approved_at := null;
  elsif new.grant_version is distinct from old.grant_version then
    raise exception 'compliance_grant_version_immutable' using errcode = '23514';
  end if;
  new.changed_at := now();
  return new;
end;
$$;

create trigger compliance_grant_invalidate_approval
before update on private.compliance_staff_grants
for each row execute function private.invalidate_compliance_grant_approval();

-- Deny direct reads/writes by every browser role. RLS is defense in depth;
-- absence of table privileges is the primary protection for this schema.
alter table private.compliance_master_principal enable row level security;
alter table private.compliance_staff_grants enable row level security;
revoke all on private.compliance_master_principal from public, anon, authenticated;
revoke all on private.compliance_staff_grants from public, anon, authenticated;
revoke all on function private.invalidate_compliance_grant_approval() from public, anon, authenticated;

-- A narrow, read-only permission predicate for future transactional RLS.
-- It reads the *current* database grant, never browser-supplied role claims.
-- The server must still authenticate the caller and check case/tenant scope.
create function private.has_current_compliance_permission(
  target_organization uuid,
  required_permission text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select auth.uid()) is not null
    and target_organization is not null
    and required_permission = any(array[
      'compliance.case.read','compliance.case.reply','compliance.case.export',
      'compliance.history.search','compliance.knowledge.approve',
      'compliance.knowledge.publish'
    ]::text[])
    and exists (
      select 1
      from private.compliance_staff_grants g
      join private.compliance_master_principal m
        on m.singleton = true and m.active = true and m.user_id = g.approved_by
      where g.user_id = (select auth.uid())
        and g.organization_id = target_organization
        and g.status = 'active'
        and g.master_approved = true
        and g.approved_version = g.grant_version
        and required_permission = any(g.permissions)
    ),
    false
  );
$$;

revoke all on function private.has_current_compliance_permission(uuid,text)
  from public, anon, authenticated;
grant execute on function private.has_current_compliance_permission(uuid,text)
  to authenticated;
