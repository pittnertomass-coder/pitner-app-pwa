"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Play, Pause, SkipBack, SkipForward, Moon, Headphones } from "lucide-react";
import { useAudioSheetStore } from "@/store/audio-sheet-store";
import { usePlayerStore } from "@/store/player-store";

const SPEEDS = [1, 1.25, 1.5, 2] as const;
type Speed = typeof SPEEDS[number];

const SLEEP_OPTIONS = [15, 30, 45] as const;

export function AudioSheet() {
  const { track, isOpen, closeAudio } = useAudioSheetStore();
  const { currentTrack, isPlaying, currentTime, duration,
    setTrack, setIsPlaying, setCurrentTime, setDuration } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [speed, setSpeed] = useState<Speed>(1);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // ── Audio element lifecycle ────────────────────────────────
  useEffect(() => {
    if (!isOpen || !track) return;

    const audio = new Audio(track.file_url);
    audio.preload = "metadata";
    audio.playbackRate = speed;
    audioRef.current = audio;

    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    setTrack(track);
    setCurrentTime(0);
    setDuration(0);

    playPromiseRef.current = audio.play().catch(() => {});
    setIsPlaying(true);

    // Media Session API
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: "Pitner Coaching",
        artwork: track.cover_url ? [{ src: track.cover_url }] : [],
      });
      navigator.mediaSession.setActionHandler("play", () => safePlay());
      navigator.mediaSession.setActionHandler("pause", () => safePause());
      navigator.mediaSession.setActionHandler("seekbackward", () => seekBy(-30));
      navigator.mediaSession.setActionHandler("seekforward", () => seekBy(15));
    }

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [isOpen, track?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Sleep timer countdown
  useEffect(() => {
    if (sleepMinutes === null) { setSleepRemaining(null); return; }
    const end = Date.now() + sleepMinutes * 60_000;
    setSleepRemaining(sleepMinutes * 60);

    const tick = setInterval(() => {
      const rem = Math.max(0, Math.round((end - Date.now()) / 1000));
      setSleepRemaining(rem);
      if (rem === 0) {
        clearInterval(tick);
        safePause();
        setSleepMinutes(null);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [sleepMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Controls ──────────────────────────────────────────────
  const safePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playPromiseRef.current = audio.play().catch(() => {});
    setIsPlaying(true);
  }, [setIsPlaying]);

  const safePause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const p = playPromiseRef.current;
    if (p) { p.then(() => audio.pause()).catch(() => {}); }
    else { audio.pause(); }
    setIsPlaying(false);
  }, [setIsPlaying]);

  const togglePlay = () => isPlaying ? safePause() : safePlay();

  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + delta));
  };

  const seekTo = (pct: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = pct * audio.duration;
  };

  const handleClose = () => {
    safePause();
    setSleepMinutes(null);
    setShowSleepMenu(false);
    closeAudio();
  };

  const cycleSleepTimer = (minutes: number) => {
    setSleepMinutes(minutes);
    setShowSleepMenu(false);
  };

  const cancelSleep = () => {
    setSleepMinutes(null);
    setShowSleepMenu(false);
  };

  // ── Derived display values ────────────────────────────────
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const sleepLabel = sleepRemaining !== null
    ? `${Math.floor(sleepRemaining / 60)}:${(sleepRemaining % 60).toString().padStart(2, "0")}`
    : null;

  const displayTrack = track ?? currentTrack;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        style={{ zIndex: 50, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 flex flex-col transition-transform duration-350 ease-out"
        style={{
          zIndex: 51,
          height: "92dvh",
          borderRadius: "20px 20px 0 0",
          background: "oklch(0.08 0.012 168)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -8px 40px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* Sleep menu click-away overlay — inside sheet's stacking context */}
        {showSleepMenu && (
          <div
            className="absolute inset-0 rounded-[20px]"
            style={{ zIndex: 5 }}
            onClick={() => setShowSleepMenu(false)}
          />
        )}

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 shrink-0">
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#00D4A0" }}>
              Audio průvodce
            </p>
            <p className="text-sm font-semibold text-white truncate">{displayTrack?.title}</p>
          </div>
        </div>

        {/* Cover art */}
        <div className="shrink-0 px-8 pt-4 pb-6">
          <div
            className="w-full aspect-square rounded-3xl overflow-hidden flex items-center justify-center mx-auto"
            style={{
              maxWidth: 280,
              background: displayTrack?.cover_url
                ? undefined
                : "linear-gradient(135deg, oklch(0.22 0.06 168), oklch(0.14 0.03 168))",
              boxShadow: "0 16px 48px oklch(0 0 0 / 0.5)",
            }}
          >
            {displayTrack?.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayTrack.cover_url}
                alt={displayTrack.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Headphones className="h-20 w-20 opacity-30" style={{ color: "#00D4A0" }} />
            )}
          </div>
        </div>

        {/* Track title */}
        <div className="shrink-0 px-8 pb-4 text-center">
          <p className="text-xl font-bold text-white leading-snug">{displayTrack?.title}</p>
          <p className="text-sm mt-1" style={{ color: "oklch(1 0 0 / 0.45)" }}>Pitner Coaching</p>
        </div>

        {/* Progress bar */}
        <div className="shrink-0 px-8 pb-2">
          <div
            className="h-1 rounded-full cursor-pointer"
            style={{ background: "oklch(1 0 0 / 0.12)" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekTo((e.clientX - rect.left) / rect.width);
            }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, background: "#00D4A0", transition: "width 0.25s linear" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs tabular-nums" style={{ color: "oklch(1 0 0 / 0.35)" }}>{fmt(currentTime)}</span>
            <span className="text-xs tabular-nums" style={{ color: "oklch(1 0 0 / 0.35)" }}>{duration > 0 ? fmt(duration) : "--:--"}</span>
          </div>
        </div>

        {/* Main controls */}
        <div className="shrink-0 px-8 py-3 flex items-center justify-between">
          {/* −30s */}
          <button
            onClick={() => seekBy(-30)}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl active:scale-95 transition-transform"
            style={{ background: "oklch(1 0 0 / 0.08)" }}
          >
            <SkipBack className="h-5 w-5 text-white" />
            <span className="text-[9px] font-bold text-white/50 mt-0.5">−30s</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
            style={{
              width: 72, height: 72,
              background: "#00D4A0",
              boxShadow: "0 0 28px #00D4A060",
            }}
          >
            {isPlaying
              ? <Pause className="h-8 w-8" style={{ color: "#0A1A14", fill: "#0A1A14" }} />
              : <Play className="h-8 w-8" style={{ color: "#0A1A14", fill: "#0A1A14", marginLeft: 3 }} />
            }
          </button>

          {/* +15s */}
          <button
            onClick={() => seekBy(15)}
            className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl active:scale-95 transition-transform"
            style={{ background: "oklch(1 0 0 / 0.08)" }}
          >
            <SkipForward className="h-5 w-5 text-white" />
            <span className="text-[9px] font-bold text-white/50 mt-0.5">+15s</span>
          </button>
        </div>

        {/* Speed + Sleep row */}
        <div className="shrink-0 px-8 pt-1 pb-4 flex items-center justify-between gap-3" style={{ position: "relative", zIndex: 10 }}>
          {/* Speed switcher */}
          <div className="flex gap-1.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{
                  background: speed === s ? "#00D4A0" : "oklch(1 0 0 / 0.08)",
                  color: speed === s ? "#0A1A14" : "oklch(1 0 0 / 0.55)",
                }}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Sleep timer */}
          <div className="relative">
            <button
              onClick={() => sleepMinutes !== null ? cancelSleep() : setShowSleepMenu(!showSleepMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={{
                background: sleepMinutes !== null ? "oklch(0.55 0.15 260 / 0.25)" : "oklch(1 0 0 / 0.08)",
                color: sleepMinutes !== null ? "oklch(0.80 0.12 260)" : "oklch(1 0 0 / 0.55)",
                border: sleepMinutes !== null ? "1px solid oklch(0.65 0.12 260 / 0.4)" : "1px solid transparent",
              }}
            >
              <Moon className="h-3.5 w-3.5" />
              {sleepLabel ?? "Sleep"}
            </button>

            {showSleepMenu && (
              <div
                className="absolute bottom-full right-0 mb-2 flex flex-col gap-1 rounded-2xl overflow-hidden"
                style={{ background: "oklch(0.16 0.022 168)", boxShadow: "0 8px 24px oklch(0 0 0 / 0.5)" }}
              >
                {SLEEP_OPTIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => cycleSleepTimer(min)}
                    className="px-5 py-3 text-sm font-semibold text-left text-white hover:bg-white/5 transition-colors whitespace-nowrap"
                  >
                    {min} minut
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* iOS safe area */}
        <div className="shrink-0" style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
      </div>

    </>
  );
}
