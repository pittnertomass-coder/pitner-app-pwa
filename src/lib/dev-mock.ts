import { cookies } from "next/headers";
import type { Profile, Training, UserProgress, AudioTrack } from "@/types/database";

export async function isDevBypass(): Promise<boolean> {
  if (process.env.NODE_ENV !== "development") return false;
  const store = await cookies();
  return store.get("dev_skip_auth")?.value === "1";
}

export const DEV_PROFILE: Profile = {
  id: "dev-user",
  email: "dev@pitner.local",
  full_name: "Dev Preview",
  avatar_url: null,
  is_premium: true,
  stripe_customer_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Testovací video: https://player.mediadelivery.net/play/631100/108942d1-0798-4c03-a77b-ff0eab477de9
const TEST_LIBRARY_ID = "631100";
const TEST_VIDEO_ID = "108942d1-0798-4c03-a77b-ff0eab477de9";

export const DEV_TRAININGS: Training[] = [
  {
    id: "dev-1",
    title: "Lekce 1 – Základy pohybu",
    description: "Úvod do správného pohybového vzoru",
    bunny_video_id: TEST_VIDEO_ID,
    bunny_library_id: TEST_LIBRARY_ID,
    duration_seconds: 1800,
    order_index: 1,
    category: "cesta",
    timestamps: [
      { label: "Úvod", seconds: 0 },
      { label: "Rozcvičení", seconds: 120 },
      { label: "Mobilita kyčlí", seconds: 400 },
      { label: "Hlavní část", seconds: 700 },
      { label: "Strečink", seconds: 1500 },
    ],
    thumbnail_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "dev-2",
    title: "Lekce 2 – Síla a stabilita",
    description: "Budování základní síly a tělesné stability",
    bunny_video_id: TEST_VIDEO_ID,
    bunny_library_id: TEST_LIBRARY_ID,
    duration_seconds: 2400,
    order_index: 2,
    category: "cesta",
    timestamps: [
      { label: "Rozcvičení", seconds: 0 },
      { label: "Dřepy", seconds: 300 },
      { label: "Výpady", seconds: 800 },
      { label: "Core", seconds: 1400 },
    ],
    thumbnail_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "dev-3",
    title: "Klinika – Bolest zad",
    description: "Jak pracovat s bolestí zad a předcházet ji",
    bunny_video_id: TEST_VIDEO_ID,
    bunny_library_id: TEST_LIBRARY_ID,
    duration_seconds: 1200,
    order_index: 1,
    category: "klinika",
    timestamps: [
      { label: "Úvod", seconds: 0 },
      { label: "Diagnostika", seconds: 180 },
      { label: "Cviky", seconds: 480 },
    ],
    thumbnail_url: null,
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

export const DEV_AUDIO_TRACKS: AudioTrack[] = [
  {
    id: "audio-1",
    title: "Proč do ranní vody patří špetka soli",
    description: "Záchranná brzda – stabilizace",
    file_url: "https://zregeneruj-podcasty.b-cdn.net/podcasty/strava/KROK%201%20Z%C3%A1chrann%C3%A1%20brzda%20(Stabilizace)/1.den%20Pro%C4%8D_do_rann%C3%AD_vody_pat%C5%99%C3%AD_%C5%A1petka_soli.m4a",
    cover_url: null,
    duration_seconds: 600,
    category: "strava",
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "audio-2",
    title: "Nejste staří, jste jen ztuhlí",
    description: "Modul 5 – Dlouhověkost (Tělo 2.0 a Antifragilita)",
    file_url: "https://zregeneruj-podcasty.b-cdn.net/podcasty/rozum/nov%C3%A1%20cesta%20rozumu/MODUL%205%20Dlouhov%C4%9Bkost%20(T%C4%9Blo%202.0%20a%20Antifragilita)/1.den%20Nejste_sta%C5%99%C3%AD%2C_jste_jen_ztuhl%C3%AD.m4a",
    cover_url: null,
    duration_seconds: 600,
    category: "mysleni",
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
  },
];

export const DEV_PROGRESS: UserProgress[] = [];
