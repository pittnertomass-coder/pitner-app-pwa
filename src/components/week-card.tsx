"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { useVideoStore } from "@/store/video-store";
import type { Training, UserProgress } from "@/types/database";

interface Props {
  week: number;
  trainings: Training[];
  progressRecord: Record<string, UserProgress>;
  isUnlocked: boolean;
  daysUntilUnlock: number;
}

export function WeekCard({ week, trainings, progressRecord, isUnlocked, daysUntilUnlock }: Props) {
  const { openVideo } = useVideoStore();
  const completedInWeek = trainings.filter((t) => progressRecord[t.id]?.is_completed).length;
  const single = trainings.length === 1;

  if (isUnlocked) {
    const content = (
      <>
        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-primary" />
        <div className="flex-1 min-w-0 pl-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: "rgba(0,212,160,0.8)" }}>
            Týden {week}
          </p>
          <p className="text-lg font-bold leading-tight text-white">
            {trainings.length} {trainings.length === 1 ? "lekce" : trainings.length < 5 ? "lekce" : "lekcí"}
          </p>
          {completedInWeek > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,160,0.8)" }}>
              {completedInWeek} z {trainings.length} dokončeno
            </p>
          )}
        </div>
        <div className="shrink-0">
          {completedInWeek === trainings.length && trainings.length > 0 ? (
            <span className="text-2xl text-white">✓</span>
          ) : (
            <ChevronRight className="h-5 w-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </>
    );

    const cardClass =
      "group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer";
    const cardStyle = {
      background: "linear-gradient(135deg, oklch(0.30 0.10 168) 0%, oklch(0.22 0.07 168) 100%)",
      border: "1px solid oklch(0.45 0.12 168 / 0.5)",
    };

    if (single) {
      return (
        <div
          className={cardClass}
          style={cardStyle}
          onClick={() => openVideo(trainings[0], progressRecord[trainings[0].id] ?? null)}
        >
          {content}
        </div>
      );
    }

    return (
      <Link href={`/cesta/tyden/${week}`} className={cardClass} style={cardStyle}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 opacity-60"
      style={{
        background: "oklch(0.18 0.03 168 / 0.5)",
        border: "1px solid oklch(0.30 0.05 168 / 0.4)",
      }}
    >
      <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-muted-foreground/30" />
      <div className="flex-1 min-w-0 pl-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">
          Týden {week}
        </p>
        <p className="text-lg font-bold leading-tight text-muted-foreground">
          {trainings.length} {trainings.length === 1 ? "lekce" : trainings.length < 5 ? "lekce" : "lekcí"}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Odemkne se za {daysUntilUnlock} {daysUntilUnlock === 1 ? "den" : daysUntilUnlock < 5 ? "dny" : "dní"}
        </p>
      </div>
      <Lock className="h-5 w-5 shrink-0 text-muted-foreground/40" />
    </div>
  );
}
