-- Synthetic-only regression suite; all fixtures roll back.
begin;
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
select set_config('test.demo_org',public.create_organization('Synthetic fixed demo')::text,true);
select set_config('test.demo_id',public.create_demo_import(current_setting('test.demo_org')::uuid)::text,true);
do $$ declare demo uuid := current_setting('test.demo_id')::uuid; begin
  if public.create_demo_import(current_setting('test.demo_org')::uuid) <> demo then
    raise exception 'TEST FAILED: repeated request created a duplicate'; end if;
  if (select count(*) from public.financial_rows where import_id=demo) <> 8
    or (select sum(amount) from public.financial_rows where import_id=demo) <> 36000
    or (select count(*) from public.financial_rows where import_id=demo and description like 'Syntetisk demo:%') <> 8 then
    raise exception 'TEST FAILED: fixed fixture changed'; end if;
  if (select count(*) from public.audit_events where entity_id=demo and event_type='financial_import_committed') <> 1 then
    raise exception 'TEST FAILED: duplicate import event'; end if;
  begin
    perform public.commit_financial_import(current_setting('test.demo_org')::uuid,'arbitrary.csv','[]',true);
    raise exception 'TEST FAILED: synthetic flag bypassed gate';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.imports(organization_id,uploaded_by,original_filename,status)
    values(current_setting('test.demo_org')::uuid,auth.uid(),'arbitrary.csv','complete');
    raise exception 'TEST FAILED: direct import insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.financial_rows(organization_id,import_id,transaction_date,account,amount)
    values(current_setting('test.demo_org')::uuid,demo,'2026-09-30','Arbitrary',999999);
    raise exception 'TEST FAILED: direct row insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.financial_rows set amount=123 where import_id=demo;
    raise exception 'TEST FAILED: fixture update allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.imports set original_filename='arbitrary' where id=demo;
    raise exception 'TEST FAILED: import metadata update allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects(bucket_id,name)
    values('financial-imports',current_setting('test.demo_org') || '/arbitrary.csv');
    raise exception 'TEST FAILED: storage upload allowed';
  exception when insufficient_privilege then null; end;
  begin
    select import_id into demo from private.fixed_demo_imports;
    raise exception 'TEST FAILED: private mapping exposed';
  exception when insufficient_privilege then null; end;
end $$;
-- Deny an authenticated outsider even via the private function.
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
do $$ begin
  begin
    perform public.create_demo_import(current_setting('test.demo_org')::uuid);
    raise exception 'TEST FAILED: outsider demo allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform private.create_fixed_demo_import(current_setting('test.demo_org')::uuid);
    raise exception 'TEST FAILED: private function bypass';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
insert into public.memberships(organization_id,user_id,role)
values(current_setting('test.demo_org')::uuid,auth.uid(),'viewer');
set local role authenticated;
do $$ begin
  begin
    perform public.create_demo_import(current_setting('test.demo_org')::uuid);
    raise exception 'TEST FAILED: viewer demo allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Both writer roles may reuse the fixture, without duplicating it.
update public.memberships set role='member' where organization_id=current_setting('test.demo_org')::uuid and user_id=auth.uid();
set local role authenticated;
do $$ begin
  if public.create_demo_import(current_setting('test.demo_org')::uuid) <> current_setting('test.demo_id')::uuid then
    raise exception 'TEST FAILED: member demo failed'; end if;
end $$;
reset role;
update public.memberships set role='admin' where organization_id=current_setting('test.demo_org')::uuid and user_id=auth.uid();
set local role authenticated;
do $$ begin
  if public.create_demo_import(current_setting('test.demo_org')::uuid) <> current_setting('test.demo_id')::uuid then
    raise exception 'TEST FAILED: admin demo failed'; end if;
end $$;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
  begin
    perform public.create_demo_import(current_setting('test.demo_org')::uuid);
    raise exception 'TEST FAILED: missing uid allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform public.create_demo_import(current_setting('test.demo_org')::uuid);
    raise exception 'TEST FAILED: anonymous demo allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
