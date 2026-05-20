-- ============================================================
-- Pitner App – Počáteční schéma databáze
-- ============================================================

-- Rozšíření
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABULKA: profiles
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  avatar_url    text,
  is_premium    boolean not null default false,
  stripe_customer_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Automaticky vytvořit profil po registraci
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Automaticky aktualizovat updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- TABULKA: trainings
-- ============================================================
create table public.trainings (
  id                uuid primary key default uuid_generate_v4(),
  title             text not null,
  description       text,
  bunny_video_id    text not null,
  bunny_library_id  text not null,
  duration_seconds  integer not null default 0,
  order_index       integer not null default 0,
  category          text not null default 'cesta' check (category in ('cesta', 'klinika')),
  timestamps        jsonb not null default '[]'::jsonb,
  thumbnail_url     text,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- TABULKA: user_progress
-- ============================================================
create table public.user_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  training_id      uuid not null references public.trainings(id) on delete cascade,
  watched_seconds  integer not null default 0,
  is_completed     boolean not null default false,
  last_watched_at  timestamptz not null default now(),
  unique (user_id, training_id)
);

-- ============================================================
-- TABULKA: audio_tracks
-- ============================================================
create table public.audio_tracks (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  description      text,
  file_url         text not null,
  cover_url        text,
  duration_seconds integer not null default 0,
  category         text not null default 'general',
  order_index      integer not null default 0,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- TABULKA: user_audio_progress
-- ============================================================
create table public.user_audio_progress (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  track_id         uuid not null references public.audio_tracks(id) on delete cascade,
  position_seconds integer not null default 0,
  last_listened_at timestamptz not null default now(),
  unique (user_id, track_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.trainings        enable row level security;
alter table public.user_progress    enable row level security;
alter table public.audio_tracks     enable row level security;
alter table public.user_audio_progress enable row level security;

-- profiles: každý vidí jen svůj profil
create policy "Vlastní profil – čtení"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Vlastní profil – úprava"
  on public.profiles for update
  using (auth.uid() = id);

-- trainings: jen přihlášení premium uživatelé vidí publikovaná videa
create policy "Premium – čtení tréninkú"
  on public.trainings for select
  using (
    is_published = true
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_premium = true
    )
  );

-- user_progress: jen vlastní záznamy
create policy "Vlastní pokrok – čtení"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Vlastní pokrok – zápis"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Vlastní pokrok – úprava"
  on public.user_progress for update
  using (auth.uid() = user_id);

-- audio_tracks: jen premium uživatelé
create policy "Premium – čtení audio stop"
  on public.audio_tracks for select
  using (
    is_published = true
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_premium = true
    )
  );

-- user_audio_progress: jen vlastní záznamy
create policy "Vlastní audio pokrok – čtení"
  on public.user_audio_progress for select
  using (auth.uid() = user_id);

create policy "Vlastní audio pokrok – zápis"
  on public.user_audio_progress for insert
  with check (auth.uid() = user_id);

create policy "Vlastní audio pokrok – úprava"
  on public.user_audio_progress for update
  using (auth.uid() = user_id);

-- ============================================================
-- INDEXY
-- ============================================================
create index idx_trainings_category       on public.trainings (category, is_published, order_index);
create index idx_user_progress_user       on public.user_progress (user_id);
create index idx_user_audio_progress_user on public.user_audio_progress (user_id);
