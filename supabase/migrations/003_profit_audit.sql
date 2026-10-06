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

alter table public.audit_findings enable row level security;
alter table public.results enable row level security;

create policy "members can view findings"
on public.audit_findings
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = audit_findings.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "admins can manage findings"
on public.audit_findings
for all
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = audit_findings.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','member')
  )
)
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = audit_findings.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','member')
  )
);

create policy "members can view results"
on public.results
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = results.organization_id
      and m.user_id = auth.uid()
  )
);
