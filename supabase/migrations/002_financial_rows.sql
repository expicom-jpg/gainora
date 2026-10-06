create table if not exists public.financial_rows (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  import_id uuid not null references public.imports(id) on delete cascade,
  transaction_date date not null,
  account text not null,
  description text not null default '',
  amount numeric(18,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists financial_rows_org_id_idx on public.financial_rows(organization_id);
create index if not exists financial_rows_import_id_idx on public.financial_rows(import_id);

alter table public.financial_rows enable row level security;
grant select, insert on public.financial_rows to authenticated;

create policy "members can view financial rows"
on public.financial_rows
for select
to authenticated
using ((select private.is_org_member(organization_id)));

create policy "members can insert financial rows"
on public.financial_rows
for insert
to authenticated
with check ((select private.has_org_role(organization_id, array['owner','admin','member'])));
