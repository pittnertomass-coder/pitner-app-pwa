"use client";

import { useEffect, useRef, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { usePlayerStore } from "@/store/player-store";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";
import { createClient } from "@/lib/supabase/client";
import type { AudioTrack } from "@/types/database";

interface AudioPlayerProps {
  tracks: AudioTrack[];
}

export function AudioPlayer({ tracks }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { currentTrack, isPlaying, currentTime, duration, volume, setTrack, setIsPlaying, setCurrentTime, setDuration, setVolume } = usePlayerStore();
  const { user } = useAuthStore();
  const { setAudioProgress } = useProgressStore();

  const saveProgress = useCallback(async (position: number) => {
    if (!user || !currentTrack) return;
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("user_audio_progress")
      .upsert(
        { user_id: user.id, track_id: currentTrack.id, position_seconds: Math.floor(position), last_listened_at: new Date().toISOString() },
        { onConflict: "user_id,track_id" }
      )
      .select()
      .single();
    if (data) setAudioProgress(currentTrack.id, data as import("@/types/database").UserAudioProgress);
  }, [user, currentTrack, setAudioProgress]);

  const updateMediaSession = useCallback((track: AudioTrack) => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: "Tomáš Pitner",
      album: "Pitner App",
      artwork: track.cover_url
        ? [{ src: track.cover_url, sizes: "512x512", type: "image/jpeg" }]
        : [],
    });
  }, []);

  const play = useCallback(async (track?: AudioTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (track && track.id !== currentTrack?.id) {
      if (!track.file_url) {
        // Dev mock — žádná URL, jen zobrazíme track bez přehrávání
        setTrack(track);
        updateMediaSession(track);
        return;
      }
      setTrack(track);
      audio.src = track.file_url;
      audio.load();
      updateMediaSession(track);
    }
    if (!audio.src || audio.src === window.location.href) return;
    await audio.play().catch(() => {});
    setIsPlaying(true);
  }, [currentTrack, setTrack, setIsPlaying, updateMediaSession]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const skip = useCallback((delta: number) => {
    if (audioRef.current) audioRef.current.currentTime += delta;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (saveTimerRef.current) return;
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        saveProgress(audio.currentTime);
      }, 15000);
    };

    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => { setIsPlaying(false); saveProgress(audio.duration || 0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [setCurrentTime, setDuration, setIsPlaying, saveProgress]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => play());
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-10));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(30));
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying, play, pause, skip]);

  return (
    <div className="space-y-6">
      <audio ref={audioRef} preload="metadata" />

      {currentTrack && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarImage src={currentTrack.cover_url ?? undefined} alt={currentTrack.title} />
              <AvatarFallback className="rounded-lg text-lg">TP</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{currentTrack.title}</p>
              <p className="text-sm text-muted-foreground">Tomáš Pitner</p>
            </div>
          </div>

          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 1}
              step={1}
              onValueChange={(vals) => { const v = typeof vals === "number" ? vals : vals[0]; if (audioRef.current) audioRef.current.currentTime = v; }}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => skip(-10)} title="−10 s">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => isPlaying ? pause() : play()}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => skip(30)} title="+30 s">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => play(track)}
            className={`w-full text-left rounded-lg border p-4 transition-colors hover:border-primary/50 ${
              currentTrack?.id === track.id ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-md shrink-0">
                <AvatarImage src={track.cover_url ?? undefined} alt={track.title} />
                <AvatarFallback className="rounded-md text-sm">TP</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{track.title}</p>
                {track.description && (
                  <p className="text-xs text-muted-foreground truncate">{track.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{fmt(track.duration_seconds)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function fmt(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
