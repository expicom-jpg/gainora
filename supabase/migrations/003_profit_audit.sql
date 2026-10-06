create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_id uuid references public.imports(id) on delete set null,
  finding_type text not null,
  title text not null,
  description text not null default '',
  estimated_annual_value numeric(18,2),
  status text not null default 'identified' check (status in ('identified','approved','rejected','implemented')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  finding_id uuid references public.audit_findings(id) on delete set null,
  title text not null,
  baseline_value numeric(18,2),
  result_value numeric(18,2),
  attributed_value numeric(18,2),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists audit_findings_org_id_idx on public.audit_findings(organization_id);
create index if not exists results_org_id_idx on public.results(organization_id);

alter table public.audit_findings enable row level security;
alter table public.results enable row level security;

grant select, insert, update, delete on public.audit_findings to authenticated;
grant select, insert, update, delete on public.results to authenticated;

create policy "members can view findings"
on public.audit_findings
for select
to authenticated
using ((select private.is_org_member(organization_id)));

create policy "members can manage findings"
on public.audit_findings
for all
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])))
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));

create policy "members can view results"
on public.results
for select
to authenticated
using ((select private.is_org_member(organization_id)));

create policy "members can manage results"
on public.results
for all
to authenticated
using ((select private.has_org_role(organization_id, array['owner','admin','member'])))
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));
