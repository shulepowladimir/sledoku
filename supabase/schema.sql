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

-- Незавершённые игровые доски приватны и хранятся отдельно от публичных рекордов.
create table public.level_drafts (
  user_id uuid not null references auth.users (id) on delete cascade,
  level_id text not null,
  snapshot jsonb not null,
  saved_at timestamptz not null,
  primary key (user_id, level_id)
);

alter table public.level_drafts enable row level security;
revoke all on table public.level_drafts from anon, public;
grant select, insert, update on table public.level_drafts to authenticated;

create policy "level_drafts_select_own"
  on public.level_drafts for select to authenticated
  using (auth.uid() = user_id);

create policy "level_drafts_insert_own"
  on public.level_drafts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "level_drafts_update_own"
  on public.level_drafts for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Atomic timestamp comparison prevents an older delayed device write from replacing a newer draft.
create or replace function public.save_level_draft(
  p_level_id text,
  p_snapshot jsonb,
  p_saved_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  affected_rows integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.level_drafts as current_draft (user_id, level_id, snapshot, saved_at)
  values (auth.uid(), p_level_id, p_snapshot, p_saved_at)
  on conflict (user_id, level_id) do update
    set snapshot = excluded.snapshot,
        saved_at = excluded.saved_at
    where current_draft.saved_at <= excluded.saved_at;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

revoke all on function public.save_level_draft(text, jsonb, timestamptz) from public, anon;
grant execute on function public.save_level_draft(text, jsonb, timestamptz) to authenticated;
