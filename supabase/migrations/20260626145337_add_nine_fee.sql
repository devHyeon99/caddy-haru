alter table public.round_entries
  add column nine_fee integer not null default 0
    check (nine_fee between 0 and 10000000);
