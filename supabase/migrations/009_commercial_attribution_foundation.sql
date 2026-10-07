-- Commercial attribution, subscriptions and recurring commission foundation.
-- Applied to the connected Supabase project as commercial_attribution_foundation.
-- Tables are deliberately deny-by-default unless an explicit tenant-safe read policy exists.

create table if not exists public.sales_channels (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, channel_type text not null check (channel_type in ('direct','partner','agency','adviser','inbound','integration','other')), active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.partners (id uuid primary key default gen_random_uuid(), name text not null, partner_type text not null check (partner_type in ('referral','strategic','agency','adviser','other')), status text not null default 'active' check (status in ('pending','active','paused','terminated')), agreement_version text, created_at timestamptz not null default now());
create table if not exists public.partner_agents (id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id) on delete cascade, name text not null, email text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.leads (id uuid primary key default gen_random_uuid(), sales_channel_id uuid references public.sales_channels(id), partner_id uuid references public.partners(id), partner_agent_id uuid references public.partner_agents(id), company_name text not null, contact_name text, contact_email text, status text not null default 'new' check (status in ('new','qualified','audit','offered','won','lost')), attributed_at timestamptz not null default now(), created_at timestamptz not null default now());
create table if not exists public.customer_attributions (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, sales_channel_id uuid references public.sales_channels(id), partner_id uuid references public.partners(id), partner_agent_id uuid references public.partner_agents(id), effective_from timestamptz not null default now(), effective_to timestamptz, change_reason text, created_at timestamptz not null default now(), check (effective_to is null or effective_to > effective_from));
create unique index if not exists customer_attributions_active_org_idx on public.customer_attributions(organization_id) where effective_to is null;
create table if not exists public.commission_plans (id uuid primary key default gen_random_uuid(), name text not null, percentage numeric(7,4) not null check (percentage >= 0 and percentage <= 100), effective_from timestamptz not null default now(), effective_to timestamptz, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.subscriptions (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, provider text not null default 'stripe', external_customer_id text, external_subscription_id text unique, plan_code text not null, amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'DKK', status text not null check (status in ('trialing','active','past_due','paused','canceled','unpaid','incomplete')), billing_interval text not null default 'month', current_period_start timestamptz, current_period_end timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.payment_events (id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id) on delete cascade, subscription_id uuid references public.subscriptions(id) on delete set null, provider text not null default 'stripe', provider_event_id text not null unique, provider_payment_id text, event_type text not null, amount_minor bigint not null default 0, currency text not null default 'DKK', payment_status text not null check (payment_status in ('paid','failed','refunded','reversed','pending')), occurred_at timestamptz not null, created_at timestamptz not null default now());
create table if not exists public.commission_ledger (id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id), partner_agent_id uuid references public.partner_agents(id), organization_id uuid not null references public.organizations(id), payment_event_id uuid not null references public.payment_events(id), commission_plan_id uuid references public.commission_plans(id), entry_type text not null check (entry_type in ('earned','reversal','paid_adjustment')), base_amount_minor bigint not null, commission_amount_minor bigint not null, currency text not null default 'DKK', created_at timestamptz not null default now(), unique (payment_event_id, partner_id, entry_type));
create table if not exists public.partner_payouts (id uuid primary key default gen_random_uuid(), partner_id uuid not null references public.partners(id), amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'DKK', status text not null default 'pending' check (status in ('pending','approved','processing','paid','failed')), provider_reference text, period_start date, period_end date, paid_at timestamptz, created_at timestamptz not null default now());

create index if not exists leads_partner_idx on public.leads(partner_id, partner_agent_id);
create index if not exists subscriptions_org_idx on public.subscriptions(organization_id);
create index if not exists payment_events_org_idx on public.payment_events(organization_id, occurred_at desc);
create index if not exists commission_ledger_partner_idx on public.commission_ledger(partner_id, created_at desc);

alter table public.sales_channels enable row level security;
alter table public.partners enable row level security;
alter table public.partner_agents enable row level security;
alter table public.leads enable row level security;
alter table public.customer_attributions enable row level security;
alter table public.commission_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_events enable row level security;
alter table public.commission_ledger enable row level security;
alter table public.partner_payouts enable row level security;

grant select on public.sales_channels, public.partners, public.partner_agents, public.commission_plans to authenticated;
grant select on public.customer_attributions, public.subscriptions, public.payment_events to authenticated;

create policy "members can view customer attribution" on public.customer_attributions for select to authenticated using ((select private.is_org_member(organization_id)));
create policy "members can view subscriptions" on public.subscriptions for select to authenticated using ((select private.is_org_member(organization_id)));
create policy "members can view payment events" on public.payment_events for select to authenticated using ((select private.is_org_member(organization_id)));
