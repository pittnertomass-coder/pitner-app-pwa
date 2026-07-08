"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleTrackLike, toggleSeriesLike } from "@/app/actions/audio-like";

// Malé tlačítko na kartě epizody
export function TrackLikeButton({
  trackId,
  initialCount,
  initialLiked,
}: {
  trackId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasLiked = liked;
    // Okamžitá vizuální reakce — opravíme serverem
    setLiked(!wasLiked);
    setCount(prev => wasLiked ? prev - 1 : prev + 1);

    startTransition(async () => {
      try {
        const result = await toggleTrackLike(trackId);
        setLiked(result.liked);
        setCount(result.count);
      } catch {
        // Vrátíme zpět při chybě
        setLiked(wasLiked);
        setCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={liked ? "Odebrat lajk" : "Přidat lajk"}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: liked ? "#00D4A0" : "oklch(0.28 0.06 168)",
        color: liked ? "#0A1A14" : "#00D4A0",
      }}
    >
      <ThumbsUp
        className="h-3 w-3"
        style={{ fill: liked ? "#0A1A14" : "transparent" }}
      />
      {liked ? (count > 0 ? count : "✓") : (count > 0 ? count : "Lajk")}
    </button>
  );
}

// Velké tlačítko pro konec série
export function SeriesLikeButton({
  category,
  initialCount,
  initialLiked,
}: {
  category: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount(prev => wasLiked ? prev - 1 : prev + 1);

    startTransition(async () => {
      try {
        const result = await toggleSeriesLike(category);
        setLiked(result.liked);
        setCount(result.count);
      } catch {
        setLiked(wasLiked);
        setCount(prev => wasLiked ? prev + 1 : prev - 1);
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
      style={{
        background: liked ? "#00D4A0" : "oklch(1 0 0 / 0.12)",
        color: liked ? "#0A1A14" : "oklch(1 0 0 / 0.8)",
      }}
    >
      <ThumbsUp
        className="h-5 w-5"
        style={{ fill: liked ? "#0A1A14" : "transparent" }}
      />
      {liked ? "Lajknuto!" : "Dejte lajk"}
      {count > 0 && <span className="tabular-nums font-bold">{count}</span>}
    </button>
  );
}
