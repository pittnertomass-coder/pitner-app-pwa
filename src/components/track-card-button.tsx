"use client";

import { Headphones, Play } from "lucide-react";
import { useAudioSheetStore } from "@/store/audio-sheet-store";
import { usePlayerStore } from "@/store/player-store";
import type { AudioTrack } from "@/types/database";

export function TrackCardButton({ track }: { track: AudioTrack }) {
  const { openAudio } = useAudioSheetStore();
  const { currentTrack, isPlaying } = usePlayerStore();

  const isActive = currentTrack?.id === track.id;
  const minutes = Math.ceil(track.duration_seconds / 60);

  return (
    <button
      onClick={() => openAudio(track)}
      className="glass glass-hover rounded-2xl overflow-hidden text-left w-full active:scale-[0.97] transition-all duration-200"
      style={isActive ? { borderColor: "#00D4A0" } : undefined}
    >
      {/* Cover art — square */}
      <div
        className="relative w-full aspect-square flex items-center justify-center overflow-hidden"
        style={{
          background: track.cover_url
            ? undefined
            : "linear-gradient(135deg, oklch(0.22 0.06 168), oklch(0.14 0.03 168))",
        }}
      >
        {track.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.cover_url}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Headphones className="h-10 w-10 opacity-40" style={{ color: "#00D4A0" }} />
        )}

        {/* Play indicator when active */}
        {isActive && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "oklch(0 0 0 / 0.35)" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: "#00D4A0" }}
            >
              {isPlaying
                ? <span className="flex gap-0.5">
                    <span className="w-1 h-4 rounded-full bg-black animate-pulse" />
                    <span className="w-1 h-4 rounded-full bg-black animate-pulse" style={{ animationDelay: "0.15s" }} />
                  </span>
                : <Play className="h-5 w-5 text-black" fill="black" style={{ marginLeft: 2 }} />
              }
            </div>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="p-3 space-y-0.5 h-[4.5rem]">
        <p className="font-semibold text-sm leading-snug line-clamp-2">{track.title}</p>
        <p className="text-xs tabular-nums" style={{ color: "oklch(var(--muted-foreground) / 1)" }}>
          {minutes} min
        </p>
      </div>
    </button>
  );
}
