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
const TRACK_R      = 175;
const TRACK_W      = 8;
// Top/bottom labels sit at LABEL_V; left/right pushed further out (LABEL_H)
// to compensate for the perceptual crowding of horizontal text against a circle
const LABEL_V      = 228; // vertical (Hold top/bottom)
const LABEL_H      = 248; // horizontal (Inhale/Exhale) — extra clearance
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

    // Aura glow halos – capped so they never reach the track ring
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

    // Phase labels at compass positions — horizontal labels pushed further out
    const labelPos: [number, number][] = [
      [C,            C - LABEL_V],  // Hold   (top)
      [C + LABEL_H,  C],            // Inhale (right)
      [C,            C + LABEL_V],  // Hold   (bottom)
      [C - LABEL_H,  C],            // Exhale (left)
    ];
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 26px Arial, sans-serif";
    for (let i = 0; i < 4; i++) {
      const isActive = !idle && i === phase;
      ctx.fillStyle = alpha(PHASES[i].color, idle ? 0.25 : isActive ? 1 : 0.28);
      ctx.fillText(PHASE_LABELS[i], labelPos[i][0], labelPos[i][1]);
    }

    // Centre – countdown with phase-colour glow
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (idle) {
      ctx.font = "200 64px Arial, sans-serif";
      ctx.fillStyle = "#1e4a72";
      ctx.fillText("—", C, C - 12);
      ctx.font = "15px Arial, sans-serif";
      ctx.fillStyle = "#2a4a5a";
      ctx.fillText("press start", C, C + 46);
    } else {
      ctx.shadowColor = pc;
      ctx.shadowBlur = 28;
      ctx.font = "200 72px Arial, sans-serif";
      ctx.fillStyle = alpha(pc, 0.95);
      ctx.fillText(countdown, C, C);
      ctx.shadowBlur = 0;
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
          style={{ width: 380, height: 380, borderRadius: 20 }}
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
            Auto-sync with audio playback
          </span>
        </label>

        {/* Benefits & How-To */}
        <div className="w-full max-w-lg mt-2">
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--background-light)] p-6 text-left">
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-5">
              Box breathing is a well-established technique for calming the mind and body when stress, anxiety, or sleeplessness becomes hard to manage. It works by activating your body's natural rest response — gently slowing your heart rate and easing the tension that builds when your thoughts won't settle.
            </p>

            <div className="space-y-3">
              {[
                {
                  step: "1",
                  color: "#9ba8ff",
                  label: "Hold",
                  detail: "Start with empty lungs. Hold still for 4 seconds.",
                },
                {
                  step: "2",
                  color: "#4aa8e8",
                  label: "Inhale",
                  detail: "Breathe in slowly through your nose for 4 seconds.",
                },
                {
                  step: "3",
                  color: "#9ba8ff",
                  label: "Hold",
                  detail: "Lungs full. Hold steady for 4 seconds.",
                },
                {
                  step: "4",
                  color: "#56c9b5",
                  label: "Exhale",
                  detail: "Release slowly through your mouth for 4 seconds.",
                },
              ].map(({ step, color, label, detail }) => (
                <div key={step} className="flex items-start gap-3">
                  <span
                    className="w-7 h-7 rounded-full text-[13px] font-bold flex items-center justify-center shrink-0"
                    style={{
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      color,
                    }}
                  >
                    {step}
                  </span>
                  <div className="text-[13px] leading-relaxed pt-0.5">
                    <span className="font-bold text-[var(--text-primary)]">{label} </span>
                    <span className="text-[var(--text-secondary)]">{detail}</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-[var(--text-secondary)] opacity-60 mt-4">
              Repeat 4–6 cycles. Most people notice a shift within 2 minutes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
