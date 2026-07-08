import { redirect } from "next/navigation";
import Link from "next/link";
import { Headphones, Dumbbell, Utensils, Brain, Zap, Pill, ThumbsUp } from "lucide-react";
import type { Profile } from "@/types/database";
import { isDevBypass, DEV_PROFILE } from "@/lib/dev-mock";

const CATEGORIES = [
  {
    id: "telo",
    dbCategory: "telo",
    label: "Tělo",
    subtitle: "Pohyb, regenerace a výkon",
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, oklch(0.55 0.18 168), oklch(0.35 0.12 168))",
    accent: "#00D4A0",
    hero: true,
  },
  {
    id: "strava",
    dbCategory: "strava",
    label: "Strava",
    subtitle: "Výživa a energie",
    icon: Utensils,
    gradient: "linear-gradient(135deg, oklch(0.62 0.18 55), oklch(0.42 0.14 55))",
    accent: "#F59E0B",
    hero: false,
  },
  {
    id: "mysl",
    dbCategory: "mysleni",
    label: "Mysl",
    subtitle: "Mindset a psychika",
    icon: Brain,
    gradient: "linear-gradient(135deg, oklch(0.52 0.2 280), oklch(0.35 0.15 280))",
    accent: "#A78BFA",
    hero: false,
  },
  {
    id: "motivace",
    dbCategory: "motivace",
    label: "Motivace",
    subtitle: "Facka realitou",
    icon: Zap,
    gradient: "linear-gradient(135deg, oklch(0.65 0.22 32), oklch(0.45 0.20 22))",
    accent: "#F97316",
    hero: false,
  },
  {
    id: "suplementy",
    dbCategory: "suplementy",
    label: "Suplementační realita",
    subtitle: "Co funguje a co je mýtus",
    icon: Pill,
    gradient: "linear-gradient(135deg, oklch(0.52 0.18 232), oklch(0.35 0.14 232))",
    accent: "#38BDF8",
    hero: false,
  },
];

export default async function PoslechPage() {
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;
  // Počty lajků per série: { telo: 12, strava: 3, mysleni: 7, motivace: 0 }
  let seriesLikes: Record<string, number> = {};

  if (devMode) {
    profile = DEV_PROFILE;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, likesRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any).from("podcast_series_likes").select("category") as Promise<{ data: Array<{ category: string }> | null }>,
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;

    for (const row of likesRes.data ?? []) {
      seriesLikes[row.category] = (seriesLikes[row.category] ?? 0) + 1;
    }
  }

  const isPremium = profile?.is_premium ?? false;

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Audio průvodce
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
          <Headphones className="h-8 w-8 text-primary" />
          Poslech
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">
          Tři pilíře zdravého života
        </p>
      </div>

      {!isPremium ? (
        <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium">
            Pro přístup k audio nahrávkám potřebuješ Premium členství.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Hero karta – TĚLO */}
          {CATEGORIES.filter((c) => c.hero).map((cat) => {
            const Icon = cat.icon;
            const likeCount = seriesLikes[cat.dbCategory] ?? 0;
            return (
              <Link key={cat.id} href={`/poslech/${cat.id}`}>
                <div
                  className="relative w-full rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-200"
                  style={{ background: cat.gradient, minHeight: 180 }}
                >
                  <div className="absolute inset-0 opacity-10"
                    style={{ background: "radial-gradient(circle at 80% 50%, white, transparent 60%)" }}
                  />
                  {/* Odznak s počtem lajků */}
                  {likeCount > 0 && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ background: "oklch(0 0 0 / 0.30)" }}>
                      <ThumbsUp className="h-3 w-3" style={{ fill: "white" }} />
                      {likeCount}
                    </div>
                  )}
                  <div className="relative z-10 p-7 flex flex-col justify-between h-full" style={{ minHeight: 180 }}>
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ background: "oklch(1 0 0 / 0.15)" }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1">
                        Pilíř 1
                      </p>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{cat.label}</h2>
                      <p className="text-sm text-white/70 mt-1">{cat.subtitle}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 p-6 opacity-10">
                    <Icon className="h-24 w-24 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Tři karty – STRAVA + MYSL + MOTIVACE */}
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.filter((c) => !c.hero).map((cat, i) => {
              const Icon = cat.icon;
              const likeCount = seriesLikes[cat.dbCategory] ?? 0;
              return (
                <Link key={cat.id} href={`/poslech/${cat.id}`}>
                  <div
                    className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform duration-200"
                    style={{ background: cat.gradient, minHeight: 160 }}
                  >
                    <div className="absolute inset-0 opacity-10"
                      style={{ background: "radial-gradient(circle at 80% 20%, white, transparent 60%)" }}
                    />
                    {/* Odznak s počtem lajků */}
                    {likeCount > 0 && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ background: "oklch(0 0 0 / 0.30)" }}>
                        <ThumbsUp className="h-2.5 w-2.5" style={{ fill: "white" }} />
                        {likeCount}
                      </div>
                    )}
                    <div className="relative z-10 p-5 flex flex-col justify-between" style={{ minHeight: 160 }}>
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ background: "oklch(1 0 0 / 0.15)" }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="mt-4">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60 mb-0.5">
                          Pilíř {i + 2}
                        </p>
                        <h2 className="text-xl font-bold text-white">{cat.label}</h2>
                        <p className="text-xs text-white/65 mt-0.5 leading-snug">{cat.subtitle}</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 p-4 opacity-10">
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
