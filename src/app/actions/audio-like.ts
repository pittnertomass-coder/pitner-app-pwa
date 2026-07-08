"use server";

import { revalidatePath } from "next/cache";

// Přepne lajk uživatele na konkrétní epizodě — vrátí nový stav a celkový počet
export async function toggleTrackLike(
  trackId: string
): Promise<{ liked: boolean; count: number }> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: existing } = await db
    .from("audio_track_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("track_id", trackId)
    .single() as { data: { id: string } | null };

  if (existing) {
    await db.from("audio_track_likes").delete().eq("id", existing.id);
  } else {
    await db.from("audio_track_likes").insert({ user_id: user.id, track_id: trackId });
  }

  const { count } = await db
    .from("audio_track_likes")
    .select("*", { count: "exact", head: true })
    .eq("track_id", trackId) as { count: number | null };

  revalidatePath("/poslech/[category]", "page");
  return { liked: !existing, count: count ?? 0 };
}

// Přepne lajk celé série (kategorie) — vrátí nový stav a celkový počet
export async function toggleSeriesLike(
  category: string
): Promise<{ liked: boolean; count: number }> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nepřihlášen");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: existing } = await db
    .from("podcast_series_likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("category", category)
    .single() as { data: { id: string } | null };

  if (existing) {
    await db.from("podcast_series_likes").delete().eq("id", existing.id);
  } else {
    await db.from("podcast_series_likes").insert({ user_id: user.id, category });
  }

  const { count } = await db
    .from("podcast_series_likes")
    .select("*", { count: "exact", head: true })
    .eq("category", category) as { count: number | null };

  revalidatePath("/poslech/[category]", "page");
  return { liked: !existing, count: count ?? 0 };
}
