"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Wind, Moon, Dumbbell, Volume2, Vibrate, VolumeX } from "lucide-react";

interface Phase {
  label: string;
  duration: number;
  expand: boolean;
  freq: number;
}

interface Mode {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  phases: Phase[];
}

const MODES: Mode[] = [
  {
    key: "stres",
    label: "Uklidnění",
    description: "4 s nádech, 4 s zádrž, 4 s výdech, 4 s zádrž — vyvážený rytmus pro rychlé odbourání každodenního stresu, zklidnění roztěkané mysli a navrácení vnitřní rovnováhy.",
    icon: Wind,
    color: "#00D4A0",
    phases: [
      { label: "Nádech", duration: 4, expand: true, freq: 528 },
      { label: "Zadržení", duration: 4, expand: true, freq: 396 },
      { label: "Výdech", duration: 4, expand: false, freq: 285 },
      { label: "Zadržení", duration: 4, expand: false, freq: 396 },
    ],
  },
  {
    key: "spanim",
    label: "Před spaním",
    description: "4 s nádech, 7 s zádrž, 8 s výdech — hluboký relaxační rytmus, který účinně utlumí nervovou soustavu, zpomalí srdeční tep a připraví tělo i mysl na kvalitní spánek.",
    icon: Moon,
    color: "#7C9EFF",
    phases: [
      { label: "Nádech", duration: 4, expand: true, freq: 432 },
      { label: "Zadržení", duration: 7, expand: true, freq: 324 },
      { label: "Výdech", duration: 8, expand: false, freq: 216 },
    ],
  },
  {
    key: "trenink",
    label: "Po tréninku",
    description: "4 s nádech, 2 s zádrž, 6 s výdech — regenerační rytmus, který efektivně snižuje tepovou frekvenci a bezpečně přepíná organismus z fyzické zátěže do režimu obnovy.",
    icon: Dumbbell,
    color: "#00D4A0",
    phases: [
      { label: "Nádech", duration: 4, expand: true, freq: 528 },
      { label: "Zadržení", duration: 2, expand: true, freq: 396 },
      { label: "Výdech", duration: 6, expand: false, freq: 285 },
    ],
  },
];

const TIMER_PRESETS = [3, 5, 10, 15];
type FeedbackMode = "sound" | "vibrate" | "both" | "none";

let sharedCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!sharedCtx) sharedCtx = new AudioContext();
  return sharedCtx;
}

function playTone(freq: number) {
  try {
    const ctx = getCtx();
    const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    });
  } catch {}
}

function vibrate(pattern: number | number[]) {
  try { navigator.vibrate(pattern); } catch {}
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BreathingCircle() {
  const [modeIndex, setModeIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMode>("sound");
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerLeft, setTimerLeft] = useState(0);

  const phaseRef = useRef(phaseIndex);
  phaseRef.current = phaseIndex;
  const timerLeftRef = useRef(timerLeft);
  timerLeftRef.current = timerLeft;

  const mode = MODES[modeIndex];
  const phase = mode.phases[phaseIndex];
  const color = mode.color;

  const triggerFeedback = useCallback((freq: number) => {
    if (feedback === "sound" || feedback === "both") playTone(freq);
    if (feedback === "vibrate" || feedback === "both") vibrate([60]);
  }, [feedback]);

  function stop() {
    setIsRunning(false);
    setExpanded(false);
    setPhaseIndex(0);
    setTimeLeft(0);
    setTimerLeft(0);
  }

  function start() {
    setPhaseIndex(0);
    setTimeLeft(mode.phases[0].duration);
    setExpanded(mode.phases[0].expand);
    setTimerLeft(timerMinutes * 60);
    setIsRunning(true);
    triggerFeedback(mode.phases[0].freq);
  }

  function switchMode(i: number) {
    stop();
    setModeIndex(i);
  }

  // Phase tick
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseRef.current + 1) % mode.phases.length;
          const nextPhase = mode.phases[nextIndex];
          setPhaseIndex(nextIndex);
          setExpanded(nextPhase.expand);
          triggerFeedback(nextPhase.freq);
          return nextPhase.duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode, triggerFeedback]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          stop();
          if (feedback === "vibrate" || feedback === "both") vibrate([100, 50, 100, 50, 200]);
          if (feedback === "sound" || feedback === "both") playTone(220);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, feedback]);

  useEffect(() => { stop(); }, [modeIndex]);

  const transitionDuration = isRunning ? `${phase.duration}s` : "0.3s";
  const Icon = mode.icon;

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Mode tabs */}
      <div
        className="flex rounded-2xl p-1 gap-1 w-full"
        style={{ background: "oklch(0.18 0.04 168 / 0.6)", border: "1px solid oklch(0.35 0.08 168 / 0.4)" }}
      >
        {MODES.map((m, i) => {
          const MIcon = m.icon;
          const active = i === modeIndex;
          return (
            <button
              key={m.key}
              onClick={() => switchMode(i)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={active
                ? { background: "linear-gradient(105deg, #006B50, #00A87C)", color: "white" }
                : { color: "oklch(0.65 0.05 168)" }
              }
            >
              <MIcon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-center text-muted-foreground px-2 leading-relaxed">{mode.description}</p>

      {/* Settings — jen když neběží */}
      {!isRunning && (
        <div className="w-full flex flex-col gap-3">

          {/* Timer preset */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Délka cvičení</p>
            <div className="flex gap-2">
              {TIMER_PRESETS.map((min) => (
                <button
                  key={min}
                  onClick={() => setTimerMinutes(min)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={timerMinutes === min
                    ? { background: "linear-gradient(105deg, #006B50, #00A87C)", color: "white" }
                    : { background: "oklch(0.22 0.05 168 / 0.7)", border: "1px solid oklch(0.35 0.08 168 / 0.5)", color: "oklch(0.65 0.05 168)" }
                  }
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">Signál změny</p>
            <div className="flex gap-2">
              {([
                { key: "sound", label: "Zvuk", icon: Volume2 },
                { key: "vibrate", label: "Vibrace", icon: Vibrate },
                { key: "both", label: "Oboje", icon: Volume2 },
                { key: "none", label: "Ticho", icon: VolumeX },
              ] as { key: FeedbackMode; label: string; icon: React.ElementType }[]).map(({ key, label, icon: FIcon }) => (
                <button
                  key={key}
                  onClick={() => setFeedback(key)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-semibold transition-all duration-200"
                  style={feedback === key
                    ? { background: "linear-gradient(105deg, #006B50, #00A87C)", color: "white" }
                    : { background: "oklch(0.22 0.05 168 / 0.7)", border: "1px solid oklch(0.35 0.08 168 / 0.5)", color: "oklch(0.65 0.05 168)" }
                  }
                >
                  <FIcon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timer remaining — jen když běží */}
      {isRunning && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Zbývá</span>
          <span className="text-sm font-bold tabular-nums" style={{ color }}>{formatTime(timerLeft)}</span>
        </div>
      )}

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        <div
          className="absolute rounded-full transition-all"
          style={{
            width: expanded ? 260 : 200,
            height: expanded ? 260 : 200,
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            transitionDuration,
            transitionTimingFunction: expanded ? "ease-in" : "ease-out",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: expanded ? 230 : 175,
            height: expanded ? 230 : 175,
            border: `2px solid ${color}44`,
            transition: `all ${transitionDuration} ${expanded ? "ease-in" : "ease-out"}`,
          }}
        />
        <div
          className="absolute rounded-full flex flex-col items-center justify-center gap-1"
          style={{
            width: expanded ? 200 : 150,
            height: expanded ? 200 : 150,
            background: isRunning
              ? `radial-gradient(circle at 35% 35%, ${color}55, ${color}22)`
              : "oklch(0.20 0.05 168 / 0.8)",
            border: `2px solid ${color}${isRunning ? "99" : "44"}`,
            transition: `all ${transitionDuration} ${expanded ? "ease-in" : "ease-out"}`,
            boxShadow: isRunning ? `0 0 30px ${color}33` : "none",
          }}
        >
          {isRunning ? (
            <>
              <p className="text-sm font-bold text-white">{phase.label}</p>
              <p className="text-3xl font-bold tabular-nums" style={{ color }}>{timeLeft}</p>
            </>
          ) : (
            <Icon className="h-10 w-10" style={{ color }} />
          )}
        </div>
      </div>

      {/* Phase indicators */}
      {isRunning && (
        <div className="flex gap-2 flex-wrap justify-center">
          {mode.phases.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-1.5 w-12 rounded-full transition-all duration-300"
                style={{ background: i === phaseIndex ? color : "oklch(0.35 0.08 168 / 0.5)" }}
              />
              <span className="text-[10px]" style={{ color: i === phaseIndex ? color : "oklch(0.45 0.06 168)" }}>
                {p.label} {p.duration}s
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Start / Stop */}
      <button
        onClick={isRunning ? stop : start}
        className="px-10 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
        style={isRunning
          ? { background: "oklch(0.25 0.06 168 / 0.8)", border: "1px solid oklch(0.45 0.10 168 / 0.5)", color: "oklch(0.75 0.05 168)" }
          : { background: "linear-gradient(105deg, #006B50, #00A87C, #00BF90)", color: "white", boxShadow: "-4px 3px 14px rgba(0,0,0,0.20)" }
        }
      >
        {isRunning ? "Zastavit" : `Začít · ${timerMinutes} min`}
      </button>

    </div>
  );
}
