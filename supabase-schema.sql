-- Выполните в SQL Editor Supabase

create table if not exists public.roulette_state (
  id bigint primary key check (id = 1),
  participants text[] not null default '{}',
  absent text[] not null default '{}',
  current_winner text not null default '',
  last_winners text[] not null default '{}'
);

-- Одна строка состояния (id = 1)
insert into public.roulette_state (id, participants, absent, current_winner, last_winners)
values (1, '{}', '{}', '', '{}')
on conflict (id) do nothing;

alter table public.roulette_state enable row level security;

create policy "Allow public read"
  on public.roulette_state for select
  using (true);

create policy "Allow public update"
  on public.roulette_state for update
  using (true);

create policy "Allow public insert"
  on public.roulette_state for insert
  with check (true);

-- Realtime
alter publication supabase_realtime add table public.roulette_state;
