"use client";

import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

// Cycle order (clockwise from 12 o'clock): Inhale → Hold → Exhale → Hold
const PHASES = [
  { name: "Inhale", subtitle: "breathe in",  color: "#4aa8e8" },
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
  { name: "Exhale", subtitle: "breathe out", color: "#56c9b5" },
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
];
const PHASE_LABELS   = ["Inhale", "Hold", "Exhale", "Hold"];
const PHASE_MS       = 4000;                 // ms per phase
const VOICE_CYCLE_MS = PHASE_MS * 4;        // 16 000 ms — one full cycle
const MIN_R          = 28;
const MAX_R          = 108;
const MID_R          = (MIN_R + MAX_R) / 2; // 68 – idle size
const TRACK_R        = 175;
const TRACK_W        = 8;
const LABEL_V        = 228; // vertical label offset  (Inhale top / Exhale bottom)
const LABEL_H        = 248; // horizontal label offset (Hold left / Hold right)
const S              = 600; // canvas internal px
const C              = S / 2; // center = 300
const SEG_GAP        = 0.04; // radian gap between arc segments

const VOICE_KEY = "crux_voice_guidance_enabled";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function alpha(hex: string, a: number): string {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

function getRadius(phase: number, elapsed: number, idle: boolean): number {
  if (idle) return MID_R;
  const t = Math.min(elapsed / PHASE_MS, 1);
  if (phase === 0) return MIN_R + (MAX_R - MIN_R) * easeInOut(t); // inhale (expand)
  if (phase === 1) return MAX_R;                                   // hold   (full)
  if (phase === 2) return MAX_R - (MAX_R - MIN_R) * easeInOut(t); // exhale (contract)
  return MIN_R;                                                    // hold   (empty)
}

// ─── Component ────────────────────────────────────────────────────────────────

type Status = "idle" | "running" | "paused";

export default function BoxBreathing({ isAudioPlaying }: { isAudioPlaying: boolean }) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const phaseRef     = useRef(0);
  const elapsedRef   = useRef(0);
  const lastTsRef    = useRef(0);
  const isRunningRef = useRef(false);

  // Voice guidance
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status,       setStatus]      = useState<Status>("idle");
  const [autoSync,     setAutoSync]    = useState(false);
  // Safe server-side default; localStorage is read in useEffect after hydration
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // ── Audio bootstrap ────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = new Audio("/audio/box-breathing-intro.wav");
    audio.volume  = 0.8;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Read persisted voice preference after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VOICE_KEY);
      if (stored !== null) setVoiceEnabled(stored === "true");
    } catch { /* noop */ }
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────────

  function draw(idle: boolean) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phase    = phaseRef.current;
    const elapsed  = elapsedRef.current;
    const t        = Math.min(elapsed / PHASE_MS, 1);
    const r        = getRadius(phase, elapsed, idle);
    const pc       = idle ? "#4a6b8a" : PHASES[phase].color;
    const countdown = idle ? "—" : String(Math.max(1, Math.ceil(4 * (1 - t))));

    ctx.clearRect(0, 0, S, S);

    // Aura glow halos
    const maxAura = TRACK_R - 18;
    ([
      [Math.min(r + 22, maxAura - 16), 0.16],
      [Math.min(r + 38, maxAura - 8),  0.08],
      [Math.min(r + 54, maxAura),       0.03],
    ] as [number, number][]).forEach(([ar, a]) => {
      ctx.beginPath();
      ctx.arc(C, C, ar, 0, Math.PI * 2);
      ctx.fillStyle = alpha(pc, a);
      ctx.fill();
    });

    // Breathing circle fill
    const grad = ctx.createRadialGradient(C, C - r * 0.25, 0, C, C, r);
    if (idle) {
      grad.addColorStop(0, "rgba(43,107,127,0.18)");
      grad.addColorStop(1, "rgba(43,107,127,0.06)");
    } else {
      grad.addColorStop(0, alpha(pc, 0.55));
      grad.addColorStop(1, alpha(pc, 0.18));
    }
    ctx.beginPath();
    ctx.arc(C, C, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Breathing circle border
    ctx.beginPath();
    ctx.arc(C, C, r, 0, Math.PI * 2);
    ctx.strokeStyle = idle ? "rgba(43,107,127,0.35)" : pc;
    ctx.lineWidth = idle ? 2 : 3;
    ctx.stroke();

    // Track ring – 4 segments
    for (let i = 0; i < 4; i++) {
      const sa = -Math.PI / 2 + i * (Math.PI / 2) + SEG_GAP / 2;
      const ea = -Math.PI / 2 + (i + 1) * (Math.PI / 2) - SEG_GAP / 2;
      const isActive = !idle && i === phase;

      ctx.beginPath();
      ctx.arc(C, C, TRACK_R, sa, ea);
      ctx.strokeStyle = alpha(PHASES[i].color, idle ? 0.22 : isActive ? 0.3 : 0.22);
      ctx.lineWidth = TRACK_W;
      ctx.lineCap = "round";
      ctx.stroke();

      if (isActive) {
        ctx.beginPath();
        ctx.arc(C, C, TRACK_R, sa, sa + (ea - sa) * t);
        ctx.strokeStyle = PHASES[i].color;
        ctx.lineWidth = TRACK_W;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    // Glowing dot on track ring
    if (!idle) {
      const sa = -Math.PI / 2 + phase * (Math.PI / 2) + SEG_GAP / 2;
      const ea = -Math.PI / 2 + (phase + 1) * (Math.PI / 2) - SEG_GAP / 2;
      const da = sa + (ea - sa) * t;
      const dx = C + Math.cos(da) * TRACK_R;
      const dy = C + Math.sin(da) * TRACK_R;

      const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, 20);
      glow.addColorStop(0, alpha(pc, 0.65));
      glow.addColorStop(1, alpha(pc, 0));
      ctx.beginPath();
      ctx.arc(dx, dy, 20, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dx, dy, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    // Phase labels (compass positions)
    const labelPos: [number, number][] = [
      [C,            C - LABEL_V], // Inhale (top,    12 o'clock)
      [C + LABEL_H,  C],           // Hold   (right,   3 o'clock)
      [C,            C + LABEL_V], // Exhale (bottom,  6 o'clock)
      [C - LABEL_H,  C],           // Hold   (left,    9 o'clock)
    ];
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 26px Arial, sans-serif";
    for (let i = 0; i < 4; i++) {
      const isActive = !idle && i === phase;
      ctx.fillStyle = alpha(PHASES[i].color, idle ? 0.25 : isActive ? 1 : 0.28);
      ctx.fillText(PHASE_LABELS[i], labelPos[i][0], labelPos[i][1]);
    }

    // Centre – countdown or idle dash
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    if (idle) {
      ctx.font      = "200 64px Arial, sans-serif";
      ctx.fillStyle = "rgba(43,107,127,0.5)";
      ctx.fillText("—", C, C - 12);
      ctx.font      = "15px Arial, sans-serif";
      ctx.fillStyle = "rgba(90,107,122,0.7)";
      ctx.fillText("press start", C, C + 46);
    } else {
      ctx.shadowColor = pc;
      ctx.shadowBlur  = 28;
      ctx.font        = "200 72px Arial, sans-serif";
      ctx.fillStyle   = alpha(pc, 0.95);
      ctx.fillText(countdown, C, C);
      ctx.shadowBlur  = 0;
      ctx.shadowColor = "transparent";
    }
  }

  // ── Animation loop ─────────────────────────────────────────────────────────

  function startLoop() {
    function frame(ts: number) {
      if (!isRunningRef.current) return;
      const delta = lastTsRef.current ? ts - lastTsRef.current : 0;
      lastTsRef.current = ts;
      elapsedRef.current += delta;
      while (elapsedRef.current >= PHASE_MS) {
        elapsedRef.current -= PHASE_MS;
        phaseRef.current = (phaseRef.current + 1) % 4;
      }
      draw(false);
      rafRef.current = requestAnimationFrame(frame);
    }
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(frame);
  }

  // ── Voice helpers ──────────────────────────────────────────────────────────

  /** Stop voice audio and cancel any pending stop-timer. */
  function stopVoice() {
    if (voiceTimerRef.current) {
      clearTimeout(voiceTimerRef.current);
      voiceTimerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * Start voice audio in sync with the animation.
   * Audio plays for exactly one full cycle (16 s), then stops automatically.
   * The animation continues unaffected after the voice ends.
   */
  function startVoice() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => { /* audio unavailable — fail silently */ });
    voiceTimerRef.current = setTimeout(() => {
      stopVoice();
    }, VOICE_CYCLE_MS);
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  function start() {
    if (status === "paused") {
      // Resume — don't restart voice mid-session
      isRunningRef.current = true;
      setStatus("running");
      startLoop();
      return;
    }
    // Fresh start — animation and voice begin together
    isRunningRef.current = true;
    setStatus("running");
    startLoop();
    if (voiceEnabled) startVoice();
  }

  function pause() {
    stopVoice();
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setStatus("paused");
    draw(false);
  }

  function reset() {
    stopVoice();
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    phaseRef.current   = 0;
    elapsedRef.current = 0;
    lastTsRef.current  = 0;
    setStatus("idle");
    draw(true);
  }

  function handleToggleVoice() {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    try { localStorage.setItem(VOICE_KEY, String(next)); } catch { /* noop */ }
    // Turning voice off mid-cycle stops playback immediately
    if (!next) stopVoice();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    // Synchronous draw — refs are guaranteed attached in useEffect
    draw(true);
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopVoice();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync: follow the audio player's play/pause state
  useEffect(() => {
    if (!autoSync) return;
    if (isAudioPlaying  && status === "idle")    start();
    if (!isAudioPlaying && status === "running") pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, autoSync]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const btnLabel = status === "running" ? "Pause" : status === "paused" ? "Resume" : "Start";

  return (
    <section id="box-breathing" className="my-16">
      <div
        className="flex flex-col items-center gap-6 rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <h2 className="text-[32px] font-bold tracking-tight text-[var(--text-primary)]">
          Box Breathing
        </h2>

        <canvas
          ref={canvasRef}
          width={S}
          height={S}
          style={{ width: 380, height: 380, borderRadius: 20, background: "var(--background-card)" }}
          aria-label="Box breathing animation"
        />

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={status === "running" ? pause : start}
            className="px-6 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] font-semibold text-sm transition-all hover:bg-[var(--primary)] hover:text-white cursor-pointer"
          >
            {btnLabel}
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] font-semibold text-sm transition-all hover:border-[var(--primary)] cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Label */}
        <p className="text-xs text-[var(--text-secondary)] opacity-50 tracking-widest">
          4 · 4 · 4 · 4 · box breathing
        </p>

        {/* Voice guidance toggle
            Uses a <div role="switch"> instead of <button> inside <label>
            to prevent browsers double-dispatching click (label → button → handler twice). */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleToggleVoice}
          role="presentation"
        >
          <div
            role="switch"
            aria-checked={voiceEnabled}
            tabIndex={0}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && handleToggleVoice()}
            className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              voiceEnabled ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                voiceEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
            {voiceEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            )}
            Voice guidance
          </span>
        </div>

        {/* Auto-sync toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            role="switch"
            aria-checked={autoSync}
            onClick={() => setAutoSync((v) => !v)}
            className={`relative w-11 h-6 rounded-full border-0 cursor-pointer transition-colors overflow-hidden ${
              autoSync ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                autoSync ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            Start and stop with the audio player
          </span>
        </label>

      </div>
    </section>
  );
}
