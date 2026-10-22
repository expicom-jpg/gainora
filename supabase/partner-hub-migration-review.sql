-- Gainora Partner Hub: stage migration for review before deployment.
-- New partner logins default to no access until explicitly provisioned by an administrator.
alter table public.partners
  add column if not exists introduced_by_partner_id uuid references public.partners(id);
alter table public.partners
  add constraint partners_cannot_self_introduce check (introduced_by_partner_id is null or introduced_by_partner_id <> id);

create table if not exists public.partner_members (
 id uuid primary key default gen_random_uuid(),
 partner_id uuid not null references public.partners(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','seller','viewer')),
 created_at timestamptz not null default now(),
 unique (partner_id,user_id)
);
create index if not exists partner_members_user_idx on public.partner_members(user_id);
create index if not exists leads_partner_created_idx on public.leads(partner_id,created_at desc);
create index if not exists ledger_partner_created_idx on public.commission_ledger(partner_id,created_at desc);
create unique index if not exists commission_payment_partner_kind_uniq on public.commission_ledger(payment_event_id,partner_id,entry_type);

alter table public.partner_members enable row level security;
alter table public.partners enable row level security;
alter table public.partner_agents enable row level security;
alter table public.leads enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.partner_payouts enable row level security;

-- Authentication is distinct from authorization. No anonymous access.
grant select on public.partner_members,public.partners,public.partner_agents,public.leads,public.commission_ledger,public.partner_payouts to authenticated;
grant insert on public.leads to authenticated;
revoke update,delete on public.partner_members,public.partners,public.partner_agents,public.leads,public.commission_ledger,public.partner_payouts from authenticated;

create policy partner_members_own_read on public.partner_members for select to authenticated
 using (user_id=(select auth.uid()));

create policy partner_own_read on public.partners for select to authenticated
 using (exists(select 1 from public.partner_members m where m.partner_id=partners.id and m.user_id=(select auth.uid())));

create policy partner_agents_own_read on public.partner_agents for select to authenticated
 using (exists(select 1 from public.partner_members m where m.partner_id=partner_agents.partner_id and m.user_id=(select auth.uid())));

create policy partner_leads_own_read on public.leads for select to authenticated
 using (exists(select 1 from public.partner_members m where m.partner_id=leads.partner_id and m.user_id=(select auth.uid())));

-- Only direct partner sales admins/sellers can submit their own new leads.
create policy partner_leads_self_insert on public.leads for insert to authenticated
 with check (partner_id is not null and partner_agent_id is null and sales_channel_id is null
 and status='new'
 and exists(select 1 from public.partner_members m where m.partner_id=leads.partner_id and m.user_id=(select auth.uid()) and m.role in ('admin','seller')));

-- Ledger and payouts can be READ only by the commission beneficiary. Writes remain server-side.
create policy partner_ledger_own_read on public.commission_ledger for select to authenticated
 using (exists(select 1 from public.partner_members m where m.partner_id=commission_ledger.partner_id and m.user_id=(select auth.uid())));
create policy partner_payouts_own_read on public.partner_payouts for select to authenticated
 using (exists(select 1 from public.partner_members m where m.partner_id=partner_payouts.partner_id and m.user_id=(select auth.uid())));

-- No partner-user permission to insert payment events or commission ledger entries.
-- Admin provision of partner_members and partner hierarchy must be performed by trusted back office.
-- TODO before rollout: test deny access for unrelated signed-in users, multi-memberships, 
-- refunds and payout reconciliation. Do not apply to production without security review.
