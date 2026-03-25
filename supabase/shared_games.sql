create table if not exists public.shared_games (
  share_id text primary key,
  opponent text,
  scouting boolean not null default false,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.shared_games enable row level security;

drop policy if exists "shared_games_select_anon" on public.shared_games;
create policy "shared_games_select_anon"
on public.shared_games
for select
to anon
using (true);

drop policy if exists "shared_games_insert_anon" on public.shared_games;
create policy "shared_games_insert_anon"
on public.shared_games
for insert
to anon
with check (true);
