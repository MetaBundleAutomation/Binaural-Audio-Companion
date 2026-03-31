"use client";

import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES = [
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
  { name: "Inhale", subtitle: "breathe in",  color: "#4aa8e8" },
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
  { name: "Exhale", subtitle: "breathe out", color: "#56c9b5" },
];
const PHASE_LABELS = ["Hold", "Inhale", "Hold", "Exhale"];
const PHASE_MS     = 4000;
const MIN_R        = 28;
const MAX_R        = 108;
const MID_R        = (MIN_R + MAX_R) / 2; // 68 – idle size
const TRACK_R      = 148;
const TRACK_W      = 8;
const LABEL_R      = 182;
const S            = 600; // canvas internal px
const C            = S / 2; // center = 300
const SEG_GAP      = 0.04; // radian gap between arc segments

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
  if (phase === 0) return MIN_R;                                       // hold (post-exhale)
  if (phase === 1) return MIN_R + (MAX_R - MIN_R) * easeInOut(t);     // inhale
  if (phase === 2) return MAX_R;                                       // hold (post-inhale)
  return MAX_R - (MAX_R - MIN_R) * easeInOut(t);                      // exhale
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BoxBreathing({ isAudioPlaying }: { isAudioPlaying: boolean }) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const rafRef         = useRef<number>(0);
  const phaseRef       = useRef(0);
  const elapsedRef     = useRef(0);
  const lastTsRef      = useRef(0);
  const isRunningRef   = useRef(false);

  const [status,   setStatus]   = useState<"idle" | "running" | "paused">("idle");
  const [autoSync, setAutoSync] = useState(false);

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

    // Background
    ctx.fillStyle = "#0f1e2e";
    ctx.fillRect(0, 0, S, S);

    // Aura glow halos
    ([
      [r + 22, 0.16],
      [r + 38, 0.09],
      [r + 54, 0.04],
    ] as [number, number][]).forEach(([ar, a]) => {
      ctx.beginPath();
      ctx.arc(C, C, ar, 0, Math.PI * 2);
      ctx.fillStyle = alpha(pc, a);
      ctx.fill();
    });

    // Breathing circle fill
    const grad = ctx.createRadialGradient(C, C - r * 0.25, 0, C, C, r);
    if (idle) {
      grad.addColorStop(0, "#1e3d5c");
      grad.addColorStop(1, "#0d2438");
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
    ctx.strokeStyle = idle ? "#2a4a6a" : pc;
    ctx.lineWidth = idle ? 2 : 3;
    ctx.stroke();

    // Track ring – 4 segments
    for (let i = 0; i < 4; i++) {
      const sa = -Math.PI / 2 + i * (Math.PI / 2) + SEG_GAP / 2;
      const ea = -Math.PI / 2 + (i + 1) * (Math.PI / 2) - SEG_GAP / 2;
      const isActive = !idle && i === phase;

      // Dim background arc
      ctx.beginPath();
      ctx.arc(C, C, TRACK_R, sa, ea);
      ctx.strokeStyle = alpha(PHASES[i].color, idle ? 0.22 : isActive ? 0.3 : 0.22);
      ctx.lineWidth = TRACK_W;
      ctx.lineCap = "round";
      ctx.stroke();

      // Bright progress arc
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

    // Phase labels at compass positions
    const labelPos: [number, number][] = [
      [C, C - LABEL_R],
      [C + LABEL_R, C],
      [C, C + LABEL_R],
      [C - LABEL_R, C],
    ];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 22px Arial, sans-serif";
    for (let i = 0; i < 4; i++) {
      const isActive = !idle && i === phase;
      ctx.fillStyle = alpha(PHASES[i].color, idle ? 0.25 : isActive ? 1 : 0.28);
      ctx.fillText(PHASE_LABELS[i], labelPos[i][0], labelPos[i][1]);
    }

    // Centre – phase name
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillStyle = idle ? "#4a6b8a" : alpha(pc, 0.9);
    ctx.fillText(idle ? "Ready" : PHASES[phase].name.toUpperCase(), C, C - 30);

    // Centre – countdown
    ctx.font = "200 38px Arial, sans-serif";
    ctx.fillStyle = idle ? "#2a5a8a" : "#a8d8f0";
    ctx.fillText(countdown, C, C + 8);

    // Centre – subtitle
    ctx.font = "16px Arial, sans-serif";
    ctx.fillStyle = "#4a6a7a";
    ctx.fillText(idle ? "press start" : PHASES[phase].subtitle, C, C + 42);
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

  // ── Controls ───────────────────────────────────────────────────────────────

  function start() {
    isRunningRef.current = true;
    setStatus("running");
    startLoop();
  }

  function pause() {
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setStatus("paused");
  }

  function reset() {
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = 0;
    elapsedRef.current = 0;
    lastTsRef.current = 0;
    setStatus("idle");
    requestAnimationFrame(() => draw(true));
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    requestAnimationFrame(() => draw(true));
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-sync: start/pause breathing when audio starts/stops
  useEffect(() => {
    if (!autoSync) return;
    if (isAudioPlaying && !isRunningRef.current) start();
    if (!isAudioPlaying && isRunningRef.current) pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, autoSync]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const btnLabel = status === "idle" ? "Start" : status === "running" ? "Pause" : "Resume";

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
          style={{ width: 300, height: 300, borderRadius: 16 }}
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

        {/* Auto-sync toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            role="switch"
            aria-checked={autoSync}
            onClick={() => setAutoSync((v) => !v)}
            className={`relative w-11 h-6 rounded-full border-0 cursor-pointer transition-colors ${
              autoSync ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                autoSync ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            Auto-sync with audio playback
          </span>
        </label>
      </div>
    </section>
  );
}
