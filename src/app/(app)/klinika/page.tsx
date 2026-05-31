import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import Image from "next/image";
import type { Profile, Training } from "@/types/database";
import { isDevBypass, DEV_PROFILE, DEV_TRAININGS } from "@/lib/dev-mock";
import { KlinikaZony } from "@/components/klinika-zony";
import { KlinikaForm } from "@/components/klinika-form";
import { Pripravujeme } from "@/components/pripravujeme";

export default async function KlinikaPage() {
  const openAccess = process.env.OPEN_ACCESS === "1";
  const devMode = await isDevBypass();

  let profile: Pick<Profile, "is_premium"> | null;
  let trainings: Training[] | null;

  if (devMode) {
    profile = DEV_PROFILE;
    trainings = DEV_TRAININGS.filter((t) => t.category === "klinika");
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [profileRes, trainingsRes] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", user.id).single(),
      supabase.from("trainings").select("*").eq("category", "klinika").eq("is_published", true).order("order_index"),
    ]);

    profile = profileRes.data as Pick<Profile, "is_premium"> | null;
    trainings = trainingsRes.data as Training[] | null;
  }

  const isPremium = profile?.is_premium ?? false;

  if (openAccess) {
    return (
      <Pripravujeme
        icon={Stethoscope}
        title="Klinika"
        subtitle="Odborné vzdělávání zaměřené na tvé bolesti"
        items={[
          "20 oblastí bolesti — od hlavy až po chodidlo",
          "Videa s konkrétními cviky od fyzioterapeuta",
          "Interaktivní výběr podle místa bolesti",
          "Pomůcky dostupné doma bez posilovny",
        ]}
      >
        <div className="flex flex-col gap-3 py-2">
          {["Bolest hlavy", "Bolest za krkem", "Bolest ramene", "Bolest zad (lopatky)", "Bolest lokte"].map((label, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)" }}
            >
              <span className="flex-1 font-semibold text-sm text-white pl-1">{label}</span>
              <span className="text-white/70">›</span>
            </div>
          ))}
        </div>
      </Pripravujeme>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <div
        className="relative overflow-hidden flex items-end justify-center"
        style={{
          background: "linear-gradient(160deg, oklch(0.22 0.08 168) 0%, oklch(0.14 0.04 168) 100%)",
          minHeight: 220,
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(0,212,160,0.18) 0%, transparent 70%)" }}
        />
        <div className="absolute top-8 left-5 md:left-10 space-y-0.5 z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">Odborné vzdělávání</p>
          <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3 text-white">
            <Stethoscope className="h-8 w-8 text-primary" />
            Klinika
          </h1>
          <p className="text-white/60 text-sm pt-0.5">Vyber oblast která tě trápí</p>
        </div>
        <div className="absolute bottom-0 right-0 z-10">
          <Image
            src="/brand/panáček klinika_result.webp"
            alt="Anatomický panáček"
            width={300}
            height={400}
            className="object-contain select-none pointer-events-none"
            style={{ maxHeight: 220, width: "auto", opacity: 0.92 }}
            priority
          />
        </div>
      </div>

      <div className="flex-1 px-5 py-6 md:px-10 max-w-xl mx-auto w-full flex flex-col gap-6">
        {!isPremium ? (
          <div className="glass rounded-2xl p-5 border border-amber-500/30 bg-amber-500/5">
            <p className="text-sm text-amber-400 font-medium">Pro přístup k videím potřebuješ Premium členství.</p>
          </div>
        ) : (
          <KlinikaZony trainings={trainings ?? []} />
        )}
        <KlinikaForm />
      </div>
    </div>
  );
}
