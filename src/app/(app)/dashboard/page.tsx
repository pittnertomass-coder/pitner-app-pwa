import { redirect } from "next/navigation";
import Link from "next/link";
import { Route, Stethoscope, Headphones, Flame, TrendingUp, Star } from "lucide-react";
import type { Profile, Training, UserProgress, AudioTrack } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS, DEV_AUDIO_TRACKS } from "@/lib/dev-mock";

export default async function DashboardPage() {
  const devMode = await isDevBypass();

  let profile: Profile | null;
  let trainings: Pick<Training, "id" | "title" | "category" | "order_index">[] | null;
  let progress: UserProgress[] | null;
  let audioTracks: Pick<AudioTrack, "id">[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    trainings = DEV_TRAININGS;
    progress = DEV_PROGRESS;
    audioTracks = DEV_AUDIO_TRACKS;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingsRes, progressRes, audioRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("trainings").select("id, title, category, order_index").eq("is_published", true).order("order_index"),
      supabase.from("user_progress").select("*").eq("user_id", user.id),
      supabase.from("audio_tracks").select("id").eq("is_published", true),
    ]);

    profile = profileRes.data as Profile | null;
    trainings = trainingsRes.data as Pick<Training, "id" | "title" | "category" | "order_index">[] | null;
    progress = progressRes.data as UserProgress[] | null;
    audioTracks = audioRes.data as Pick<AudioTrack, "id">[] | null;
  }

  const cestaCount = trainings?.filter((t) => t.category === "cesta").length ?? 0;
  const klinikaCount = trainings?.filter((t) => t.category === "klinika").length ?? 0;
  const poslechCount = audioTracks?.length ?? 0;
  const completedCount = progress?.filter((p) => p.is_completed).length ?? 0;
  const totalCount = (cestaCount + klinikaCount) || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const firstName = profile?.full_name?.split(" ")[0] ?? "tam";

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      {/* Uvítání */}
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Členská sekce
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight">
          Ahoj, {firstName}!
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">
          {progressPct > 0
            ? `Jsi na ${progressPct} % své cesty. Pokračuj dál.`
            : "Vítej. Tvůj program čeká."}
        </p>
      </div>

      {/* Celkový postup */}
      <div className="glass rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Celkový postup
          </span>
          <span className="text-sm font-bold text-primary tabular-nums">{progressPct} %</span>
        </div>
        <div className="h-1.5 rounded-full bg-primary/12 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${progressPct || 2}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {completedCount} z {totalCount} lekcí dokončeno
        </p>
      </div>

      {/* Tři sekce — Cesta / Klinika / Poslech */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/cesta">
          <div className="glass glass-hover rounded-2xl p-5 space-y-4 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold teal-number leading-none">{cestaCount}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-snug">tréninkových lekcí</p>
            </div>
          </div>
        </Link>

        <Link href="/klinika">
          <div className="glass glass-hover rounded-2xl p-5 space-y-4 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold teal-number leading-none">{klinikaCount}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-snug">klinických videí</p>
            </div>
          </div>
        </Link>

        <Link href="/poslech">
          <div className="glass glass-hover rounded-2xl p-5 space-y-4 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Headphones className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold teal-number leading-none">{poslechCount}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-snug">audio průvodců</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Pokračovat */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
          Pokračovat
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/cesta">
            <div className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Tvůj trénink</p>
                <p className="text-sm text-muted-foreground mt-0.5">Cesta · {cestaCount} lekcí</p>
              </div>
              <span className="text-primary/40 text-xl font-thin shrink-0">›</span>
            </div>
          </Link>

          <Link href="/klinika">
            <div className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <Stethoscope className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Klinika</p>
                <p className="text-sm text-muted-foreground mt-0.5">Odborné vzdělávání · {klinikaCount} videí</p>
              </div>
              <span className="text-primary/40 text-xl font-thin shrink-0">›</span>
            </div>
          </Link>

          <Link href="/poslech">
            <div className="glass glass-hover rounded-2xl p-5 flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Strava & Myšlení</p>
                <p className="text-sm text-muted-foreground mt-0.5">Poslech · {poslechCount} audio průvodců</p>
              </div>
              <span className="text-primary/40 text-xl font-thin shrink-0">›</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Premium badge */}
      {profile?.is_premium && (
        <div className="glass rounded-2xl p-5 flex items-center gap-4 border-primary/25">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold">Premium člen</p>
            <p className="text-sm text-muted-foreground mt-0.5">Plný přístup ke všemu obsahu</p>
          </div>
        </div>
      )}

    </div>
  );
}
