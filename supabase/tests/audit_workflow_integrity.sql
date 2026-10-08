-- Run in a transaction after migrations. All fixtures roll back; no real users/data.
begin;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('test.org_a', public.create_organization('Synthetic audit A')::text,true);
select set_config('test.org_b', public.create_organization('Synthetic audit B')::text,true);
select set_config('test.import_a', public.commit_financial_import(
  current_setting('test.org_a')::uuid,'synthetic.csv',
  '[{"date":"2026-10-01","account":"Salg","description":"Synthetic","amount":1000}]',true)::text,true);
select set_config('test.finding', (select id::text from public.persist_profit_audit(
  current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,
  '[{"findingType":"financial_summary","title":"Synthetic baseline","description":"Test"}]',1) limit 1),true);

do $$ begin
  begin
    insert into public.audit_findings(organization_id,import_id,finding_type,title,status) values(
      current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'test','Preapproved','approved');
    raise exception 'TEST FAILED: direct preapproved finding accepted';
  exception when check_violation then null; end;
  begin
    perform public.persist_profit_audit(current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'[]',2);
    raise exception 'TEST FAILED: stale row count accepted';
  exception when check_violation then
    if sqlerrm <> 'audit_rows_changed' then raise; end if;
  end;
  begin
    insert into public.results(organization_id,finding_id,title) values(
      current_setting('test.org_a')::uuid,current_setting('test.finding')::uuid,'Too early');
    raise exception 'TEST FAILED: unapproved result accepted';
  exception when check_violation then
    if sqlerrm <> 'finding_not_approved' then raise; end if;
  end;
  begin
    insert into public.audit_findings(organization_id,import_id,finding_type,title) values(
      current_setting('test.org_b')::uuid,current_setting('test.import_a')::uuid,'test','Cross tenant');
    raise exception 'TEST FAILED: cross-tenant import reference accepted';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.results(organization_id,finding_id,title) values(
      current_setting('test.org_b')::uuid,current_setting('test.finding')::uuid,'Cross tenant');
    raise exception 'TEST FAILED: cross-tenant result accepted';
  exception when check_violation then
    if sqlerrm <> 'finding_not_found' then raise; end if;
  end;
  begin
    update public.audit_findings set status='implemented' where id=current_setting('test.finding')::uuid;
    raise exception 'TEST FAILED: bypassed approval';
  exception when check_violation then null; end;
end $$;

update public.audit_findings set status='approved' where id=current_setting('test.finding')::uuid;
select set_config('test.approved_at',(select approved_at::text from public.audit_findings where id=current_setting('test.finding')::uuid),true);
insert into public.results(organization_id,finding_id,title,baseline_value,result_value,attributed_value,notes)
values(current_setting('test.org_a')::uuid,current_setting('test.finding')::uuid,'Synthetic result',1000,900,100,'Synthetic only');

do $$ declare repeated_id uuid; begin
  select id into repeated_id from public.persist_profit_audit(current_setting('test.org_a')::uuid,
    current_setting('test.import_a')::uuid,'[{"findingType":"changed","title":"Do not replace"}]',1);
  if repeated_id <> current_setting('test.finding')::uuid then raise exception 'TEST FAILED: rerun replaced finding'; end if;
  if not exists(select 1 from public.audit_findings where id=repeated_id and status='implemented'
    and approved_at=current_setting('test.approved_at')::timestamptz and title='Synthetic baseline') then
    raise exception 'TEST FAILED: evidence or approval changed';
  end if;
  if (select count(*) from public.results where finding_id=repeated_id) <> 1 then raise exception 'TEST FAILED: result lost'; end if;
  if (select count(*) from public.audit_events where organization_id=current_setting('test.org_a')::uuid
    and event_type in ('finding_status_changed','result_recorded','profit_audit_created')) <> 4 then
    raise exception 'TEST FAILED: audit events incomplete';
  end if;
  begin
    insert into public.results(organization_id,finding_id,title) values(current_setting('test.org_a')::uuid,repeated_id,'Duplicate');
    raise exception 'TEST FAILED: duplicate result accepted';
  exception when check_violation then null; end;
  begin
    delete from public.audit_findings where id=repeated_id;
    raise exception 'TEST FAILED: evidence deleted';
  exception when insufficient_privilege then null; end;
  begin
    update public.audit_findings set title='Rewritten' where id=repeated_id;
    raise exception 'TEST FAILED: evidence rewritten';
  exception when check_violation then null; end;
  begin
    insert into public.financial_rows(organization_id,import_id,transaction_date,account,amount)
    values(current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'2026-10-02','Late',50);
    raise exception 'TEST FAILED: audited input modified';
  exception when check_violation then null; end;
end $$;

-- An authenticated outsider must neither see nor operate on the other tenant.
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ begin
  if exists(select 1 from public.audit_findings where id=current_setting('test.finding')::uuid) then
    raise exception 'TEST FAILED: outsider read findings';
  end if;
  begin
    perform public.persist_profit_audit(current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'[]',1);
    raise exception 'TEST FAILED: outsider audit accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Viewer may read, but cannot approve or record results. No permanent users are created.
insert into public.memberships(organization_id,user_id,role)
values(current_setting('test.org_a')::uuid,auth.uid(),'viewer');
set local role authenticated;
do $$ declare changed integer; begin
  if not exists(select 1 from public.audit_findings where id=current_setting('test.finding')::uuid) then
    raise exception 'TEST FAILED: viewer cannot read';
  end if;
  update public.audit_findings set status='approved' where id=current_setting('test.finding')::uuid;
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'TEST FAILED: viewer changed finding'; end if;
  begin
    insert into public.results(organization_id,finding_id,title) values(
      current_setting('test.org_a')::uuid,current_setting('test.finding')::uuid,'Viewer result');
    raise exception 'TEST FAILED: viewer inserted result';
  exception when insufficient_privilege then null; end;
  begin
    perform public.persist_profit_audit(current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'[]',1);
    raise exception 'TEST FAILED: viewer ran audit';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform public.persist_profit_audit(current_setting('test.org_a')::uuid,current_setting('test.import_a')::uuid,'[]',1);
    raise exception 'TEST FAILED: anonymous audit accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
