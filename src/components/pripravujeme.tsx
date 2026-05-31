"use client";

import { Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  items: string[];
  children: React.ReactNode;
}

export function Pripravujeme({ icon: Icon, title, subtitle, items, children }: Props) {
  return (
    <div className="min-h-full flex flex-col">

      {/* Header */}
      <div className="px-5 pt-8 pb-4 md:px-10 max-w-xl mx-auto w-full space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/60">
          Brzy dostupné
        </p>
        <h1 className="text-4xl font-bold tracking-tight leading-tight flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          {title}
        </h1>
        <p className="text-muted-foreground text-sm pt-0.5">{subtitle}</p>
      </div>

      {/* Obsah + overlay */}
      <div className="relative flex-1 px-5 pb-8 md:px-10 max-w-xl mx-auto w-full">

        {/* Rozmazaný obsah v pozadí */}
        <div className="blur-sm opacity-40 pointer-events-none select-none">
          {children}
        </div>

        {/* Overlay karta */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4">
          <div
            className="relative overflow-hidden rounded-2xl p-7 flex flex-col items-center gap-4 text-center w-full max-w-sm"
            style={{
              background: "linear-gradient(135deg, oklch(0.22 0.08 168 / 0.97) 0%, oklch(0.14 0.04 168 / 0.97) 100%)",
              boxShadow: "-6px 4px 24px rgba(0,0,0,0.35), 0 2px 16px rgba(0,168,124,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,212,160,0.2)",
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "rgba(0,212,160,0.15)", border: "1px solid rgba(0,212,160,0.3)" }}
            >
              <Clock className="h-8 w-8" style={{ color: "#00D4A0" }} />
            </div>

            <div className="space-y-1.5">
              <p className="text-xl font-bold text-white">Připravujeme</p>
              <p className="text-xs text-white/60 leading-relaxed">
                Pracujeme na obsahu, aby byl co nejkvalitnější. Brzy spustíme.
              </p>
            </div>

            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,212,160,0.15)" }}>
              <div
                className="h-full rounded-full animate-pulse"
                style={{ width: "55%", background: "linear-gradient(90deg, #00D4A0, #00BF90)" }}
              />
            </div>

            <div className="w-full flex flex-col gap-1.5 mt-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-left">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{ background: "rgba(0,212,160,0.2)", color: "#00D4A0" }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-xs text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
