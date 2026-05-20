import { redirect } from "next/navigation";
import { Headphones } from "lucide-react";
import type { Profile, AudioTrack } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_AUDIO_TRACKS } from "@/lib/dev-mock";
import { TrackCardButton } from "@/components/track-card-button";

export default async function PoslechPage() {
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;
  let tracks: AudioTrack[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    tracks = DEV_AUDIO_TRACKS;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, tracksRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      supabase.from("audio_tracks").select("*").eq("is_published", true).order("order_index"),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;
    tracks = tracksRes.data as AudioTrack[] | null;
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
          Strava, myšlení a životní styl
        </p>
      </div>

      {!isPremium ? (
        <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium">
            Pro přístup k audio nahrávkám potřebuješ Premium členství.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(tracks ?? []).map((track) => (
            <TrackCardButton key={track.id} track={track} />
          ))}
        </div>
      )}

    </div>
  );
}
