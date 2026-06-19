create type public.theme_mode as enum ('system', 'light', 'dark');
create type public.payment_method as enum ('cash', 'transfer');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  course_name text not null
    check (char_length(btrim(course_name)) between 1 and 100),
  default_caddie_fee integer not null
    check (default_caddie_fee between 0 and 10000000),
  over_fee_presets integer[] not null default array[10000, 20000, 30000]
    check (
      cardinality(over_fee_presets) between 1 and 6
      and array_position(over_fee_presets, null) is null
      and 0 <= all (over_fee_presets)
      and 10000000 >= all (over_fee_presets)
    ),
  theme_mode public.theme_mode not null default 'system',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.round_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users(id) on delete cascade,
  work_date date not null check (work_date <= current_date),
  caddie_fee integer not null
    check (caddie_fee between 0 and 10000000),
  over_fee integer not null default 0
    check (over_fee between 0 and 10000000),
  payment_method public.payment_method not null,
  course_name_snapshot text not null
    check (char_length(btrim(course_name_snapshot)) between 1 and 100),
  memo text check (memo is null or char_length(memo) <= 500),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index round_entries_user_date_idx
  on public.round_entries (user_id, work_date desc);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger round_entries_set_updated_at
before update on public.round_entries
for each row execute function private.set_updated_at();

alter table public.profiles enable row level security;
alter table public.round_entries enable row level security;

revoke all on public.profiles from anon;
revoke all on public.round_entries from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.round_entries to authenticated;
grant usage on type public.theme_mode to authenticated;
grant usage on type public.payment_method to authenticated;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "round_entries_select_own"
on public.round_entries
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "round_entries_insert_own"
on public.round_entries
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "round_entries_update_own"
on public.round_entries
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "round_entries_delete_own"
on public.round_entries
for delete
to authenticated
using ((select auth.uid()) = user_id);
