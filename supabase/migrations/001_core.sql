create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  uploaded_by uuid not null,
  original_filename text not null,
  storage_path text,
  status text not null default 'pending',
  original_file_delete_after timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.imports enable row level security;
alter table public.audit_events enable row level security;

create policy "members can view organization"
on public.organizations
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

create policy "members can view memberships"
on public.memberships
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = memberships.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "members can view imports"
on public.imports
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = imports.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "admins can insert imports"
on public.imports
for insert
with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = imports.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner','admin','member')
  )
);

create policy "members can view audit events"
on public.audit_events
for select
using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = audit_events.organization_id
      and m.user_id = auth.uid()
  )
);
