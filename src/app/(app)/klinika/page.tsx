import { Stethoscope } from "lucide-react";
import Image from "next/image";
import { Pripravujeme } from "@/components/pripravujeme";

const ZONY_PREVIEW = [
  "Bolest hlavy", "Bolest za krkem", "Bolest ramene", "Bolest zad (lopatky)",
  "Bolest lokte", "Tenisový / Golfový loket", "Bolest zápěstí a prstů", "Bolest beder",
  "Bolest v kříži", "SI skloubení",
];

export default function KlinikaPage() {
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
      {/* Skutečný design Kliniky — jen rozmazaný */}
      <div className="flex flex-col gap-4">

        {/* Hero s panáčkem */}
        <div
          className="relative overflow-hidden rounded-2xl flex items-center"
          style={{
            background: "linear-gradient(160deg, oklch(0.22 0.08 168) 0%, oklch(0.14 0.04 168) 100%)",
            minHeight: 160,
          }}
        >
          <div className="p-5 z-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">Odborné vzdělávání</p>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              <Stethoscope className="h-6 w-6 text-primary" />
              Klinika
            </h2>
            <p className="text-white/60 text-xs mt-1">Vyber oblast která tě trápí</p>
          </div>
          <div className="absolute bottom-0 right-0">
            <Image
              src="/brand/panáček klinika_result.webp"
              alt="Panáček"
              width={120}
              height={160}
              className="object-contain opacity-80"
              style={{ maxHeight: 160, width: "auto" }}
            />
          </div>
        </div>

        {/* Zóny grid */}
        <div className="grid grid-cols-2 gap-2">
          {ZONY_PREVIEW.map((zona, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl p-3.5 flex items-center gap-2"
              style={i < 2
                ? { background: "linear-gradient(105deg, #006B50, #00A87C, #00BF90)", boxShadow: "-4px 3px 14px rgba(0,0,0,0.20)" }
                : { background: "oklch(0.18 0.04 168 / 0.7)", border: "1px solid oklch(0.35 0.08 168 / 0.5)" }
              }
            >
              <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: i < 2 ? "rgba(255,255,255,0.3)" : "oklch(0.45 0.10 168 / 0.4)" }} />
              <span className="flex-1 text-xs font-semibold pl-1" style={{ color: i < 2 ? "white" : "oklch(0.65 0.05 168)" }}>
                {zona}
              </span>
              {i < 2
                ? <span className="text-white/70 text-sm">›</span>
                : <span className="text-[9px] font-bold uppercase" style={{ color: "#00D4A0" }}>Brzy</span>
              }
            </div>
          ))}
        </div>
      </div>
    </Pripravujeme>
  );
}
