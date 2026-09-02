-- Профили игроков: связаны 1-к-1 с аккаунтом в auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Лучшие результаты игрока по каждому уровню.
-- Одна строка на пару (игрок, уровень) — новый результат перезаписывает старый (upsert).
create table public.results (
  user_id uuid not null references auth.users (id) on delete cascade,
  level_id text not null,
  elapsed_ms integer not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

alter table public.results enable row level security;

create policy "results_select_all"
  on public.results for select
  using (true);

create policy "results_insert_own"
  on public.results for insert
  with check (auth.uid() = user_id);

create policy "results_update_own"
  on public.results for update
  using (auth.uid() = user_id);
