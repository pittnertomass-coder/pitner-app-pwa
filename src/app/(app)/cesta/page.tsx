import { redirect } from "next/navigation";
import Link from "next/link";
import { Route, Lock, ChevronRight } from "lucide-react";
import type { Profile, Training, UserProgress } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";

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
  const progressMap = new Map(progress?.map((p) => [p.training_id, p]) ?? []);
  const completedCount = Array.from(progressMap.values()).filter((p) => p.is_completed).length;
  const totalCount = trainings?.length ?? 0;

  // Calculate unlocked weeks based on days since registration
  const registeredAt = profile?.created_at ? new Date(profile.created_at) : new Date();
  const daysSince = Math.floor((Date.now() - registeredAt.getTime()) / 86400000);
  const unlockedWeeks = Math.floor(daysSince / 7) + 1;

  // Group trainings by week
  const weekMap = new Map<number, Training[]>();
  for (const t of trainings ?? []) {
    const wk = t.week_number ?? 1;
    if (!weekMap.has(wk)) weekMap.set(wk, []);
    weekMap.get(wk)!.push(t);
  }
  const weeks = Array.from(weekMap.keys()).sort((a, b) => a - b);

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
        {weeks.map((week) => {
          const weekTrainings = weekMap.get(week)!;
          const isUnlocked = week <= unlockedWeeks;
          const daysUntilUnlock = (week - 1) * 7 - daysSince;
          const completedInWeek = weekTrainings.filter((t) => progressMap.get(t.id)?.is_completed).length;

          if (isUnlocked) {
            return (
              <Link
                key={week}
                href={`/cesta/tyden/${week}`}
                className="group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, oklch(0.30 0.10 168) 0%, oklch(0.22 0.07 168) 100%)",
                  border: "1px solid oklch(0.45 0.12 168 / 0.5)",
                }}
              >
                {/* Mint accent line */}
                <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-primary" />

                <div className="flex-1 min-w-0 pl-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-0.5">
                    Týden {week}
                  </p>
                  <p className="text-lg font-bold leading-tight text-foreground">
                    {weekTrainings.length} {weekTrainings.length === 1 ? "lekce" : weekTrainings.length < 5 ? "lekce" : "lekcí"}
                  </p>
                  {completedInWeek > 0 && (
                    <p className="text-xs text-primary/70 mt-0.5">
                      {completedInWeek} z {weekTrainings.length} dokončeno
                    </p>
                  )}
                </div>

                {/* Progress ring placeholder */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  {completedInWeek === weekTrainings.length && weekTrainings.length > 0 ? (
                    <span className="text-2xl">✓</span>
                  ) : (
                    <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </Link>
            );
          }

          return (
            <div
              key={week}
              className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 opacity-60"
              style={{
                background: "oklch(0.18 0.03 168 / 0.5)",
                border: "1px solid oklch(0.30 0.05 168 / 0.4)",
              }}
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-muted-foreground/30" />

              <div className="flex-1 min-w-0 pl-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
                  Týden {week}
                </p>
                <p className="text-lg font-bold leading-tight text-muted-foreground">
                  {weekTrainings.length} {weekTrainings.length === 1 ? "lekce" : weekTrainings.length < 5 ? "lekce" : "lekcí"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Odemkne se za {daysUntilUnlock} {daysUntilUnlock === 1 ? "den" : daysUntilUnlock < 5 ? "dny" : "dní"}
                </p>
              </div>

              <Lock className="h-5 w-5 shrink-0 text-muted-foreground/40" />
            </div>
          );
        })}
      </div>

    </div>
  );
}
