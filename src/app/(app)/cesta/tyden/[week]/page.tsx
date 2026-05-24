import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Route } from "lucide-react";
import type { Profile, Training, UserProgress } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";
import { TrainingCardButton } from "@/components/training-card-button";

interface Props {
  params: Promise<{ week: string }>;
}

export default async function TydenPage({ params }: Props) {
  const { week: weekParam } = await params;
  const week = parseInt(weekParam, 10);
  if (isNaN(week) || week < 1) notFound();

  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium" | "created_at"> | null;
  let trainings: Training[] | null;
  let progress: UserProgress[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    trainings = DEV_TRAININGS.filter((t) => t.category === "cesta" && (t.week_number ?? 1) === week);
    progress = DEV_PROGRESS;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("is_premium, created_at").eq("id", user.id).single(),
      supabase.from("trainings").select("*").eq("category", "cesta").eq("is_published", true).eq("week_number", week).order("order_index"),
      supabase.from("user_progress").select("*").eq("user_id", user.id),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium" | "created_at"> | null;
    trainings = trainingsRes.data as Training[] | null;
    progress = progressRes.data as UserProgress[] | null;
  }

  // Check if this week is unlocked
  const registeredAt = profile?.created_at ? new Date(profile.created_at) : new Date();
  const daysSince = Math.floor((Date.now() - registeredAt.getTime()) / 86400000);
  const unlockedWeeks = Math.floor(daysSince / 7) + 1;

  if (week > unlockedWeeks) redirect("/cesta");

  const isPremium = profile?.is_premium ?? false;
  const progressMap = new Map(progress?.map((p) => [p.training_id, p]) ?? []);

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="space-y-3">
        <Link
          href="/cesta"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zpět na Cestu
        </Link>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
            Tréninkový program
          </p>
          <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
            <Route className="h-8 w-8 text-primary" />
            Týden {week}
          </h1>
          <p className="text-muted-foreground text-sm pt-0.5">
            {trainings?.length ?? 0} lekcí tento týden
          </p>
        </div>
      </div>

      {!isPremium && (
        <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium">
            Pro přístup k videím potřebuješ Premium členství.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {trainings && trainings.length > 0 ? (
          trainings.map((training, index) => (
            <TrainingCardButton
              key={training.id}
              training={training}
              index={index}
              label="Lekce"
              progress={progressMap.get(training.id) ?? null}
              locked={!isPremium}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Žádné lekce tento týden.</p>
          </div>
        )}
      </div>

    </div>
  );
}
