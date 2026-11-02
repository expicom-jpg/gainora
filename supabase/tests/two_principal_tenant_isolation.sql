-- P0 synthetic-only two-principal tenant isolation regression.
-- Run ONLY against the disposable CI PostgreSQL after migrations.
-- Each fixture is rolled back. This does not replace hosted Supabase RLS tests.
begin;

-- Two distinct authenticated principals each create their own organization,
-- financial import, and audit finding.
select set_config('test.principal_a', gen_random_uuid()::text, true);
select set_config('test.principal_b', gen_random_uuid()::text, true);

select set_config('request.jwt.claim.sub', current_setting('test.principal_a'), true);
set local role authenticated;
select set_config('test.org_a', public.create_organization('Synthetic isolation tenant A')::text, true);
select set_config('test.import_a', public.create_demo_import(current_setting('test.org_a')::uuid)::text, true);
select set_config('test.finding_a', (
  select id::text from public.persist_profit_audit(
    current_setting('test.org_a')::uuid,
    current_setting('test.import_a')::uuid,
    '[{"findingType":"financial_summary","title":"Synthetic A","description":"RLS test"}]', 8
  ) limit 1
), true);
-- A recorded result must remain tenant-scoped, not just its finding.
update public.audit_findings set status='approved'
where id=current_setting('test.finding_a')::uuid;
insert into public.results(organization_id,finding_id,title,baseline_value,result_value,attributed_value,notes)
values(current_setting('test.org_a')::uuid,current_setting('test.finding_a')::uuid,
  'Synthetic A result',1000,900,100,'Synthetic CI fixture');
select set_config('test.result_a', (
  select id::text from public.results where finding_id=current_setting('test.finding_a')::uuid
), true);
reset role;

select set_config('request.jwt.claim.sub', current_setting('test.principal_b'), true);
set local role authenticated;
select set_config('test.org_b', public.create_organization('Synthetic isolation tenant B')::text, true);
select set_config('test.import_b', public.create_demo_import(current_setting('test.org_b')::uuid)::text, true);
select set_config('test.finding_b', (
  select id::text from public.persist_profit_audit(
    current_setting('test.org_b')::uuid,
    current_setting('test.import_b')::uuid,
    '[{"findingType":"financial_summary","title":"Synthetic B","description":"RLS test"}]', 8
  ) limit 1
), true);
update public.audit_findings set status='approved'
where id=current_setting('test.finding_b')::uuid;
insert into public.results(organization_id,finding_id,title,baseline_value,result_value,attributed_value,notes)
values(current_setting('test.org_b')::uuid,current_setting('test.finding_b')::uuid,
  'Synthetic B result',2000,1800,200,'Synthetic CI fixture');
select set_config('test.result_b', (
  select id::text from public.results where finding_id=current_setting('test.finding_b')::uuid
), true);
reset role;

-- A is a valid tenant member, not merely an unaffiliated outsider.
-- Verify its own data is visible and B's data is invisible.
select set_config('request.jwt.claim.sub', current_setting('test.principal_a'), true);
set local role authenticated;
do $$ begin
  if not exists (select 1 from public.imports where id = current_setting('test.import_a')::uuid)
    or not exists (select 1 from public.financial_rows where import_id = current_setting('test.import_a')::uuid)
    or not exists (select 1 from public.audit_findings where id = current_setting('test.finding_a')::uuid)
    or not exists (select 1 from public.results where id = current_setting('test.result_a')::uuid)
    or not exists (select 1 from public.audit_events where organization_id = current_setting('test.org_a')::uuid) then
    raise exception 'TEST FAILED: principal A cannot read its own tenant';
  end if;
  if exists (select 1 from public.imports where id = current_setting('test.import_b')::uuid)
    or exists (select 1 from public.financial_rows where import_id = current_setting('test.import_b')::uuid)
    or exists (select 1 from public.audit_findings where id = current_setting('test.finding_b')::uuid)
    or exists (select 1 from public.results where id = current_setting('test.result_b')::uuid)
    or exists (select 1 from public.audit_events where organization_id = current_setting('test.org_b')::uuid) then
    raise exception 'TEST FAILED: principal A read tenant B';
  end if;
  begin
    perform public.create_demo_import(current_setting('test.org_b')::uuid);
    raise exception 'TEST FAILED: principal A created tenant B import';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.persist_profit_audit(
      current_setting('test.org_b')::uuid, current_setting('test.import_b')::uuid, '[]', 8
    );
    raise exception 'TEST FAILED: principal A audited tenant B';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Repeat in the opposite direction to catch asymmetric policy mistakes.
select set_config('request.jwt.claim.sub', current_setting('test.principal_b'), true);
set local role authenticated;
do $$ begin
  if not exists (select 1 from public.imports where id = current_setting('test.import_b')::uuid)
    or not exists (select 1 from public.financial_rows where import_id = current_setting('test.import_b')::uuid)
    or not exists (select 1 from public.audit_findings where id = current_setting('test.finding_b')::uuid)
    or not exists (select 1 from public.results where id = current_setting('test.result_b')::uuid)
    or not exists (select 1 from public.audit_events where organization_id = current_setting('test.org_b')::uuid) then
    raise exception 'TEST FAILED: principal B cannot read its own tenant';
  end if;
  if exists (select 1 from public.imports where id = current_setting('test.import_a')::uuid)
    or exists (select 1 from public.financial_rows where import_id = current_setting('test.import_a')::uuid)
    or exists (select 1 from public.audit_findings where id = current_setting('test.finding_a')::uuid)
    or exists (select 1 from public.results where id = current_setting('test.result_a')::uuid)
    or exists (select 1 from public.audit_events where organization_id = current_setting('test.org_a')::uuid) then
    raise exception 'TEST FAILED: principal B read tenant A';
  end if;
  begin
    perform public.create_demo_import(current_setting('test.org_a')::uuid);
    raise exception 'TEST FAILED: principal B created tenant A import';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.persist_profit_audit(
      current_setting('test.org_a')::uuid, current_setting('test.import_a')::uuid, '[]', 8
    );
    raise exception 'TEST FAILED: principal B audited tenant A';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

rollback;
