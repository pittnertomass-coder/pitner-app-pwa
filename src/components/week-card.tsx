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
        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/40" />
        <div className="flex-1 min-w-0 pl-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 text-white/70">
            Týden {week}
          </p>
          <p className="text-lg font-bold leading-tight text-white">
            {trainings.length} {trainings.length === 1 ? "lekce" : trainings.length < 5 ? "lekce" : "lekcí"}
          </p>
          {completedInWeek > 0 && (
            <p className="text-xs mt-0.5 text-white/70">
              {completedInWeek} z {trainings.length} dokončeno
            </p>
          )}
        </div>
        <div className="shrink-0">
          {completedInWeek === trainings.length && trainings.length > 0 ? (
            <span className="text-2xl text-white">✓</span>
          ) : (
            <ChevronRight className="h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </>
    );

    const cardClass =
      "group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer";
    const cardStyle = {
      background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
      border: "none",
      boxShadow: "-6px 4px 18px rgba(0,0,0,0.22), 0 2px 12px rgba(0,168,124,0.25)",
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

  const hasContent = trainings.length > 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: "oklch(0.24 0.04 168 / 0.8)",
        border: "1px solid oklch(0.45 0.08 168 / 0.5)",
      }}
    >
      <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: "oklch(0.55 0.10 168 / 0.5)" }} />
      <div className="flex-1 min-w-0 pl-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: "oklch(0.65 0.10 168)" }}>
          Týden {week}
        </p>
        <p className="text-lg font-bold leading-tight" style={{ color: "oklch(0.75 0.05 168)" }}>
          {hasContent
            ? `${trainings.length} ${trainings.length === 1 ? "lekce" : trainings.length < 5 ? "lekce" : "lekcí"}`
            : "Připravujeme"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.07 168)" }}>
          {hasContent
            ? `Odemkne se za ${daysUntilUnlock} ${daysUntilUnlock === 1 ? "den" : daysUntilUnlock < 5 ? "dny" : "dní"}`
            : "Obsah brzy přibude"}
        </p>
      </div>
      <Lock className="h-5 w-5 shrink-0" style={{ color: "oklch(0.55 0.08 168)" }} />
    </div>
  );
}
