-- Atlas Method — Supabase schema
-- Run this in the Supabase SQL editor (Settings > SQL Editor)

-- ─── profiles ────────────────────────────────────────────────────────────────
-- One row per user. Created on first login / signup.

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text,
  age             int,
  weight          numeric(5,1),
  height          numeric(5,1),
  goal            text,               -- hipertrofia | fuerza | recomposicion | perdida_grasa
  level           text,               -- principiante | intermedio | avanzado
  experience      text,
  weekly_frequency int default 4,
  session_duration int default 60,    -- minutes
  injuries        text,
  equipment       text,               -- gimnasio_completo | pesas_libres | mancuernas | casa_basico
  onboarded       boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- ─── user_data ───────────────────────────────────────────────────────────────
-- Serialised store state: gems, sessions, log, achievements, etc.

create table if not exists public.user_data (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  gems_balance        int default 0,
  gems_history        jsonb default '[]',
  sessions_completed  int default 0,
  streak              int default 0,
  last_session_date   text,
  session_log         jsonb default '[]',
  achievements        jsonb default '[]',
  reading_completed   jsonb default '[]',
  store_owned         jsonb default '[]',
  current_plan        jsonb,
  updated_at          timestamptz default now()
);

alter table public.user_data enable row level security;

create policy "Users can read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "Users can upsert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.user_data for update
  using (auth.uid() = user_id);


-- ─── coach_data ──────────────────────────────────────────────────────────────
-- Atlas Coach chat history, memory, and coach profile per user.

create table if not exists public.coach_data (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  chats         jsonb default '[]',
  memory        jsonb,
  coach_profile jsonb,
  updated_at    timestamptz default now()
);

alter table public.coach_data enable row level security;

create policy "Users can read own coach data"
  on public.coach_data for select
  using (auth.uid() = user_id);

create policy "Users can upsert own coach data"
  on public.coach_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own coach data"
  on public.coach_data for update
  using (auth.uid() = user_id);


-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists profiles_updated_at_idx  on public.profiles(updated_at);
create index if not exists user_data_updated_at_idx on public.user_data(updated_at);
create index if not exists coach_data_updated_at_idx on public.coach_data(updated_at);


-- ─── Auto-create profile on signup ───────────────────────────────────────────
-- Trigger: when a new user is created in auth.users, insert a minimal profile row.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
