"use client";

import { ChevronRight } from "lucide-react";

const ZONY = [
  { slug: "hlava", label: "Bolest hlavy", hasContent: false },
  { slug: "krc", label: "Bolest za krkem", hasContent: true },
  { slug: "rameno", label: "Bolest ramene", hasContent: false },
  { slug: "zada", label: "Bolest zad (lopatky)", hasContent: true },
  { slug: "loket", label: "Bolest lokte", hasContent: false },
  { slug: "zapesti", label: "Bolest zápěstí a prstů", hasContent: false },
  { slug: "bedera", label: "Bolest beder", hasContent: false },
  { slug: "kriz", label: "Bolest v kříži", hasContent: false },
  { slug: "kycle", label: "Bolest kyčle", hasContent: false },
  { slug: "stehno", label: "Bolest stehna", hasContent: false },
  { slug: "koleno", label: "Bolest kolene", hasContent: false },
  { slug: "lytko", label: "Bolest lýtka (křeče)", hasContent: false },
  { slug: "kotnik", label: "Bolest kotníku", hasContent: false },
  { slug: "pata", label: "Bolest paty", hasContent: false },
  { slug: "chodidlo", label: "Bolest chodidla", hasContent: false },
];

export function KlinikaZony() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ZONY.map((zona) =>
        zona.hasContent ? (
          <a
            key={zona.slug}
            href={`/klinika/${zona.slug}`}
            className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 active:scale-[0.97]"
            style={{
              background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
              boxShadow: "-4px 3px 14px rgba(0,0,0,0.20), 0 2px 10px rgba(0,168,124,0.22)",
            }}
          >
            <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/30" />
            <span className="flex-1 font-semibold text-sm leading-snug text-white pl-1">{zona.label}</span>
            <ChevronRight className="h-4 w-4 text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <div
            key={zona.slug}
            className="relative overflow-hidden rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "oklch(0.18 0.04 168 / 0.7)",
              border: "1px solid oklch(0.35 0.08 168 / 0.5)",
            }}
          >
            <span
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: "oklch(0.45 0.10 168 / 0.4)" }}
            />
            <span
              className="flex-1 text-sm leading-snug font-medium pl-1"
              style={{ color: "oklch(0.65 0.05 168)" }}
            >
              {zona.label}
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider shrink-0"
              style={{ color: "#00D4A0" }}
            >
              Brzy
            </span>
          </div>
        )
      )}
    </div>
  );
}
