import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Dumbbell, Utensils, Brain } from "lucide-react";
import type { Profile, AudioTrack } from "@/types/database";
import { TrackCardButton } from "@/components/track-card-button";

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
  }

  const Icon = meta.icon;

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

      {/* Seznam audio stop */}
      <div className="flex-1 px-5 py-6 md:px-10 max-w-xl mx-auto w-full">
        {tracks && tracks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {tracks.map((track, i) => (
              <TrackCardButton key={track.id} track={track} index={i + 1} />
            ))}
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
