import { Route } from "lucide-react";
import { Pripravujeme } from "@/components/pripravujeme";
import { DEV_TRAININGS } from "@/lib/dev-mock";

const PREVIEW_TRAININGS = DEV_TRAININGS.filter((t) => t.category === "cesta");

export default function CestaPage() {
  return (
    // TEST v3
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
      {/* Skutečný design Cesty — jen rozmazaný */}
      <div className="flex flex-col gap-4">
        {/* Progress bar */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Postup</span>
            <span className="text-sm font-bold text-primary">0 / 8</span>
          </div>
          <div className="h-1.5 rounded-full bg-primary/12 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: "2%" }} />
          </div>
          <p className="text-xs text-muted-foreground">0 z 8 lekcí dokončeno</p>
        </div>

        {/* Týdenní karty */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
          <div
            key={week}
            className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
            style={week === 1
              ? { background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)", boxShadow: "-6px 4px 18px rgba(0,0,0,0.22)" }
              : { background: "oklch(0.24 0.04 168 / 0.8)", border: "1px solid oklch(0.45 0.08 168 / 0.5)" }
            }
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: week === 1 ? "rgba(255,255,255,0.4)" : "oklch(0.55 0.10 168 / 0.5)" }} />
            <div className="flex-1 pl-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: week === 1 ? "rgba(255,255,255,0.7)" : "oklch(0.65 0.10 168)" }}>
                Týden {week}
              </p>
              <p className="text-lg font-bold leading-tight" style={{ color: week === 1 ? "white" : "oklch(0.75 0.05 168)" }}>
                {week === 1 ? PREVIEW_TRAININGS[0]?.title ?? "Trénink 1" : "Připravujeme"}
              </p>
            </div>
            {week === 1
              ? <span className="text-white/70 text-2xl font-thin">›</span>
              : <span className="text-2xl" style={{ color: "oklch(0.55 0.08 168)" }}>🔒</span>
            }
          </div>
        ))}
      </div>
    </Pripravujeme>
  );
}
