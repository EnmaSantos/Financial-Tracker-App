-- Initial Supabase schema for the real app.
-- This migration moves app-owned identity to Supabase Auth (`auth.users`)
-- and keeps financial data in `public.*` tables protected by RLS.

begin;

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type public.account_type as enum ('cash', 'investment', 'debt');
  end if;

  if not exists (select 1 from pg_type where typname = 'goal_kind') then
    create type public.goal_kind as enum ('debt', 'purchase');
  end if;

  if not exists (select 1 from pg_type where typname = 'txn_category') then
    create type public.txn_category as enum (
      'groceries',
      'transport',
      'income',
      'subscriptions',
      'housing',
      'dining',
      'shopping',
      'health',
      'transfer',
      'other'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_name text;
begin
  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(split_part(coalesce(new.email, ''), '@', 1)), ''),
    'Member'
  );

  insert into public.profiles (
    id,
    email,
    name
  ) values (
    new.id,
    new.email,
    resolved_name
  )
  on conflict (id) do update
  set
    email = excluded.email,
    name = coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      public.profiles.name
    ),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  name text not null,
  age integer not null default 26 check (age > 0),
  retire_age integer not null default 55,
  return_rate numeric(5, 2) not null default 6.50,
  joined_year integer not null default extract(year from current_date)::integer,
  income_net numeric(12, 2) not null default 0,
  income_gross numeric(12, 2) not null default 0,
  expenses_monthly numeric(12, 2) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  institution text not null,
  type public.account_type not null,
  balance numeric(14, 2) not null,
  updated text not null default 'just now',
  apr numeric(6, 2),
  monthly numeric(12, 2),
  color text not null default 'chart-1',
  promo_ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  kind public.goal_kind not null,
  target numeric(14, 2) not null,
  current numeric(14, 2) not null,
  eta text not null,
  monthly numeric(12, 2) not null,
  projected text not null,
  on_track boolean not null default true,
  apr numeric(6, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  year integer not null,
  label text not null,
  value numeric(14, 2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  date date not null,
  merchant text not null,
  category public.txn_category not null,
  amount numeric(14, 2) not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists accounts_user_id_idx on public.accounts (user_id);
create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists milestones_user_id_year_idx on public.milestones (user_id, year);
create index if not exists transactions_user_id_date_idx on public.transactions (user_id, date desc);
create index if not exists transactions_account_id_idx on public.transactions (account_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_accounts_updated_at on public.accounts;
create trigger set_accounts_updated_at
before update on public.accounts
for each row
execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at
before update on public.goals
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_synced on auth.users;
create trigger on_auth_user_synced
after insert or update of email, raw_user_meta_data on auth.users
for each row
execute function public.sync_profile_from_auth_user();

insert into public.profiles (id, email, name)
select
  user_row.id,
  user_row.email,
  coalesce(
    nullif(trim(user_row.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(split_part(coalesce(user_row.email, ''), '@', 1)), ''),
    'Member'
  )
from auth.users as user_row
on conflict (id) do update
set
  email = excluded.email,
  name = excluded.name,
  updated_at = timezone('utc', now());

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.goals enable row level security;
alter table public.milestones enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "accounts_select_own" on public.accounts;
create policy "accounts_select_own"
on public.accounts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "accounts_insert_own" on public.accounts;
create policy "accounts_insert_own"
on public.accounts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "accounts_update_own" on public.accounts;
create policy "accounts_update_own"
on public.accounts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_delete_own"
on public.accounts
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own"
on public.goals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own"
on public.goals
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own"
on public.goals
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own"
on public.goals
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "milestones_select_own" on public.milestones;
create policy "milestones_select_own"
on public.milestones
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "milestones_insert_own" on public.milestones;
create policy "milestones_insert_own"
on public.milestones
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "milestones_update_own" on public.milestones;
create policy "milestones_update_own"
on public.milestones
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "milestones_delete_own" on public.milestones;
create policy "milestones_delete_own"
on public.milestones
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
on public.transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);

commit;
