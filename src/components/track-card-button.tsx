"use client";

import { Play, Pause } from "lucide-react";
import { useAudioSheetStore } from "@/store/audio-sheet-store";
import { usePlayerStore } from "@/store/player-store";
import type { AudioTrack } from "@/types/database";

export function TrackCardButton({ track, index }: { track: AudioTrack; index?: number }) {
  const { openAudio } = useAudioSheetStore();
  const { currentTrack, isPlaying } = usePlayerStore();

  const isActive = currentTrack?.id === track.id;
  const minutes = track.duration_seconds > 0 ? Math.ceil(track.duration_seconds / 60) : null;

  return (
    <button
      onClick={() => openAudio(track)}
      className="group relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 w-full text-left transition-all duration-200 active:scale-[0.98]"
      style={
        isActive
          ? {
              background: "linear-gradient(105deg, #006B50 0%, #00A87C 55%, #00BF90 100%)",
              boxShadow: "-6px 4px 18px rgba(0,0,0,0.22), 0 2px 12px rgba(0,168,124,0.25)",
            }
          : {
              background: "oklch(0.18 0.04 168 / 0.7)",
              border: "1px solid oklch(0.35 0.08 168 / 0.5)",
            }
      }
    >
      {/* Left accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: isActive ? "rgba(255,255,255,0.4)" : "oklch(0.45 0.10 168 / 0.5)" }}
      />

      {/* Number badge */}
      {index !== undefined && (
        <span
          className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold tabular-nums"
          style={{
            background: isActive ? "rgba(255,255,255,0.15)" : "oklch(0.25 0.07 168 / 0.8)",
            color: isActive ? "white" : "#00D4A0",
          }}
        >
          {index}
        </span>
      )}

      {/* Title + duration */}
      <div className="flex-1 min-w-0 pl-1">
        <p
          className="font-semibold text-sm leading-snug line-clamp-2"
          style={{ color: isActive ? "white" : "oklch(0.9 0.03 168)" }}
        >
          {track.title}
        </p>
        {minutes && (
          <p
            className="text-xs mt-0.5"
            style={{ color: isActive ? "rgba(255,255,255,0.65)" : "oklch(0.55 0.07 168)" }}
          >
            {minutes} min
          </p>
        )}
      </div>

      {/* Play indicator */}
      <div
        className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
        style={{ background: isActive ? "rgba(255,255,255,0.15)" : "oklch(0.25 0.07 168 / 0.6)" }}
      >
        {isActive && isPlaying ? (
          <span className="flex gap-0.5 items-end h-4">
            <span className="w-1 rounded-full bg-white animate-pulse" style={{ height: "60%" }} />
            <span className="w-1 rounded-full bg-white animate-pulse" style={{ height: "100%", animationDelay: "0.15s" }} />
            <span className="w-1 rounded-full bg-white animate-pulse" style={{ height: "40%", animationDelay: "0.3s" }} />
          </span>
        ) : isActive ? (
          <Pause className="h-4 w-4 text-white" fill="white" />
        ) : (
          <Play className="h-4 w-4 group-hover:text-primary transition-colors" style={{ color: "#00D4A0", marginLeft: 1 }} fill="#00D4A0" />
        )}
      </div>
    </button>
  );
}
