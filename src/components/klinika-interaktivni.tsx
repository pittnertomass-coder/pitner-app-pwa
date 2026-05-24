"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MINT = "#00D4A0";

interface Zone {
  id: string;
  label: string;
  available: boolean;
  dotX: number;
  dotY: number;
}

// Pozice teček na fotce (viewBox 0 0 300 300)
const ZONES: Zone[] = [
  { id: "hlava",    label: "Bolest hlavy",               available: false, dotX: 150, dotY: 16  },
  { id: "krc",      label: "Bolest za krkem",             available: true,  dotX: 150, dotY: 40  },
  { id: "rameno",   label: "Bolest ramene",               available: false, dotX: 198, dotY: 64  },
  { id: "zada",     label: "Bolest zad (lopatky)",        available: true,  dotX: 150, dotY: 96  },
  { id: "loket",    label: "Bolest lokte",                available: false, dotX: 245, dotY: 128 },
  { id: "zapesti",  label: "Bolest zápěstí a prstů",     available: false, dotX: 256, dotY: 168 },
  { id: "beder",    label: "Bolest beder",                available: false, dotX: 150, dotY: 146 },
  { id: "kriz",     label: "Bolest v kříži",              available: false, dotX: 150, dotY: 162 },
  { id: "kycle",    label: "Bolest kyčle",                available: false, dotX: 168, dotY: 174 },
  { id: "stehno",   label: "Bolest stehna",               available: false, dotX: 160, dotY: 200 },
  { id: "koleno",   label: "Bolest kolene",               available: false, dotX: 155, dotY: 220 },
  { id: "lytko",    label: "Bolest lýtka (křeče)",       available: false, dotX: 155, dotY: 250 },
  { id: "kotnik",   label: "Bolest kotníku",              available: false, dotX: 150, dotY: 273 },
  { id: "pata",     label: "Bolest paty",                 available: false, dotX: 145, dotY: 284 },
  { id: "chodidlo", label: "Bolest chodidla",             available: false, dotX: 150, dotY: 293 },
];

export function KlinikaInteraktivni() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(zone: Zone) {
    if (zone.available) router.push(`/klinika/${zone.id}`);
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">

      {/* Fotka s overlay tečkami */}
      <div className="w-full md:w-[48%] shrink-0">
        <div className="relative w-full max-w-[420px] mx-auto md:mx-0 select-none">
          <Image
            src="/brand/panáček klinika_result.webp"
            alt="Anatomický model těla"
            width={600}
            height={600}
            className="w-full h-auto"
            priority
          />
          <svg
            viewBox="0 0 300 300"
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            {ZONES.map((zone) => {
              const isActive = hovered === zone.id;
              return (
                <g key={zone.id}>
                  {/* Outer glow ring when active */}
                  {isActive && (
                    <circle
                      cx={zone.dotX}
                      cy={zone.dotY}
                      r={10}
                      fill="none"
                      stroke={MINT}
                      strokeWidth={1.5}
                      opacity={0.35}
                    />
                  )}
                  {/* Dot */}
                  <circle
                    cx={zone.dotX}
                    cy={zone.dotY}
                    r={isActive ? 5 : 3}
                    fill={
                      isActive
                        ? MINT
                        : zone.available
                        ? "rgba(0,212,160,0.7)"
                        : "rgba(255,255,255,0.22)"
                    }
                    style={{
                      filter: isActive ? `drop-shadow(0 0 6px ${MINT})` : "none",
                      transition: "all 0.2s",
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Seznam zón */}
      <div className="flex-1 w-full flex flex-col gap-2">
        {ZONES.map((zone) => {
          const isActive = hovered === zone.id;
          return (
            <div
              key={zone.id}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(zone)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 cursor-default",
                isActive
                  ? "bg-primary/12 border border-primary/30"
                  : "bg-white/4 border border-white/6 hover:bg-white/7",
                zone.available && "cursor-pointer"
              )}
            >
              {/* Dot indikátor */}
              <span
                className="shrink-0 w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  background: isActive
                    ? MINT
                    : zone.available
                    ? "rgba(0,212,160,0.7)"
                    : "rgba(255,255,255,0.2)",
                  boxShadow: isActive ? `0 0 6px ${MINT}` : "none",
                }}
              />

              {/* Název */}
              <span
                className={cn(
                  "flex-1 text-sm font-medium transition-colors duration-200",
                  isActive ? "text-primary" : zone.available ? "text-foreground" : "text-muted-foreground/60"
                )}
              >
                {zone.label}
              </span>

              {/* Stav */}
              {zone.available ? (
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    isActive ? "text-primary translate-x-0.5" : "text-primary/50"
                  )}
                />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/35 shrink-0">
                  brzy
                </span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
