"use client";

import { ChevronRight } from "lucide-react";
import { useVideoStore } from "@/store/video-store";
import { useRouter } from "next/navigation";
import type { Training } from "@/types/database";

const ZONY = [
  { slug: "hlava",    label: "Bolest hlavy",            keywords: ["hlav"] },
  { slug: "krc",      label: "Bolest za krkem",          keywords: ["krk", "krkem"] },
  { slug: "rameno",   label: "Bolest ramene",            keywords: ["ramen"] },
  { slug: "zada",     label: "Bolest zad (lopatky)",     keywords: ["zad", "lopatk"] },
  { slug: "loket",    label: "Bolest lokte",             keywords: ["loket", "lokt"] },
  { slug: "zapesti",  label: "Bolest zápěstí a prstů",  keywords: ["záp", "zápěst", "zapest", "prst"] },
  { slug: "bedera",   label: "Bolest beder",             keywords: ["beder", "bedra"] },
  { slug: "kriz",     label: "Bolest v kříži",           keywords: ["kříž", "kriz"] },
  { slug: "kycle",    label: "Bolest kyčle",             keywords: ["kyčl", "kycl", "kyčle"] },
  { slug: "stehno",   label: "Bolest stehna",            keywords: ["stehn"] },
  { slug: "koleno",   label: "Bolest kolene",            keywords: ["kolen"] },
  { slug: "lytko",    label: "Bolest lýtka (křeče)",    keywords: ["lýtk", "lytk", "křeč"] },
  { slug: "kotnik",   label: "Bolest kotníku",           keywords: ["kotník", "kotnik"] },
  { slug: "pata",     label: "Bolest paty",              keywords: ["pat"] },
  { slug: "chodidlo", label: "Bolest chodidla",          keywords: ["chodidl"] },
];

interface Props {
  trainings: Training[];
}

export function KlinikaZony({ trainings }: Props) {
  const { openVideo } = useVideoStore();
  const router = useRouter();

  function getZonaTrainings(keywords: string[]): Training[] {
    return trainings.filter((t) =>
      keywords.some((kw) => t.title.toLowerCase().includes(kw.toLowerCase()))
    );
  }

  function handleZona(slug: string, zonaTrainings: Training[]) {
    if (zonaTrainings.length === 1) {
      openVideo(zonaTrainings[0], null);
    } else {
      router.push(`/klinika/${slug}`);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {ZONY.map((zona) => {
        const zonaTrainings = getZonaTrainings(zona.keywords);
        const hasContent = zonaTrainings.length > 0;

        return hasContent ? (
          <button
            key={zona.slug}
            onClick={() => handleZona(zona.slug, zonaTrainings)}
            className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 text-left transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
              boxShadow: "-4px 3px 14px rgba(0,0,0,0.20), 0 2px 10px rgba(0,168,124,0.22)",
            }}
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/30" />
            <span className="flex-1 font-semibold text-sm leading-snug text-white pl-1">{zona.label}</span>
            <ChevronRight className="h-4 w-4 text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div
            key={zona.slug}
            className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "oklch(0.18 0.04 168 / 0.7)",
              border: "1px solid oklch(0.35 0.08 168 / 0.5)",
            }}
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "oklch(0.45 0.10 168 / 0.4)" }} />
            <span className="flex-1 text-sm leading-snug font-medium pl-1" style={{ color: "oklch(0.65 0.05 168)" }}>
              {zona.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ color: "#00D4A0" }}>
              Brzy
            </span>
          </div>
        );
      })}
    </div>
  );
}
