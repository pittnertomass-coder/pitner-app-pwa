import { Route } from "lucide-react";
import { Pripravujeme } from "@/components/pripravujeme";
import { isDevBypass, DEV_TRAININGS, DEV_PROGRESS } from "@/lib/dev-mock";
import type { Training, UserProgress } from "@/types/database";

export default async function CestaPage() {
  const devMode = await isDevBypass();

  let trainings: Training[] = [];
  let progress: UserProgress[] = [];

  if (devMode) {
    trainings = DEV_TRAININGS.filter((t) => t.category === "cesta");
    progress = DEV_PROGRESS;
  } else {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const [t, p] = await Promise.all([
        supabase.from("trainings").select("*").eq("category", "cesta").eq("is_published", true).order("week_number").order("order_index"),
        supabase.from("user_progress").select("*"),
      ]);
      trainings = (t.data as Training[]) ?? [];
      progress = (p.data as UserProgress[]) ?? [];
    } catch {}
  }

  return (
    <Pripravujeme
      icon={Route}
      title="Cesta"
      subtitle="Tvůj tréninkový program krok za krokem"
      items={[
        "Týdenní tréninkový plán přizpůsobený tvému tělu",
        "Videa s odborným vedením od Tomáše Pitnera",
        "Sledování pokroku a dokončených lekcí",
        "Postupné odemykání obsahu každý týden",
      ]}
    >
      <div className="flex flex-col gap-4 py-2">
        {trainings.slice(0, 5).map((t, i) => (
          <div
            key={t.id}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{
              background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
            }}
          >
            <div className="flex-1 min-w-0 pl-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 text-white/70">Týden {i + 1}</p>
              <p className="text-lg font-bold text-white truncate">{t.title}</p>
            </div>
            <span className="text-white/70 text-2xl">›</span>
          </div>
        ))}
        {[...Array(Math.max(0, 5 - trainings.length))].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "oklch(0.24 0.04 168 / 0.8)", border: "1px solid oklch(0.45 0.08 168 / 0.5)" }}
          >
            <div className="flex-1 pl-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: "oklch(0.65 0.10 168)" }}>
                Týden {trainings.length + i + 1}
              </p>
              <p className="text-lg font-bold" style={{ color: "oklch(0.75 0.05 168)" }}>Připravujeme</p>
            </div>
          </div>
        ))}
      </div>
    </Pripravujeme>
  );
}
