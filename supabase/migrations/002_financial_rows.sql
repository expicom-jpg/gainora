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

alter table public.financial_rows enable row level security;

create policy "members can view financial rows"
on public.financial_rows
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = financial_rows.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can insert financial rows"
on public.financial_rows
for insert
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = financial_rows.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','member')
  )
);
