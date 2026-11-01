-- Synthetic-only P0 regression. CI disposable PostgreSQL ONLY.
-- No real user, Master identity, organization, or customer data.
-- Roll back all fixtures.
begin;

select set_config('test.master', gen_random_uuid()::text, true);
select set_config('test.staff', gen_random_uuid()::text, true);
select set_config('test.outsider', gen_random_uuid()::text, true);
select set_config('test.owner', gen_random_uuid()::text, true);
select set_config('request.jwt.claim.sub', current_setting('test.owner'), true);
select set_config('test.org_a', gen_random_uuid()::text, true);
select set_config('test.org_b', gen_random_uuid()::text, true);
insert into public.organizations(id, name) values
  (current_setting('test.org_a')::uuid, 'Synthetic compliance A'),
  (current_setting('test.org_b')::uuid, 'Synthetic compliance B');
insert into private.compliance_master_principal(user_id, active)
values (current_setting('test.master')::uuid, true);
insert into private.compliance_staff_grants(
  user_id, organization_id, status, permissions, grant_version,
  approved_version, master_approved, approved_by, approved_at
) values (
  current_setting('test.staff')::uuid, current_setting('test.org_a')::uuid,
  'active', array['compliance.case.read','compliance.case.reply'], 1,
  1, true, current_setting('test.master')::uuid, now()
);

-- The staff user has an explicit Master-approved grant for org A, but no
-- tenant membership, generic admin role, or grant for org B.
select set_config('request.jwt.claim.sub', current_setting('test.staff'), true);
set local role authenticated;
do $$ begin
  if not private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read') then
    raise exception 'TEST FAILED: current Master-approved permission rejected';
  end if;
  if private.has_current_compliance_permission(
    current_setting('test.org_b')::uuid, 'compliance.case.read')
    or private.has_current_compliance_permission(
      current_setting('test.org_a')::uuid, 'compliance.knowledge.publish')
    or private.has_current_compliance_permission(
      current_setting('test.org_a')::uuid, 'compliance.unknown')
    or private.has_current_compliance_permission(
      null, 'compliance.case.read') then
    raise exception 'TEST FAILED: permission scope expanded';
  end if;
  begin
    perform count(*) from private.compliance_staff_grants;
    raise exception 'TEST FAILED: authenticated role read protected grants';
  exception when insufficient_privilege then null; end;
  begin
    update private.compliance_staff_grants set master_approved = true;
    raise exception 'TEST FAILED: authenticated role wrote protected grants';
  exception when insufficient_privilege then null; end;
  begin
    perform count(*) from private.compliance_master_principal;
    raise exception 'TEST FAILED: authenticated role read Master identity';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- A different authenticated identity cannot inherit the staff grant.
select set_config('request.jwt.claim.sub', current_setting('test.outsider'), true);
set local role authenticated;
do $$ begin
  if private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read') then
    raise exception 'TEST FAILED: outsider inherited staff grant';
  end if;
end $$;
reset role;

-- An anonymous caller cannot even invoke the protected function.
set local role anon;
do $$ begin
  begin
    perform private.has_current_compliance_permission(
      current_setting('test.org_a')::uuid, 'compliance.case.read');
    raise exception 'TEST FAILED: anonymous caller invoked grant predicate';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

-- A permission change invalidates the previous approval and increments
-- the version even if the writer attempts to retain approval metadata.
update private.compliance_staff_grants
set permissions = array['compliance.case.read'],
    master_approved = true,
    approved_version = grant_version
where user_id = current_setting('test.staff')::uuid;
do $$ begin
  if not exists (
    select 1 from private.compliance_staff_grants
    where user_id = current_setting('test.staff')::uuid
      and grant_version = 2 and not master_approved
      and approved_by is null and approved_version is null
  ) then
    raise exception 'TEST FAILED: permission edit retained stale approval';
  end if;
  begin
    update private.compliance_staff_grants
    set grant_version = 1
    where user_id = current_setting('test.staff')::uuid;
    raise exception 'TEST FAILED: grant version manually rewound';
  exception when check_violation then null; end;
  begin
    update private.compliance_staff_grants
    set organization_id = current_setting('test.org_b')::uuid
    where user_id = current_setting('test.staff')::uuid;
    raise exception 'TEST FAILED: grant tenant reassigned';
  exception when check_violation then null; end;
end $$;

select set_config('request.jwt.claim.sub', current_setting('test.staff'), true);
set local role authenticated;
do $$ begin
  if private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read') then
    raise exception 'TEST FAILED: stale grant still authorized';
  end if;
end $$;
reset role;

-- A separate privileged Master reapproval restores only the allowed right.
update private.compliance_staff_grants
set master_approved = true,
    approved_by = current_setting('test.master')::uuid,
    approved_at = now(),
    approved_version = grant_version
where user_id = current_setting('test.staff')::uuid;

set local role authenticated;
do $$ begin
  if not private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read')
    or private.has_current_compliance_permission(
      current_setting('test.org_a')::uuid, 'compliance.case.reply') then
    raise exception 'TEST FAILED: reapproval granted incorrect rights';
  end if;
end $$;
reset role;

-- Master suspension must revoke all grants immediately without JWT refresh.
update private.compliance_master_principal set active = false;
set local role authenticated;
do $$ begin
  if private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read') then
    raise exception 'TEST FAILED: inactive Master still authorized staff';
  end if;
end $$;
reset role;

-- Staff suspension invalidates approval and cannot be bypassed by reapproval.
update private.compliance_master_principal set active = true;
update private.compliance_staff_grants set status = 'suspended';
update private.compliance_staff_grants
set master_approved = true,
    approved_by = current_setting('test.master')::uuid,
    approved_at = now(),
    approved_version = grant_version;
set local role authenticated;
do $$ begin
  if private.has_current_compliance_permission(
    current_setting('test.org_a')::uuid, 'compliance.case.read') then
    raise exception 'TEST FAILED: suspended staff still authorized';
  end if;
end $$;
reset role;

rollback;
