import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import type { Profile } from "@/types/database";
import { isDevBypass, DEV_PROFILE } from "@/lib/dev-mock";
import { KlinikaInteraktivni } from "@/components/klinika-interaktivni";
import { KlinikaForm } from "@/components/klinika-form";

export default async function KlinikaPage() {
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;

  if (devMode) {
    profile = DEV_PROFILE;
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profileRes = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;
  }

  const isPremium = profile?.is_premium ?? false;

  return (
    <div className="min-h-full px-5 py-8 md:px-10 md:py-10 max-w-3xl mx-auto flex flex-col gap-8">

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Odborné vzdělávání
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
          <Stethoscope className="h-8 w-8 text-primary" />
          Klinika
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">
          Najeď na oblast která tě trápí
        </p>
      </div>

      {!isPremium ? (
        <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
          <p className="text-sm text-amber-400 font-medium">
            Pro přístup k videím potřebuješ Premium členství.
          </p>
        </div>
      ) : (
        <>
          <div className="glass rounded-2xl p-6">
            <KlinikaInteraktivni />
          </div>

          <KlinikaForm />
        </>
      )}

    </div>
  );
}
