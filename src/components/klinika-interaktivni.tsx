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

const ZONES: Zone[] = [
  { id: "hlava",    label: "Bolest hlavy",           available: false, dotX: 150, dotY: 24  },
  { id: "krc",      label: "Bolest za krkem",         available: true,  dotX: 150, dotY: 52  },
  { id: "rameno",   label: "Bolest ramene",           available: false, dotX: 230, dotY: 67  },
  { id: "zada",     label: "Bolest zad (lopatky)",    available: true,  dotX: 150, dotY: 90  },
  { id: "loket",    label: "Bolest lokte",            available: false, dotX: 252, dotY: 148 },
  { id: "zapesti",  label: "Bolest zápěstí a prstů", available: false, dotX: 258, dotY: 192 },
  { id: "beder",    label: "Bolest beder",            available: false, dotX: 150, dotY: 150 },
  { id: "kriz",     label: "Bolest v kříži",          available: false, dotX: 150, dotY: 168 },
  { id: "kycle",    label: "Bolest kyčle",            available: false, dotX: 170, dotY: 176 },
  { id: "stehno",   label: "Bolest stehna",           available: false, dotX: 160, dotY: 205 },
  { id: "koleno",   label: "Bolest kolene",           available: false, dotX: 155, dotY: 228 },
  { id: "lytko",    label: "Bolest lýtka (křeče)",   available: false, dotX: 155, dotY: 252 },
  { id: "kotnik",   label: "Bolest kotníku",          available: false, dotX: 148, dotY: 270 },
  { id: "pata",     label: "Bolest paty",             available: false, dotX: 140, dotY: 281 },
  { id: "chodidlo", label: "Bolest chodidla",         available: false, dotX: 155, dotY: 288 },
];

export function KlinikaInteraktivni() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(zone: Zone) {
    if (zone.available) router.push(`/klinika/${zone.id}`);
  }

  return (
    <div className="flex items-stretch gap-0">

      {/* Fotka vlevo */}
      <div className="relative w-[65%] shrink-0 select-none">
        <Image
          src="/brand/panáček klinika_result.webp"
          alt="Anatomický model těla"
          width={600}
          height={600}
          className="w-full h-auto rounded-xl"
          priority
        />
        {/* SVG tečky */}
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
                {isActive && (
                  <circle cx={zone.dotX} cy={zone.dotY} r={11}
                    fill="none" stroke={MINT} strokeWidth={1.5} opacity={0.35} />
                )}
                <circle
                  cx={zone.dotX}
                  cy={zone.dotY}
                  r={isActive ? 5.5 : 3.5}
                  fill={isActive ? MINT : zone.available ? "rgba(0,212,160,0.75)" : "rgba(255,255,255,0.25)"}
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

      {/* Seznam zón vpravo — tmavé pozadí */}
      <div
        className="flex-1 flex flex-col justify-center gap-0.5 px-3 py-4 rounded-r-xl overflow-y-auto"
        style={{ background: "rgba(10,20,18,0.82)", backdropFilter: "blur(4px)" }}
      >
        {ZONES.map((zone) => {
          const isActive = hovered === zone.id;
          return (
            <div
              key={zone.id}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(zone)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150",
                isActive ? "bg-white/10" : "hover:bg-white/6",
                zone.available ? "cursor-pointer" : "cursor-default"
              )}
            >
              <span
                className="shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200"
                style={{
                  background: isActive ? MINT : zone.available ? "rgba(0,212,160,0.75)" : "rgba(255,255,255,0.25)",
                  boxShadow: isActive ? `0 0 5px ${MINT}` : "none",
                }}
              />
              <span className={cn(
                "flex-1 text-[11px] font-semibold leading-tight transition-colors duration-150",
                isActive ? "text-primary" : "text-white"
              )}>
                {zone.label}
              </span>
              {zone.available ? (
                <ChevronRight className={cn(
                  "h-3 w-3 shrink-0 transition-all",
                  isActive ? "text-primary" : "text-primary/60"
                )} />
              ) : (
                <span className="text-[8px] font-bold uppercase tracking-wider shrink-0" style={{ color: MINT }}>brzy</span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
