import { redirect } from "next/navigation";
import { Route } from "lucide-react";
import type { Profile, Training, UserProgress } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";
import { WeekCard } from "@/components/week-card";

export default async function CestaPage() {
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium" | "created_at"> | null;
  let trainings: Training[] | null;
  let progress: UserProgress[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    trainings = DEV_TRAININGS.filter((t) => t.category === "cesta");
    progress = DEV_PROGRESS;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("is_premium, created_at").eq("id", user.id).single(),
      supabase.from("trainings").select("*").eq("category", "cesta").eq("is_published", true).order("week_number").order("order_index"),
      supabase.from("user_progress").select("*").eq("user_id", user.id),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium" | "created_at"> | null;
    trainings = trainingsRes.data as Training[] | null;
    progress = progressRes.data as UserProgress[] | null;
  }

  const isPremium = profile?.is_premium ?? false;
  const progressRecord: Record<string, UserProgress> = {};
  for (const p of progress ?? []) progressRecord[p.training_id] = p;
  const completedCount = Object.values(progressRecord).filter((p) => p.is_completed).length;
  const totalCount = trainings?.length ?? 0;

  // Calculate unlocked weeks based on days since registration
  const registeredAt = profile?.created_at ? new Date(profile.created_at) : new Date();
  const daysSince = Math.floor((Date.now() - registeredAt.getTime()) / 86400000);
  const unlockedWeeks = Math.floor(daysSince / 7) + 1;

  // Group trainings by week
  const weekMap: Record<number, Training[]> = {};
  for (const t of trainings ?? []) {
    const wk = t.week_number ?? 1;
    if (!weekMap[wk]) weekMap[wk] = [];
    weekMap[wk].push(t);
  }
  const maxWeek = Math.max(8, ...Object.keys(weekMap).map(Number));
  const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Tréninkový program
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
          <Route className="h-8 w-8 text-primary" />
          Cesta
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">
          Tvůj program krok za krokem
        </p>
      </div>

      {totalCount > 0 && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Postup
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/12 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${totalCount > 0 ? Math.max(2, Math.round((completedCount / totalCount) * 100)) : 2}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {completedCount} z {totalCount} lekcí dokončeno
          </p>
        </div>
      )}

      {!isPremium && (
        <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium">
            Pro přístup k videím potřebuješ Premium členství.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {weeks.map((week) => (
          <WeekCard
            key={week}
            week={week}
            trainings={weekMap[week] ?? []}
            progressRecord={progressRecord}
            isUnlocked={week <= unlockedWeeks}
            daysUntilUnlock={(week - 1) * 7 - daysSince}
          />
        ))}
      </div>

    </div>
  );
}
