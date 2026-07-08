import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Dumbbell, Utensils, Brain, Zap } from "lucide-react";
import type { Profile, AudioTrack } from "@/types/database";
import { TrackCardButton } from "@/components/track-card-button";
import { SeriesEndPrompt } from "@/components/series-end-prompt";

const CATEGORY_META: Record<string, {
  label: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  dbCategory: string;
  pillar: number;
}> = {
  telo: {
    label: "Tělo",
    subtitle: "Pohyb, regenerace a výkon",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, oklch(0.55 0.18 168), oklch(0.35 0.12 168))",
    dbCategory: "telo",
    pillar: 1,
  },
  strava: {
    label: "Strava",
    subtitle: "Výživa a energie",
    icon: Utensils,
    gradient: "linear-gradient(135deg, oklch(0.62 0.18 55), oklch(0.42 0.14 55))",
    dbCategory: "strava",
    pillar: 2,
  },
  mysl: {
    label: "Mysl",
    subtitle: "Mindset a psychika",
    icon: Brain,
    gradient: "linear-gradient(135deg, oklch(0.52 0.2 280), oklch(0.35 0.15 280))",
    dbCategory: "mysleni",
    pillar: 3,
  },
  motivace: {
    label: "Motivace",
    subtitle: "Facka realitou",
    icon: Zap,
    gradient: "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.45 0.20 22))",
    dbCategory: "motivace",
    pillar: 4,
  },
};

export default async function PoslechCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORY_META[category];
  if (!meta) notFound();

  const openAccess = process.env.OPEN_ACCESS === "1";

  let tracks: AudioTrack[] | null;
  // Mapa počtu lajků per track: { [trackId]: počet }
  let likeCounts: Record<string, number> = {};
  // Sada ID tracků, které lajkoval přihlášený uživatel
  let userLikedSet = new Set<string>();
  // Lajky celé série
  let seriesCount = 0;
  let userLikedSeries = false;

  if (openAccess) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const tracksRes = await supabase
      .from("audio_tracks")
      .select("*")
      .eq("category", meta.dbCategory)
      .eq("is_published", true)
      .order("order_index");
    tracks = tracksRes.data as AudioTrack[] | null;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, tracksRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      supabase
        .from("audio_tracks")
        .select("*")
        .eq("category", meta.dbCategory)
        .eq("is_published", true)
        .order("order_index"),
    ]);

    const profile = profileRes.data as Pick<Profile, "is_premium"> | null;
    if (!profile?.is_premium) redirect("/poslech");
    tracks = tracksRes.data as AudioTrack[] | null;

    // Načteme lajky jen pokud jsou nějaké tracky
    if (tracks && tracks.length > 0) {
      const trackIds = tracks.map(t => t.id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;

      const [allLikesRes, userLikesRes, seriesCountRes, userSeriesLikeRes] = await Promise.all([
        // Všechny lajky pro tyto tracky (pro počítadla)
        db.from("audio_track_likes").select("track_id").in("track_id", trackIds) as Promise<{ data: Array<{ track_id: string }> | null }>,
        // Lajky tohoto uživatele (pro stav tlačítka)
        db.from("audio_track_likes").select("track_id").eq("user_id", user.id).in("track_id", trackIds) as Promise<{ data: Array<{ track_id: string }> | null }>,
        // Počet lajků celé série
        db.from("podcast_series_likes").select("*", { count: "exact", head: true }).eq("category", meta.dbCategory) as Promise<{ count: number | null }>,
        // Jestli uživatel lajkoval sérii
        db.from("podcast_series_likes").select("id").eq("user_id", user.id).eq("category", meta.dbCategory).single() as Promise<{ data: { id: string } | null }>,
      ]);

      // Spočítáme lajky per track
      for (const like of allLikesRes.data ?? []) {
        likeCounts[like.track_id] = (likeCounts[like.track_id] ?? 0) + 1;
      }
      userLikedSet = new Set((userLikesRes.data ?? []).map(l => l.track_id));
      seriesCount = seriesCountRes.count ?? 0;
      userLikedSeries = !!userSeriesLikeRes.data;
    }
  }

  const Icon = meta.icon;
  // Série je kompletní když má 10+ epizod
  const seriesComplete = (tracks?.length ?? 0) >= 10;

  return (
    <div className="min-h-full flex flex-col">

      {/* Header s gradientem */}
      <div className="relative overflow-hidden px-5 pt-8 pb-8 md:px-10" style={{ background: meta.gradient }}>
        <div className="absolute inset-0 opacity-10"
          style={{ background: "radial-gradient(circle at 80% 50%, white, transparent 60%)" }}
        />
        <div className="absolute bottom-0 right-0 p-6 opacity-10">
          <Icon className="h-32 w-32 text-white" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <Link
            href="/poslech"
            className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Poslech
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0"
              style={{ background: "oklch(1 0 0 / 0.15)" }}
            >
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                Pilíř {meta.pillar}
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">{meta.label}</h1>
              <p className="text-sm text-white/70">{meta.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seznam epizod */}
      <div className="flex-1 px-5 py-6 md:px-10 max-w-xl mx-auto w-full">
        {tracks && tracks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tracks.map((track, i) => (
              <TrackCardButton
                key={track.id}
                track={track}
                index={i + 1}
                likeCount={likeCounts[track.id] ?? 0}
                userLiked={userLikedSet.has(track.id)}
              />
            ))}

            {/* End-of-series prompt — zobrazí se po 10 epizodách */}
            {seriesComplete && (
              <SeriesEndPrompt
                category={meta.dbCategory}
                initialCount={seriesCount}
                initialLiked={userLikedSeries}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "oklch(0.2 0.05 168)" }}
            >
              <Icon className="h-8 w-8 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm">Audio nahrávky brzy přibydou.</p>
          </div>
        )}
      </div>

    </div>
  );
}
