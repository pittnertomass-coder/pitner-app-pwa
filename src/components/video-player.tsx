"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import type { Timestamp } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";

interface VideoPlayerProps {
  trainingId: string;
  bunnyLibraryId: string;
  bunnyVideoId: string;
  timestamps?: Timestamp[];
  initialSeconds?: number;
}

export function VideoPlayer({
  trainingId,
  bunnyLibraryId,
  bunnyVideoId,
  timestamps = [],
  initialSeconds = 0,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [ready, setReady] = useState(false);

  const { user } = useAuthStore();
  const { setVideoProgress } = useProgressStore();

  const hlsUrl = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyVideoId}/playlist.m3u8`;

  const seekTo = useCallback((seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  }, []);

  const saveProgress = useCallback(async (watchedSeconds: number, completed: boolean) => {
    if (!user) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("user_progress")
      .upsert(
        { user_id: user.id, training_id: trainingId, watched_seconds: Math.floor(watchedSeconds), is_completed: completed, last_watched_at: new Date().toISOString() },
        { onConflict: "user_id,training_id" }
      )
      .select()
      .single();
    if (data) setVideoProgress(trainingId, data as import("@/types/database").UserProgress);
  }, [user, trainingId, setVideoProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setReady(true);
          if (initialSeconds > 0) video.currentTime = initialSeconds;
        });
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener("loadedmetadata", () => {
          setReady(true);
          if (initialSeconds > 0) video.currentTime = initialSeconds;
        });
      }
    };

    initPlayer();

    const handleTimeUpdate = () => {
      if (saveTimerRef.current) return;
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        const duration = video.duration || 1;
        const pct = video.currentTime / duration;
        saveProgress(video.currentTime, pct > 0.9);
      }, 10000);
    };

    const handleEnded = () => saveProgress(video.duration, true);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      hlsRef.current?.destroy();
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [hlsUrl, initialSeconds, saveProgress]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          className="h-full w-full"
          controls
          playsInline
          preload="metadata"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {timestamps.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Kapitoly
          </p>
          <div className="flex flex-wrap gap-2">
            {timestamps.map((ts) => (
              <Button
                key={ts.seconds}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => seekTo(ts.seconds)}
              >
                {formatTime(ts.seconds)} — {ts.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
