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
  top: number;  // % od vrchu
  left: number; // % od leva
}

// Pozice jako % obrazku (4096x4096 čtverec, přední pohled)
const ZONES: Zone[] = [
  { id: "hlava",    label: "Bolest hlavy",           available: false, top:  7,  left: 50 },
  { id: "krc",      label: "Bolest za krkem",         available: true,  top: 16,  left: 50 },
  { id: "rameno",   label: "Bolest ramene",           available: false, top: 21,  left: 77 },
  { id: "zada",     label: "Bolest zad (lopatky)",    available: true,  top: 30,  left: 50 },
  { id: "loket",    label: "Bolest lokte",            available: false, top: 47,  left: 85 },
  { id: "zapesti",  label: "Bolest zápěstí a prstů", available: false, top: 62,  left: 87 },
  { id: "beder",    label: "Bolest beder",            available: false, top: 49,  left: 50 },
  { id: "kriz",     label: "Bolest v kříži",          available: false, top: 55,  left: 50 },
  { id: "kycle",    label: "Bolest kyčle",            available: false, top: 57,  left: 58 },
  { id: "stehno",   label: "Bolest stehna",           available: false, top: 66,  left: 53 },
  { id: "koleno",   label: "Bolest kolene",           available: false, top: 74,  left: 52 },
  { id: "lytko",    label: "Bolest lýtka (křeče)",   available: false, top: 83,  left: 52 },
  { id: "kotnik",   label: "Bolest kotníku",          available: false, top: 90,  left: 50 },
  { id: "pata",     label: "Bolest paty",             available: false, top: 94,  left: 48 },
  { id: "chodidlo", label: "Bolest chodidla",         available: false, top: 96,  left: 52 },
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
          width={4096}
          height={4096}
          className="w-full h-auto rounded-xl"
          priority
        />

        {/* Tečky jako absolutní divy v % */}
        {ZONES.map((zone) => {
          const isActive = hovered === zone.id;
          return (
            <div
              key={zone.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ top: `${zone.top}%`, left: `${zone.left}%` }}
            >
              {/* Glow ring */}
              {isActive && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{
                    width: 22, height: 22,
                    left: "50%", top: "50%",
                    borderColor: MINT,
                    opacity: 0.4,
                  }}
                />
              )}
              {/* Tečka */}
              <div
                className="rounded-full transition-all duration-200"
                style={{
                  width: isActive ? 11 : 7,
                  height: isActive ? 11 : 7,
                  background: isActive
                    ? MINT
                    : zone.available
                    ? "rgba(0,212,160,0.8)"
                    : "rgba(255,255,255,0.35)",
                  boxShadow: isActive ? `0 0 8px ${MINT}` : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Seznam zón vpravo */}
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
                  background: isActive ? MINT : zone.available ? "rgba(0,212,160,0.75)" : "rgba(255,255,255,0.35)",
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
