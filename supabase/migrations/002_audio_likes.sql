-- ============================================================
-- Pitner App – Lajky audio obsahu
-- ============================================================

-- Lajky jednotlivých audio epizod
create table public.audio_track_likes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  track_id   uuid not null references public.audio_tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, track_id)
);

alter table public.audio_track_likes enable row level security;

-- Přihlášení vidí všechny lajky (pro zobrazení počtu)
create policy "Track lajky – čtení"
  on public.audio_track_likes for select
  using (auth.uid() is not null);

-- Uživatel může přidat svůj lajk
create policy "Track lajky – vložení"
  on public.audio_track_likes for insert
  with check (auth.uid() = user_id);

-- Uživatel může odebrat svůj lajk
create policy "Track lajky – smazání"
  on public.audio_track_likes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Lajky celých sérií (end-of-series prompt)
-- ============================================================

create table public.podcast_series_likes (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  category   text not null,
  created_at timestamptz not null default now(),
  unique (user_id, category)
);

alter table public.podcast_series_likes enable row level security;

create policy "Série lajky – čtení"
  on public.podcast_series_likes for select
  using (auth.uid() is not null);

create policy "Série lajky – vložení"
  on public.podcast_series_likes for insert
  with check (auth.uid() = user_id);

create policy "Série lajky – smazání"
  on public.podcast_series_likes for delete
  using (auth.uid() = user_id);

-- Indexy pro rychlé počítání lajků
create index idx_audio_track_likes_track on public.audio_track_likes (track_id);
create index idx_podcast_series_likes_cat on public.podcast_series_likes (category);
