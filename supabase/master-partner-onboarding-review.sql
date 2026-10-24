-- REVIEW ONLY. Do not apply without testing roles, existing policies and migrations.
-- Gainora's single Master is provisioned out-of-band, never through a web form.
create table if not exists public.gainora_master_users (
 user_id uuid primary key references auth.users(id) on delete restrict,
 created_at timestamptz not null default now()
);
create unique index if not exists gainora_one_master on public.gainora_master_users ((true));
alter table public.gainora_master_users enable row level security;
revoke all on public.gainora_master_users from anon, authenticated;
grant select on public.gainora_master_users to authenticated;
drop policy if exists master_can_see_self on public.gainora_master_users;
create policy master_can_see_self on public.gainora_master_users for select to authenticated
 using (user_id = (select auth.uid()));
-- Bootstrap once by a verified database owner:
-- insert into public.gainora_master_users(user_id) values ('<verified owner auth user uuid>');
-- No self-service insert/update/delete grants or policies exist.

create table if not exists public.gainora_partner_approvals (
 id uuid primary key default gen_random_uuid(),
 partner_name text not null check (char_length(partner_name) between 2 and 120),
 contact_email text not null check (char_length(contact_email) between 3 and 254),
 proposed_mail_local_part text not null check (proposed_mail_local_part ~ '^[a-z0-9][a-z0-9._-]{1,62}$'),
 introducer_partner_id uuid references public.partners(id),
 agreement_reference text not null check (char_length(agreement_reference) between 3 and 200),
 requested_permissions text[] not null default '{}',
 state text not null default 'draft' check (state in ('draft','approved_pending_provisioning','provisioning','active','provisioning_failed','rejected')),
 master_user_id uuid not null references auth.users(id),
 approved_at timestamptz,
 provider_account_id text,
 provider_email text,
 failure_code text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint approved_has_date check (state not in ('approved_pending_provisioning','provisioning','active') or approved_at is not null)
);
create index if not exists gainora_partner_approvals_state_created_idx
 on public.gainora_partner_approvals(state,created_at desc);
alter table public.gainora_partner_approvals enable row level security;
revoke all on public.gainora_partner_approvals from anon, authenticated;
grant select,insert on public.gainora_partner_approvals to authenticated;
drop policy if exists gainora_master_approval_read on public.gainora_partner_approvals;
create policy gainora_master_approval_read on public.gainora_partner_approvals for select to authenticated
 using (exists (select 1 from public.gainora_master_users m where m.user_id=(select auth.uid())));
drop policy if exists gainora_master_approval_insert on public.gainora_partner_approvals;
create policy gainora_master_approval_insert on public.gainora_partner_approvals for insert to authenticated
 with check (
  master_user_id=(select auth.uid())
  and state='approved_pending_provisioning'
  and approved_at is not null
  and provider_account_id is null
  and provider_email is null
  and failure_code is null
  and requested_permissions <@ array['partner_leads','partner_calendar','partner_email','partner_downline_read']::text[]
  and exists (select 1 from public.gainora_master_users m where m.user_id=(select auth.uid()))
 );
-- Changes in provisioning state and creation of partner memberships MUST be performed
-- by a trusted backend with verified Master decision, idempotency and audit logging.
-- No authenticated UPDATE/DELETE permission: Master cannot forge provider success.
-- Dedicated audit stream and Google integration required before live rollout.
