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
  { id: "hlava",    label: "Bolest hlavy",           available: false, dotX: 150, dotY: 16  },
  { id: "krc",      label: "Bolest za krkem",         available: true,  dotX: 150, dotY: 40  },
  { id: "rameno",   label: "Bolest ramene",           available: false, dotX: 198, dotY: 64  },
  { id: "zada",     label: "Bolest zad (lopatky)",    available: true,  dotX: 150, dotY: 96  },
  { id: "loket",    label: "Bolest lokte",            available: false, dotX: 245, dotY: 128 },
  { id: "zapesti",  label: "Bolest zápěstí a prstů", available: false, dotX: 256, dotY: 168 },
  { id: "beder",    label: "Bolest beder",            available: false, dotX: 150, dotY: 146 },
  { id: "kriz",     label: "Bolest v kříži",          available: false, dotX: 150, dotY: 162 },
  { id: "kycle",    label: "Bolest kyčle",            available: false, dotX: 168, dotY: 174 },
  { id: "stehno",   label: "Bolest stehna",           available: false, dotX: 160, dotY: 200 },
  { id: "koleno",   label: "Bolest kolene",           available: false, dotX: 155, dotY: 220 },
  { id: "lytko",    label: "Bolest lýtka (křeče)",   available: false, dotX: 155, dotY: 250 },
  { id: "kotnik",   label: "Bolest kotníku",          available: false, dotX: 150, dotY: 273 },
  { id: "pata",     label: "Bolest paty",             available: false, dotX: 145, dotY: 284 },
  { id: "chodidlo", label: "Bolest chodidla",         available: false, dotX: 150, dotY: 293 },
];

export function KlinikaInteraktivni() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(zone: Zone) {
    if (zone.available) router.push(`/klinika/${zone.id}`);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Desktop: foto s floating panelem — Mobile: foto pak seznam */}
      <div className="relative w-full select-none">
        <Image
          src="/brand/panáček klinika_result.webp"
          alt="Anatomický model těla"
          width={600}
          height={600}
          className="w-full h-auto rounded-xl"
          priority
        />

        {/* SVG dots overlay */}
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
                  <circle cx={zone.dotX} cy={zone.dotY} r={11} fill="none"
                    stroke={MINT} strokeWidth={1.5} opacity={0.3} />
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

        {/* Floating glass panel — desktop only */}
        <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[44%] flex-col justify-center gap-0.5 px-3 py-4"
          style={{
            background: "linear-gradient(to left, rgba(0,0,0,0.72) 60%, rgba(0,0,0,0) 100%)",
            borderRadius: "0 12px 12px 0",
          }}
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
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-150",
                  isActive ? "bg-white/10" : "hover:bg-white/6",
                  zone.available ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? MINT : zone.available ? "rgba(0,212,160,0.65)" : "rgba(255,255,255,0.18)",
                    boxShadow: isActive ? `0 0 5px ${MINT}` : "none",
                  }}
                />
                <span className={cn(
                  "flex-1 text-xs font-medium leading-tight transition-colors duration-150",
                  isActive ? "text-white" : zone.available ? "text-white/80" : "text-white/35"
                )}>
                  {zone.label}
                </span>
                {zone.available ? (
                  <ChevronRight className={cn(
                    "h-3 w-3 shrink-0 transition-all duration-150",
                    isActive ? "text-primary translate-x-0.5" : "text-primary/50"
                  )} />
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/22 shrink-0">brzy</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile list — pod fotkou */}
      <div className="flex flex-col gap-1.5 md:hidden">
        {ZONES.map((zone) => {
          const isActive = hovered === zone.id;
          return (
            <div
              key={zone.id}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(zone)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200",
                isActive ? "bg-primary/12 border border-primary/30" : "bg-white/4 border border-white/6",
                zone.available ? "cursor-pointer" : "cursor-default"
              )}
            >
              <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{
                  background: isActive ? MINT : zone.available ? "rgba(0,212,160,0.7)" : "rgba(255,255,255,0.2)",
                }}
              />
              <span className={cn(
                "flex-1 text-sm font-medium",
                isActive ? "text-primary" : zone.available ? "text-foreground" : "text-muted-foreground/55"
              )}>
                {zone.label}
              </span>
              {zone.available ? (
                <ChevronRight className="h-4 w-4 text-primary/70 shrink-0" />
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/30 shrink-0">brzy</span>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
