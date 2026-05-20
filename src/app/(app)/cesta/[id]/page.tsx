import { redirect, notFound } from "next/navigation";
import { VideoPlayer } from "@/components/video-player";
import type { Profile, Training, UserProgress, Timestamp } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TrainingDetailPage({ params }: Props) {
  const { id } = await params;
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;
  let training: Training | null;
  let progress: UserProgress | null;

  if (devMode) {
    profile = DEV_PROFILE;
    const found = DEV_TRAININGS.find((t) => t.id === id);
    training = found ?? null;
    progress = DEV_PROGRESS.find((p) => p.training_id === id) ?? null;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      supabase.from("trainings").select("*").eq("id", id).eq("is_published", true).single(),
      supabase.from("user_progress").select("*").eq("user_id", user.id).eq("training_id", id).single(),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;
    training = trainingRes.data as Training | null;
    progress = progressRes.data as UserProgress | null;
  }

  if (!training) notFound();
  if (!profile?.is_premium) redirect("/cesta");

  const timestamps = (training.timestamps as unknown as Timestamp[]) ?? [];

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-3xl mx-auto flex flex-col gap-6">

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          {training.category === "klinika" ? "Klinika · Video" : "Cesta · Lekce"}
        </p>
        <h1 className="text-2xl font-bold tracking-tight leading-snug">{training.title}</h1>
        {training.description && (
          <p className="text-muted-foreground text-sm mt-1">{training.description}</p>
        )}
      </div>

      <VideoPlayer
        trainingId={training.id}
        bunnyLibraryId={training.bunny_library_id}
        bunnyVideoId={training.bunny_video_id}
        timestamps={timestamps}
        initialSeconds={progress?.watched_seconds ?? 0}
      />

    </div>
  );
}
