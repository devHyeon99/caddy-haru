begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(20);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'round_entries', 'round_entries table exists');
select col_is_pk('public', 'profiles', 'user_id', 'profiles uses user_id as primary key');
select col_is_pk('public', 'round_entries', 'id', 'round_entries uses id as primary key');
select has_index(
  'public',
  'round_entries',
  'round_entries_user_date_idx',
  'round entries have a user and date index'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.round_entries'::regclass),
  true,
  'round_entries has RLS enabled'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'profiles'),
  4,
  'profiles defines CRUD policies'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'public' and tablename = 'round_entries'),
  4,
  'round_entries defines CRUD policies'
);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'first@example.com',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated',
    'authenticated',
    'second@example.com',
    '',
    now(),
    '{}',
    '{}',
    now(),
    now()
  );

insert into public.profiles (user_id, course_name, default_caddie_fee)
values
  ('11111111-1111-1111-1111-111111111111', '첫 번째 골프장', 150000),
  ('22222222-2222-2222-2222-222222222222', '두 번째 골프장', 160000);

insert into public.round_entries (
  user_id,
  work_date,
  caddie_fee,
  over_fee,
  payment_method,
  course_name_snapshot
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    current_date,
    150000,
    20000,
    'cash',
    '첫 번째 골프장'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    current_date,
    160000,
    0,
    'transfer',
    '두 번째 골프장'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

select is(
  (select count(*)::integer from public.profiles),
  1,
  'an authenticated user sees only their profile'
);
select is(
  (select count(*)::integer from public.round_entries),
  1,
  'an authenticated user sees only their rounds'
);

update public.profiles
set course_name = '변조된 골프장'
where user_id = '22222222-2222-2222-2222-222222222222';

delete from public.round_entries
where user_id = '22222222-2222-2222-2222-222222222222';

insert into public.round_entries (
  work_date,
  caddie_fee,
  over_fee,
  payment_method,
  course_name_snapshot
)
values (current_date, 150000, 10000, 'cash', '첫 번째 골프장');

select is(
  (select count(*)::integer from public.round_entries),
  2,
  'an authenticated user can insert their own round using auth.uid()'
);

update public.round_entries
set memo = '수정된 기록'
where over_fee = 10000;

select is(
  (select memo from public.round_entries where over_fee = 10000),
  '수정된 기록',
  'an authenticated user can update their own round'
);

delete from public.round_entries
where memo = '수정된 기록';

select is(
  (select count(*)::integer from public.round_entries),
  1,
  'an authenticated user can delete their own round'
);

reset role;

select is(
  (select course_name from public.profiles where user_id = '22222222-2222-2222-2222-222222222222'),
  '두 번째 골프장',
  'a user cannot update another profile'
);
select is(
  (
    select count(*)::integer
    from public.round_entries
    where user_id = '22222222-2222-2222-2222-222222222222'
  ),
  1,
  'a user cannot delete another round'
);

select ok(
  (select 0 <= all (over_fee_presets) from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  'over fee presets are non-negative'
);
select ok(
  (select work_date <= current_date from public.round_entries where id = (
    select id from public.round_entries where user_id = '11111111-1111-1111-1111-111111111111' order by created_at limit 1
  )),
  'stored work dates are not in the future'
);

delete from auth.users where id = '11111111-1111-1111-1111-111111111111';

select is(
  (select count(*)::integer from public.profiles where user_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'deleting an auth user removes their profile'
);
select is(
  (select count(*)::integer from public.round_entries where user_id = '11111111-1111-1111-1111-111111111111'),
  0,
  'deleting an auth user removes their rounds'
);

select * from finish();
rollback;
