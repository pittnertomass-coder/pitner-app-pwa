"use client";

import { ChevronRight, ChevronDown } from "lucide-react";
import { useVideoStore } from "@/store/video-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Training } from "@/types/database";

const SEKCE = [
  {
    label: "Hlava a krk",
    zony: [
      { slug: "hlava", label: "Bolest hlavy", keywords: ["hlav"] },
      { slug: "krc", label: "Bolest za krkem", keywords: ["krk", "krkem", "cervik"] },
    ],
  },
  {
    label: "Horní končetina a hrudník",
    zony: [
      { slug: "rameno", label: "Bolest ramene", keywords: ["ramen", "rotátorová", "lopatk"] },
      { slug: "zada", label: "Bolest zad (lopatky)", keywords: ["zad", "lopatk", "hrudní"] },
      { slug: "loket", label: "Bolest lokte", keywords: ["loket", "lokt"] },
      { slug: "tenis-loket", label: "Tenisový / Golfový loket", keywords: ["tenis", "golf", "předloktí", "úchop"] },
      { slug: "zapesti", label: "Bolest zápěstí a prstů", keywords: ["záp", "zápěst", "zapest", "prst", "extenzor"] },
    ],
  },
  {
    label: "Trup a pánev",
    zony: [
      { slug: "bedera", label: "Bolest beder", keywords: ["beder", "bedra", "nitrobřišní", "core"] },
      { slug: "kriz", label: "Bolest v kříži", keywords: ["kříž", "kriz", "lumbo"] },
      { slug: "si-sklubeni", label: "SI skloubení", keywords: ["si skl", "křížokyčel", "sakro", "sakr"] },
    ],
  },
  {
    label: "Dolní končetina",
    zony: [
      { slug: "kycle", label: "Bolest kyčle", keywords: ["kyčl", "kycl", "kyčle", "gluteál"] },
      { slug: "trisla", label: "Bolest třísel (Adduktory)", keywords: ["třísl", "adduktor", "trisla"] },
      { slug: "stehno", label: "Bolest stehna", keywords: ["stehn", "kvadricep", "hamstring"] },
      { slug: "koleno", label: "Bolest kolene", keywords: ["kolen", "patelof", "menisk"] },
      { slug: "lytko", label: "Bolest lýtka (křeče)", keywords: ["lýtk", "lytk", "křeč", "soleus", "gastro"] },
      { slug: "achillovka", label: "Achillova šlacha", keywords: ["achil", "tendinop"] },
      { slug: "kotnik", label: "Bolest kotníku", keywords: ["kotník", "kotnik", "výron", "dorzifl"] },
      { slug: "pata", label: "Bolest paty", keywords: ["pat"] },
      { slug: "plantarni", label: "Plantární fascie", keywords: ["plantár", "klenb", "plantar"] },
      { slug: "chodidlo", label: "Bolest chodidla", keywords: ["chodidl", "klenba", "obuv"] },
    ],
  },
];

const POMUCKY = [
  { emoji: "🦾", label: "Odporová guma", desc: "Různé síly pro tahy, brzdění i fixaci" },
  { emoji: "🧱", label: "Stěna / zeď", desc: "Pro oporu, tlaky a odemykání rozsahů" },
  { emoji: "🪑", label: "Židle nebo gauč", desc: "Pro sezení, oporu u dřepů nebo podložení nohou" },
  { emoji: "📦", label: "Schod nebo bedna", desc: "Excentrické výpony a práce s lýtky / Achillovkou" },
  { emoji: "🪣", label: "Ručník / osuška", desc: "Válec na silný úchop nebo Windlass mechanismus" },
  { emoji: "🔨", label: "Kladivo nebo pánev", desc: "Excentrická páka a zátěž do rotace" },
  { emoji: "🔁", label: "Gumička na vlasy", desc: "Pro extenzory prstů — snadná a levná pomůcka" },
  { emoji: "💧", label: "Lahev s vodou", desc: "Jako zátěž pro zápěstí — lehká jednoručka" },
  { emoji: "🎾", label: "Tenisák nebo ponožky", desc: "Pro fixaci osy kotníků" },
  { emoji: "🛏️", label: "Polštář / deka", desc: "Pro podložení kolen nebo úlevovou trakci" },
];

interface Props {
  trainings: Training[];
}

export function KlinikaZony({ trainings }: Props) {
  const { openVideo } = useVideoStore();
  const router = useRouter();
  const [pomuckyOpen, setPomuckyOpen] = useState(false);

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
    <div className="flex flex-col gap-5">
      {SEKCE.map((sekce) => (
        <div key={sekce.label} className="flex flex-col gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] px-1" style={{ color: "#00D4A0" }}>
            {sekce.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {sekce.zony.map((zona) => {
              const zonaTrainings = getZonaTrainings(zona.keywords);
              const hasContent = zonaTrainings.length > 0;

              return hasContent ? (
                <button
                  key={zona.slug}
                  onClick={() => handleZona(zona.slug, zonaTrainings)}
                  className="group relative overflow-hidden rounded-2xl p-3.5 flex items-center gap-2 text-left transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
                    boxShadow: "-4px 3px 14px rgba(0,0,0,0.20), 0 2px 10px rgba(0,168,124,0.22)",
                  }}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/30" />
                  <span className="flex-1 font-semibold text-xs leading-snug text-white pl-1">{zona.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/70 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div
                  key={zona.slug}
                  className="relative overflow-hidden rounded-2xl p-3.5 flex items-center gap-2"
                  style={{
                    background: "oklch(0.18 0.04 168 / 0.7)",
                    border: "1px solid oklch(0.35 0.08 168 / 0.5)",
                  }}
                >
                  <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "oklch(0.45 0.10 168 / 0.4)" }} />
                  <span className="flex-1 text-xs leading-snug font-medium pl-1" style={{ color: "oklch(0.65 0.05 168)" }}>
                    {zona.label}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ color: "#00D4A0" }}>
                    Brzy
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Pomůcky */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid oklch(0.35 0.08 168 / 0.5)" }}
      >
        <button
          onClick={() => setPomuckyOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors"
          style={{ background: "oklch(0.18 0.04 168 / 0.7)" }}
        >
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#00D4A0" }}>
            Co budeš potřebovat
          </span>
          <ChevronDown
            className="h-4 w-4 transition-transform duration-200"
            style={{ color: "#00D4A0", transform: pomuckyOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
        {pomuckyOpen && (
          <div className="px-4 pb-4 pt-1 flex flex-col gap-1.5" style={{ background: "oklch(0.16 0.03 168 / 0.6)" }}>
            {POMUCKY.map((p, i) => (
              <div key={i} className="flex items-start gap-3 py-1.5">
                <span className="text-xl shrink-0">{p.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{p.label}</p>
                  <p className="text-xs leading-snug text-muted-foreground mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
