"use client";

import { useVideoStore } from "@/store/video-store";
import type { Training, UserProgress } from "@/types/database";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

interface Props {
  training: Training;
  index: number;
  label?: string;
  progress?: UserProgress | null;
  locked?: boolean;
}

export function TrainingCardButton({ training, index, label = "Lekce", progress, locked }: Props) {
  const { openVideo } = useVideoStore();

  const pct = progress
    ? Math.min(100, (progress.watched_seconds / training.duration_seconds) * 100)
    : 0;
  const minutes = Math.ceil(training.duration_seconds / 60);

  return (
    <div
      className={`glass rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 ${
        locked ? "opacity-50" : "glass-hover cursor-pointer active:scale-[0.98]"
      }`}
      onClick={() => !locked && openVideo(training, progress ?? null)}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
        {progress?.is_completed ? (
          <CheckCircle2 className="h-5 w-5 text-primary" />
        ) : locked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          <PlayCircle className="h-5 w-5 text-primary" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/50 mb-0.5">
              {label} {index + 1}
            </p>
            <p className="font-semibold leading-snug truncate">{training.title}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0 mt-0.5 tabular-nums">
            {minutes} min
          </span>
        </div>
        {training.description && (
          <p className="text-sm text-muted-foreground truncate mt-1">{training.description}</p>
        )}
        {pct > 0 && !progress?.is_completed && (
          <div className="mt-2 h-1 rounded-full bg-primary/12 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {!locked && (
        <span className="text-primary/40 text-xl font-thin shrink-0">›</span>
      )}
    </div>
  );
}
