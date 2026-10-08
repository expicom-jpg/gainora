-- Preserve evidence and enforce tenant-consistent references at the DB boundary.
alter table public.imports add constraint imports_id_org_unique unique (id, organization_id);
alter table public.audit_findings add constraint findings_id_org_unique unique (id, organization_id);
alter table public.financial_rows add constraint financial_rows_import_tenant_fk
  foreign key (import_id, organization_id) references public.imports(id, organization_id);
alter table public.audit_findings add constraint findings_import_tenant_fk
  foreign key (import_id, organization_id) references public.imports(id, organization_id);
alter table public.results add constraint results_finding_tenant_fk
  foreign key (finding_id, organization_id) references public.audit_findings(id, organization_id);

-- Evidence deletion/correction requires a separately reviewed administrative process.
revoke delete on public.imports, public.audit_findings from authenticated;
revoke update, delete on public.results from authenticated;

create function private.guard_finding_transition()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    if new.status <> 'identified' or new.approved_at is not null or new.approved_by is not null then
      raise exception 'initial_finding_must_be_identified' using errcode='23514';
    end if;
    return new;
  end if;
  if (new.organization_id, new.import_id, new.finding_type, new.title, new.description,
      new.estimated_annual_value, new.id, new.created_at)
     is distinct from
     (old.organization_id, old.import_id, old.finding_type, old.title, old.description,
      old.estimated_annual_value, old.id, old.created_at) then
    raise exception 'finding_evidence_immutable' using errcode='23514';
  end if;
  if new.status = old.status then
    new.approved_at := old.approved_at;
    new.approved_by := old.approved_by;
    return new;
  end if;
  if old.status = 'identified' and new.status in ('approved','rejected') then
    new.approved_at := case when new.status='approved' then now() else null end;
    new.approved_by := case when new.status='approved' then auth.uid() else null end;
  elsif old.status = 'approved' and new.status = 'implemented' and exists (
    select 1 from public.results r where r.finding_id=old.id and r.organization_id=old.organization_id
  ) then
    new.approved_at := old.approved_at;
    new.approved_by := old.approved_by;
  else
    raise exception 'invalid_finding_transition' using errcode='23514';
  end if;
  insert into public.audit_events(organization_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(new.organization_id,auth.uid(),'finding_status_changed','finding',new.id,
    jsonb_build_object('from',old.status,'to',new.status));
  return new;
end;
$$;
revoke all on function private.guard_finding_transition() from public, anon, authenticated;
create trigger guard_finding_transition before insert or update on public.audit_findings
  for each row execute function private.guard_finding_transition();

create function private.require_approved_result()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare finding_status text;
begin
  if auth.uid() is null or not private.has_org_role(new.organization_id,array['owner','admin','member']) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  select status into finding_status from public.audit_findings
    where id=new.finding_id and organization_id=new.organization_id for update;
  if not found then raise exception 'finding_not_found' using errcode='23514'; end if;
  if finding_status <> 'approved' then
    raise exception 'finding_not_approved' using errcode='23514';
  end if;
  if length(trim(new.title)) not between 2 and 160 or length(new.notes)>4000 then
    raise exception 'invalid_result' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function private.require_approved_result() from public, anon, authenticated;
create trigger require_approved_result before insert on public.results
  for each row execute function private.require_approved_result();

create function private.complete_result()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.audit_findings set status='implemented'
    where id=new.finding_id and organization_id=new.organization_id;
  if not found then raise exception 'finding_not_found' using errcode='23514'; end if;
  insert into public.audit_events(organization_id,actor_user_id,event_type,entity_type,entity_id,metadata)
  values(new.organization_id,auth.uid(),'result_recorded','result',new.id,
    jsonb_build_object('finding_id',new.finding_id));
  return new;
end;
$$;
revoke all on function private.complete_result() from public, anon, authenticated;
create trigger complete_result after insert on public.results
  for each row execute function private.complete_result();

-- Both import append and audit creation lock the same parent. An audited import is immutable.
create function private.guard_financial_row_append()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.imports where id=new.import_id and organization_id=new.organization_id for update;
  if not found then raise exception 'import_not_found' using errcode='23514'; end if;
  if exists(select 1 from public.audit_findings where import_id=new.import_id and organization_id=new.organization_id) then
    raise exception 'audited_import_immutable' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_financial_row_append() from public, anon, authenticated;
create trigger guard_financial_row_append before insert on public.financial_rows
  for each row execute function private.guard_financial_row_append();

create function public.persist_profit_audit(target_org uuid, target_import uuid, proposed_findings jsonb, input_row_count integer)
returns setof public.audit_findings language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_org_role(target_org,array['owner','admin','member']) then
    raise exception 'forbidden' using errcode='42501';
  end if;
  perform 1 from public.imports where id=target_import and organization_id=target_org for update;
  if not found then raise exception 'import_not_found' using errcode='23514'; end if;
  if input_row_count is null or input_row_count <> (select count(*) from public.financial_rows where import_id=target_import and organization_id=target_org) then
    raise exception 'audit_rows_changed' using errcode='23514';
  end if;
  if not exists(select 1 from public.financial_rows where import_id=target_import and organization_id=target_org) then
    raise exception 'no_rows' using errcode='23514';
  end if;
  if not exists(select 1 from public.audit_findings where import_id=target_import and organization_id=target_org) then
    if jsonb_typeof(proposed_findings) is distinct from 'array' then
      raise exception 'invalid_findings' using errcode='23514';
    end if;
    if jsonb_array_length(proposed_findings) not between 1 and 100 then
      raise exception 'invalid_findings' using errcode='23514';
    end if;
    insert into public.audit_findings(organization_id,import_id,finding_type,title,description,estimated_annual_value)
    select target_org,target_import,f->>'findingType',f->>'title',coalesce(f->>'description',''),
      (f->>'estimatedAnnualValue')::numeric
      from jsonb_array_elements(proposed_findings) f;
    insert into public.audit_events(organization_id,actor_user_id,event_type,entity_type,entity_id,metadata)
    values(target_org,auth.uid(),'profit_audit_created','import',target_import,
      jsonb_build_object('finding_count',jsonb_array_length(proposed_findings)));
  end if;
  -- Existing IDs, approvals and linked results are returned unchanged on rerun.
  return query select * from public.audit_findings
    where organization_id=target_org and import_id=target_import order by created_at,id;
end;
$$;
revoke all on function public.persist_profit_audit(uuid,uuid,jsonb,integer) from public,anon;
grant execute on function public.persist_profit_audit(uuid,uuid,jsonb,integer) to authenticated;
