-- work_date check constraint was using current_date (UTC), which rejects today's
-- date when the user is in Korea (UTC+9) during the hours 00:00–09:00 KST.
-- Replace it with a Seoul-timezone-aware comparison.
alter table public.round_entries
  drop constraint round_entries_work_date_check;

alter table public.round_entries
  add constraint round_entries_work_date_check
  check (work_date <= (current_timestamp at time zone 'Asia/Seoul')::date);
