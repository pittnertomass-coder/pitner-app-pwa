import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Stethoscope } from "lucide-react";
import type { Profile, Training, UserProgress } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";
import { TrainingCardButton } from "@/components/training-card-button";

const ZONA_LABELS: Record<string, string> = {
  hlava: "Bolest hlavy",
  krc: "Bolest za krkem",
  rameno: "Bolest ramene",
  zada: "Bolest zad (lopatky)",
  loket: "Bolest lokte",
  zapesti: "Bolest zápěstí a prstů",
  bedera: "Bolest beder",
  kriz: "Bolest v kříži",
  kycle: "Bolest kyčle",
  stehno: "Bolest stehna",
  koleno: "Bolest kolene",
  lytko: "Bolest lýtka (křeče)",
  kotnik: "Bolest kotníku",
  pata: "Bolest paty",
  chodidlo: "Bolest chodidla",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function KlinikaZonaPage({ params }: Props) {
  const { slug } = await params;
  const label = ZONA_LABELS[slug];
  if (!label) notFound();

  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;
  let trainings: Training[] | null;
  let progress: UserProgress[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    trainings = DEV_TRAININGS.filter((t) => t.category === "klinika");
    progress = DEV_PROGRESS;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      supabase.from("trainings").select("*").eq("category", "klinika").eq("is_published", true).order("order_index"),
      supabase.from("user_progress").select("*").eq("user_id", user.id),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;
    trainings = trainingsRes.data as Training[] | null;
    progress = progressRes.data as UserProgress[] | null;
  }

  const isPremium = profile?.is_premium ?? false;
  if (!isPremium) redirect("/klinika");

  const progressMap = new Map(progress?.map((p) => [p.training_id, p]) ?? []);

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-xl mx-auto flex flex-col gap-8">

      <div className="space-y-3">
        <Link
          href="/klinika"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Zpět na Kliniku
        </Link>

        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
            Klinika
          </p>
          <h1 className="text-3xl font-bold tracking-tight leading-tight flex items-center gap-3">
            <Stethoscope className="h-7 w-7 text-primary" />
            {label}
          </h1>
          <p className="text-muted-foreground text-sm pt-0.5">
            {trainings?.length ?? 0} {(trainings?.length ?? 0) === 1 ? "video" : "videí"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {trainings && trainings.length > 0 ? (
          trainings.map((training, index) => (
            <TrainingCardButton
              key={training.id}
              training={training}
              index={index}
              label="Video"
              progress={progressMap.get(training.id) ?? null}
              locked={false}
            />
          ))
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">Videa pro tuto oblast brzy přibydou.</p>
          </div>
        )}
      </div>

    </div>
  );
}
