"use client";

import { Lock } from "lucide-react";
import { useVideoStore } from "@/store/video-store";
import type { Training, UserProgress } from "@/types/database";

interface Props {
  training: Training;
  index: number;
  progress: UserProgress | null;
  isUnlocked: boolean;
  daysUntilUnlock: number;
}

export function CestaTrainingCard({ training, index, progress, isUnlocked, daysUntilUnlock }: Props) {
  const { openVideo } = useVideoStore();
  const isCompleted = progress?.is_completed ?? false;

  if (isUnlocked) {
    return (
      <div
        className="group relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
          border: "none",
          boxShadow: "-6px 4px 18px rgba(0,0,0,0.22), 0 2px 12px rgba(0,168,124,0.25)",
        }}
        onClick={() => openVideo(training, progress)}
      >
        <span className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-white/40" />
        <div className="flex-1 min-w-0 pl-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 text-white/70">
            Týden {index}
          </p>
          <p className="text-lg font-bold leading-tight text-white line-clamp-2">
            {training.title}
          </p>
          {isCompleted && (
            <p className="text-xs mt-0.5 text-white/70">Dokončeno</p>
          )}
        </div>
        <div className="shrink-0">
          {isCompleted ? (
            <span className="text-2xl text-white">✓</span>
          ) : (
            <span className="text-white/70 text-2xl font-thin group-hover:translate-x-1 transition-transform inline-block">›</span>
          )}
        </div>
      </div>
    );
  }

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
          Týden {index}
        </p>
        <p className="text-lg font-bold leading-tight line-clamp-2" style={{ color: "oklch(0.75 0.05 168)" }}>
          {training.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "oklch(0.55 0.07 168)" }}>
          Odemkne se za {daysUntilUnlock} {daysUntilUnlock === 1 ? "den" : daysUntilUnlock < 5 ? "dny" : "dní"}
        </p>
      </div>
      <Lock className="h-5 w-5 shrink-0" style={{ color: "oklch(0.55 0.08 168)" }} />
    </div>
  );
}
