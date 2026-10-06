create index if not exists audit_findings_import_id_idx
on public.audit_findings(import_id);

create index if not exists results_finding_id_idx
on public.results(finding_id);

drop policy if exists "members can manage findings" on public.audit_findings;

create policy "members can insert findings"
on public.audit_findings
for insert
to authenticated
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));

create policy "members can update findings"
on public.audit_findings
for update
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])))
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));

create policy "members can delete findings"
on public.audit_findings
for delete
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])));

drop policy if exists "members can manage results" on public.results;

create policy "members can insert results"
on public.results
for insert
to authenticated
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));

create policy "members can update results"
on public.results
for update
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])))
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));

create policy "members can delete results"
on public.results
for delete
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])));
