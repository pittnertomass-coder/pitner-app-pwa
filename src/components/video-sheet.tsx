"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  X, RotateCcw, Play, Pause, ChevronUp, ChevronDown,
  CheckCircle2, RefreshCw, ArrowLeft,
} from "lucide-react";
import { useVideoStore } from "@/store/video-store";
import { useAuthStore } from "@/store/auth-store";
import { useProgressStore } from "@/store/progress-store";
import type { Timestamp } from "@/types/database";

const PLAYER_EVENTS = ["play", "pause", "timeupdate", "ended", "seeked", "durationchange"];

export function VideoSheet() {
  const { training, progress, isOpen, closeVideo, updateProgress } = useVideoStore();
  const { user, profile } = useAuthStore();
  const { setVideoProgress } = useProgressStore();

  const iframeRef         = useRef<HTMLIFrameElement>(null);
  const saveTimerRef      = useRef<NodeJS.Timeout | null>(null);
  const endedRef          = useRef(false);
  const userPausedRef     = useRef(false);
  const isPlayingRef      = useRef(false);
  const lastTuMs          = useRef(0);   // wall-clock ms of last timeupdate
  const lastT             = useRef(0);   // last t value received
  const prevT             = useRef(-1);  // t value one tick ago (frozen detection)
  const frozenCount       = useRef(0);   // consecutive ticks with same t
  const realDuration      = useRef(0);
  const maxTimeSeen       = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);

  const firstName = profile?.full_name?.split(" ")[0] ?? "ty";

  const timestamps: Timestamp[] = Array.isArray(training?.timestamps)
    ? (training.timestamps as unknown as Timestamp[])
    : [];

  const currentChapterIndex = timestamps.length > 0
    ? timestamps.reduce((best, ts, i) => (ts.seconds <= currentTime ? i : best), 0)
    : -1;

  const embedUrl = training
    ? `https://iframe.mediadelivery.net/embed/${training.bunny_library_id}/${training.bunny_video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
    : "";

  // ── Supabase progress save ────────────────────────────────
  const saveProgress = useCallback(async (watchedSeconds: number, completed: boolean) => {
    if (!user || !training) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("user_progress")
      .upsert(
        {
          user_id: user.id,
          training_id: training.id,
          watched_seconds: Math.floor(watchedSeconds),
          is_completed: completed,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,training_id" }
      )
      .select()
      .single();
    if (data) { setVideoProgress(training.id, data); updateProgress(data); }
  }, [user, training, setVideoProgress, updateProgress]);

  // ── triggerCompletion — stable, usable from any effect ───
  const triggerCompletion = useCallback((t: number) => {
    if (endedRef.current) return;
    endedRef.current = true;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setEnded(true);
    setShowCompletion(true);
    saveProgress(t, true);
  }, [saveProgress]);

  // ── postMessage helpers ───────────────────────────────────
  const post = useCallback((msg: object) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");
  }, []);

  const sendCmd = useCallback((method: string, value?: unknown) => {
    post({ context: "player.js", version: "0.0.11", method, ...(value !== undefined && { value }) });
  }, [post]);

  // Subscribe to all player events (player.js requires explicit addEventListener)
  const subscribeEvents = useCallback(() => {
    PLAYER_EVENTS.forEach(ev => sendCmd("addEventListener", ev));
    sendCmd("getDuration");
  }, [sendCmd]);

  const bunnyPlay  = useCallback(() => sendCmd("play"),  [sendCmd]);
  const bunnyPause = useCallback(() => sendCmd("pause"), [sendCmd]);
  const bunnySeek  = useCallback((t: number) => sendCmd("setCurrentTime", t), [sendCmd]);

  // ── Completion detection via two strategies ───────────────
  // Strategy A: stale timeupdate (Bunny stops sending events at end)
  // Strategy B: frozen t value  (Bunny keeps sending same t at end)
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => {
      if (endedRef.current || userPausedRef.current) return;
      const t = lastT.current;
      if (t < 3) return; // haven't played enough yet

      const staleMs = Date.now() - lastTuMs.current;

      // Strategy A — no timeupdate for 2 s
      if (lastTuMs.current > 0 && staleMs > 2000) {
        triggerCompletion(t);
        return;
      }

      // Strategy B — t frozen for 4 consecutive ticks (~2 s at 500ms interval)
      if (t === prevT.current) {
        frozenCount.current++;
        if (frozenCount.current >= 4) triggerCompletion(t);
      } else {
        frozenCount.current = 0;
        prevT.current = t;
      }
    }, 500);
    return () => clearInterval(id);
  }, [isOpen, triggerCompletion]);

  // ── Listen for postMessage events from Bunny.net ─────────
  useEffect(() => {
    if (!isOpen) return;

    const onMessage = (e: MessageEvent) => {
      try {
        const raw = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (!raw || typeof raw !== "object") return;
        // Accept player.js messages
        if (raw.context !== "player.js") return;

        const event = raw.event ?? raw.type;
        const val   = raw.value;

        // Parse currentTime
        const t: number = typeof val === "number"
          ? val
          : (val?.seconds ?? val?.currentTime ?? val?.position ?? 0);
        const dPlayer: number = typeof val === "object" && val !== null
          ? (val?.duration ?? val?.total ?? 0)
          : 0;

        switch (event) {
          case "ready":
            setReady(true);
            subscribeEvents();
            if (progress?.watched_seconds && progress.watched_seconds > 5) {
              setTimeout(() => bunnySeek(progress.watched_seconds), 200);
            }
            break;

          case "getDuration":
          case "duration":
          case "durationchange": {
            const dur = typeof val === "number" ? val : dPlayer;
            if (dur > 0) { realDuration.current = dur; setDuration(dur); }
            break;
          }

          case "play":
            isPlayingRef.current = true;
            userPausedRef.current = false;
            setIsPlaying(true);
            lastTuMs.current = Date.now();
            break;

          case "pause":
            isPlayingRef.current = false;
            setIsPlaying(false);
            break;

          case "timeupdate": {
            if (t > 0) {
              setCurrentTime(t);
              lastTuMs.current = Date.now();
              lastT.current = t;
              if (t > maxTimeSeen.current) maxTimeSeen.current = t;
              isPlayingRef.current = true;
            }
            if (dPlayer > 0) { realDuration.current = dPlayer; setDuration(dPlayer); }
            // Direct duration-based end detection
            if (realDuration.current > 0 && t >= realDuration.current - 1.5) {
              triggerCompletion(t);
            }
            // Throttled progress save
            if (!saveTimerRef.current) {
              saveTimerRef.current = setTimeout(() => {
                saveTimerRef.current = null;
                const d = realDuration.current || training?.duration_seconds || 1;
                saveProgress(t, t / d > 0.9);
              }, 10_000);
            }
            break;
          }

          case "ended":
          case "finish":
          case "complete":
            triggerCompletion(maxTimeSeen.current || realDuration.current || training?.duration_seconds || 0);
            break;

          case "seeked":
            // After seek: reset frozen detection
            prevT.current = -1;
            frozenCount.current = 0;
            break;
        }
      } catch { /* ignore */ }
    };

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isOpen, progress, training, subscribeEvents, bunnySeek, saveProgress, triggerCompletion]);

  // ── Reset on open / new video ─────────────────────────────
  useEffect(() => {
    if (isOpen) {
      endedRef.current        = false;
      userPausedRef.current   = false;
      isPlayingRef.current    = false;
      lastTuMs.current        = 0;
      lastT.current           = 0;
      prevT.current           = -1;
      frozenCount.current     = 0;
      realDuration.current    = 0;
      maxTimeSeen.current     = 0;
      setReady(false);
      setEnded(false);
      setShowCompletion(false);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setShowTimestamps(false);
    }
  }, [isOpen, training?.id]);

  // ── Body scroll lock ──────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Controls ──────────────────────────────────────────────
  const togglePlay = () => {
    if (isPlayingRef.current) {
      userPausedRef.current = true;
      bunnyPause();
    } else {
      userPausedRef.current = false;
      bunnyPlay();
    }
  };

  const rewind10 = () => bunnySeek(Math.max(0, currentTime - 10));

  const seekTo = (seconds: number) => {
    bunnySeek(seconds);
    bunnyPlay();
    setShowTimestamps(false);
  };

  const handleClose = () => {
    bunnyPause();
    if (!ended) saveProgress(currentTime, false);
    closeVideo();
  };

  const handleReplay = () => {
    endedRef.current        = false;
    userPausedRef.current   = false;
    isPlayingRef.current    = false;
    lastTuMs.current        = 0;
    lastT.current           = 0;
    prevT.current           = -1;
    frozenCount.current     = 0;
    maxTimeSeen.current     = 0;
    bunnySeek(0);
    bunnyPlay();
    setEnded(false);
    setShowCompletion(false);
  };

  const chapterLabel = currentChapterIndex >= 0 && timestamps.length > 0
    ? `${currentChapterIndex + 1} / ${timestamps.length}  ·  ${timestamps[currentChapterIndex].label}`
    : null;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  // onLoad handler — subscribe to events even if "ready" event never fires
  const handleIframeLoad = () => {
    setReady(true);
    setTimeout(subscribeEvents, 800);
  };

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
          height: "96dvh",
          borderRadius: "20px 20px 0 0",
          background: "oklch(0.08 0.012 168)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          boxShadow: "0 -8px 40px oklch(0 0 0 / 0.6)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 pb-3 shrink-0">
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "oklch(1 0 0 / 0.1)" }}
          >
            <X className="h-4 w-4 text-white/70" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#00D4A0" }}>
              {training?.category === "klinika" ? "Klinika · Video" : "Cesta · Lekce"}
            </p>
            <p className="text-sm font-semibold text-white truncate">{training?.title}</p>
          </div>
        </div>

        {/* Video area */}
        <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
          {isOpen && embedUrl && (
            <iframe
              key={training?.id}
              ref={iframeRef}
              src={embedUrl}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          )}

          {!ready && isOpen && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="h-11 w-11 animate-spin rounded-full border-2"
                style={{ borderColor: "#00D4A0", borderTopColor: "transparent" }} />
            </div>
          )}

          {/* Completion overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
            style={{
              background: "oklch(0 0 0 / 0.88)",
              zIndex: 20,
              opacity: showCompletion ? 1 : 0,
              pointerEvents: showCompletion ? "auto" : "none",
            }}
          >
            <div className="w-full px-6 space-y-6 max-w-sm mx-auto">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #00D4A0, #00B386)", boxShadow: "0 0 48px #00D4A055" }}>
                  <CheckCircle2 className="h-10 w-10" style={{ color: "#0A1A14" }} />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-bold text-white">Skvělá práce, {firstName}! 🎉</h2>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(1 0 0 / 0.55)" }}>
                  <span className="font-semibold text-white/80">{training?.title}</span>
                  {" "}je úspěšně za tebou.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => closeVideo()}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-[15px] active:scale-[0.98] transition-transform"
                  style={{ background: "linear-gradient(135deg, #00D4A0, #00B386)", color: "#0A1A14", boxShadow: "0 0 32px #00D4A055" }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Pokračovat na přehled
                </button>

                <button
                  onClick={handleReplay}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-semibold text-[15px] active:scale-[0.98] transition-transform"
                  style={{ background: "oklch(1 0 0 / 0.07)", color: "oklch(1 0 0 / 0.8)", border: "1px solid oklch(1 0 0 / 0.15)" }}
                >
                  <RefreshCw className="h-5 w-5" />
                  Chci si to dát ještě jednou
                </button>

                <button
                  onClick={() => setShowCompletion(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium active:opacity-60 transition-opacity"
                  style={{ color: "oklch(1 0 0 / 0.38)" }}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Zpět k detailu lekce
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="shrink-0 h-1 cursor-pointer"
          style={{ background: "oklch(1 0 0 / 0.12)" }}
          onClick={(e) => {
            if (!realDuration.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            bunnySeek((e.clientX - rect.left) / rect.width * realDuration.current);
          }}
        >
          <div className="h-full transition-none" style={{ width: `${progressPct}%`, background: "#00D4A0" }} />
        </div>

        {/* Controls */}
        <div className="shrink-0 px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <button onClick={rewind10}
              className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl active:scale-95 transition-transform"
              style={{ background: "oklch(1 0 0 / 0.08)" }}>
              <RotateCcw className="h-5 w-5 text-white" />
              <span className="text-[9px] font-bold text-white/50 mt-0.5">−10s</span>
            </button>

            <button onClick={togglePlay}
              className="flex items-center justify-center rounded-full active:scale-95 transition-transform"
              style={{ width: 72, height: 72, background: "#00D4A0", boxShadow: "0 0 28px #00D4A060" }}>
              {isPlaying
                ? <Pause className="h-8 w-8" style={{ color: "#0A1A14", fill: "#0A1A14" }} />
                : <Play  className="h-8 w-8" style={{ color: "#0A1A14", fill: "#0A1A14", marginLeft: 3 }} />
              }
            </button>

            <button
              onClick={() => timestamps.length > 0 && setShowTimestamps(true)}
              className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl active:scale-95 transition-transform"
              style={{ background: "oklch(1 0 0 / 0.08)", opacity: timestamps.length === 0 ? 0.3 : 1 }}>
              <ChevronUp className="h-5 w-5 text-white" />
              <span className="text-[9px] font-bold text-white/50 mt-0.5">Cviky</span>
            </button>
          </div>

          {chapterLabel && !ended && (
            <button onClick={() => timestamps.length > 0 && setShowTimestamps(true)}
              className="w-full text-center text-sm font-medium"
              style={{ color: "oklch(1 0 0 / 0.45)" }}>
              {chapterLabel}
            </button>
          )}

          {ended && !showCompletion && (
            <button onClick={() => setShowCompletion(true)}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 font-bold text-base active:scale-[0.98] transition-transform"
              style={{ background: "linear-gradient(135deg, #00D4A0, #00B386)", color: "#0A1A14", boxShadow: "0 0 30px #00D4A050" }}>
              <CheckCircle2 className="h-5 w-5" />
              ODCVIČENO
            </button>
          )}
        </div>

        <div className="shrink-0" style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
      </div>

      {/* Timestamps sheet */}
      <div
        className="fixed inset-x-0 bottom-0 flex flex-col rounded-t-2xl overflow-hidden transition-transform duration-300 ease-out"
        style={{ zIndex: 52, maxHeight: "60dvh", background: "oklch(0.16 0.022 168)", transform: showTimestamps ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid oklch(1 0 0 / 0.08)" }}>
          <div>
            <p className="font-bold text-white">Kapitoly</p>
            <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.4)" }}>{training?.title}</p>
          </div>
          <button onClick={() => setShowTimestamps(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "oklch(1 0 0 / 0.1)" }}>
            <ChevronDown className="h-4 w-4 text-white/70" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {timestamps.map((ts, i) => (
            <button key={ts.seconds} onClick={() => seekTo(ts.seconds)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left active:scale-[0.98] transition-all"
              style={{ borderBottom: "1px solid oklch(1 0 0 / 0.05)", background: i === currentChapterIndex ? "oklch(1 0 0 / 0.05)" : "transparent" }}>
              <span className="text-xs font-bold tabular-nums w-10 shrink-0" style={{ color: "oklch(1 0 0 / 0.35)" }}>{formatTime(ts.seconds)}</span>
              <span className="font-medium flex-1" style={{ color: i === currentChapterIndex ? "#00D4A0" : "oklch(1 0 0 / 0.85)" }}>{ts.label}</span>
              {i === currentChapterIndex && <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "#00D4A0" }} />}
            </button>
          ))}
          <div style={{ height: "env(safe-area-inset-bottom, 16px)" }} />
        </div>
      </div>

      {showTimestamps && (
        <div className="fixed inset-0" style={{ zIndex: 51 }} onClick={() => setShowTimestamps(false)} />
      )}
    </>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
