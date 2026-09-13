"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/hooks/usePreferences";

// ─── Types ────────────────────────────────────────────────────────────────────

type CoherencePreset = "gentle" | "balanced" | "deeper";
type BreathCount = 6 | 10 | 15;
type CoherenceStatus = "idle" | "running" | "complete";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESETS: Record<CoherencePreset, { label: string; inhale: number; exhale: number }> = {
  gentle:   { label: "Gentle",   inhale: 3000, exhale: 5000 },
  balanced: { label: "Balanced", inhale: 4000, exhale: 6000 },
  deeper:   { label: "Deeper",   inhale: 5000, exhale: 7000 },
};

const BREATH_OPTIONS: BreathCount[] = [6, 10, 15];

const S     = 600;
const C     = S / 2;
const MIN_R = 55;
const MAX_R = 175;
const HUE   = "#9ba8ff"; // lavender — calm, distinct from box-breathing blue

// ─── Helpers ──────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function hexAlpha(hex: string, a: number): string {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

// ─── Chime (sine tone, soft envelope) ────────────────────────────────────────

function playChime(ctx: AudioContext, type: "start" | "inhale" | "exhale" | "complete"): void {
  const cfg = {
    start:    { f: 432, dur: 2.0,  peak: 0.09,  fi: 0.20, fo: 0.80 },
    inhale:   { f: 432, dur: 0.75, peak: 0.055, fi: 0.08, fo: 0.30 },
    exhale:   { f: 396, dur: 0.75, peak: 0.055, fi: 0.08, fo: 0.30 },
    complete: { f: 528, dur: 2.2,  peak: 0.10,  fi: 0.15, fo: 0.90 },
  }[type];

  // Fundamental
  const g1 = ctx.createGain();
  g1.connect(ctx.destination);
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = cfg.f;
  osc1.connect(g1);

  // Second harmonic (octave above) — adds warmth, decays faster than fundamental
  const g2 = ctx.createGain();
  g2.connect(ctx.destination);
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = cfg.f * 2;
  osc2.connect(g2);

  const t = ctx.currentTime;

  g1.gain.setValueAtTime(0, t);
  g1.gain.linearRampToValueAtTime(cfg.peak, t + cfg.fi);
  g1.gain.setValueAtTime(cfg.peak, t + cfg.dur - cfg.fo);
  g1.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur);
  osc1.start(t);
  osc1.stop(t + cfg.dur + 0.05);

  const h2peak = cfg.peak * 0.25;
  const h2dur  = cfg.dur  * 0.60;
  g2.gain.setValueAtTime(0, t);
  g2.gain.linearRampToValueAtTime(h2peak, t + cfg.fi * 0.8);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + h2dur);
  osc2.start(t);
  osc2.stop(t + h2dur + 0.05);

  // Start tone only: add a perfect fifth (1.5×) for a fuller, welcoming bloom
  if (type === "start") {
    const g3 = ctx.createGain();
    g3.connect(ctx.destination);
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.value = cfg.f * 1.5; // 648 Hz — perfect fifth above fundamental
    osc3.connect(g3);
    const h3peak = cfg.peak * 0.15;
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(h3peak, t + cfg.fi * 1.3);
    g3.gain.setValueAtTime(h3peak, t + cfg.dur - cfg.fo * 1.1);
    g3.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur * 0.92);
    osc3.start(t);
    osc3.stop(t + cfg.dur + 0.05);
  }
}

// ─── Tibetan bowl tone (inharmonic partials, sharp attack, long ring) ─────────

function playBowlPartials(ctx: AudioContext, f: number, peak: number): void {
  // Inharmonic partial ratios from published Tibetan bowl acoustics research
  const partials: [number, number, number][] = [
    [1,     peak,        3.0], // fundamental — longest ring
    [2.756, peak * 0.45, 1.8], // 2nd partial
    [5.093, peak * 0.18, 0.9], // 3rd partial — fades fastest
  ];
  partials.forEach(([ratio, amp, decay]) => {
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f * ratio;
    osc.connect(g);
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.008); // sharp attack, no click
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    osc.start(t);
    osc.stop(t + decay + 0.1);
  });
}

function playBowl(ctx: AudioContext, type: "start" | "inhale" | "exhale" | "complete"): void {
  if (type === "start") {
    // Strike both pitches simultaneously — a welcoming chord to open the session
    playBowlPartials(ctx, 220, 0.09); // A3 — inhale pitch
    playBowlPartials(ctx, 174, 0.07); // F3 — exhale pitch (slightly quieter to balance)
    return;
  }
  const f    = type === "inhale" ? 220 : type === "exhale" ? 174 : 264;
  const peak = type === "complete" ? 0.10 : 0.095;
  playBowlPartials(ctx, f, peak);
}

// ─── Chime toggle (used in both idle and running states) ─────────────────────

function ChimeToggle({
  checked,
  onToggle,
  small,
  label = "Sound",
}: {
  checked: boolean;
  onToggle: () => void;
  small?: boolean;
  label?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={onToggle}
      role="presentation"
    >
      <div
        role="switch"
        aria-checked={checked}
        aria-label="Chime"
        tabIndex={0}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && onToggle()}
        className={`relative rounded-full cursor-pointer transition-colors overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
          small ? "w-9 h-5" : "w-11 h-6"
        } ${checked ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"}`}
      >
        <span
          className={`absolute rounded-full bg-white transition-transform ${
            small ? "top-0.5 left-0.5 w-4 h-4" : "top-1 left-1 w-4 h-4"
          } ${checked ? (small ? "translate-x-4" : "translate-x-5") : "translate-x-0"}`}
        />
      </div>
      <span className={`text-[var(--text-secondary)] ${small ? "text-xs opacity-70" : "text-sm"}`}>
        {label}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoherenceBreathing() {
  const { prefs, isHydrated, set } = usePreferences();

  // ── Canvas refs ─────────────────────────────────────────────────────────────
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const rafRef           = useRef(0);
  const phaseRef         = useRef<"inhale" | "exhale">("inhale");
  const elapsedRef       = useRef(0);
  const lastTsRef        = useRef(0);
  const isRunningRef     = useRef(false);
  const reducedMotionRef = useRef(false);
  const breathCountRef   = useRef(0);
  const shouldStartRef   = useRef(false);
  const toneTypeRef      = useRef<"chime" | "bowl">("chime");

  // ── Audio refs ──────────────────────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);

  // ── Pref mirrors for RAF loop access ─────────────────────────────────────────
  const presetRef        = useRef<CoherencePreset>("gentle");
  const targetBreathsRef = useRef<BreathCount>(6);
  const chimeEnabledRef  = useRef(true);

  // ── State ────────────────────────────────────────────────────────────────────
  const [status, setStatus]                     = useState<CoherenceStatus>("idle");
  const [completedBreaths, setCompletedBreaths] = useState(0);

  // ── Sync prefs → refs (RAF loop reads refs, not React state) ─────────────────
  useEffect(() => {
    if (!isHydrated) return;
    presetRef.current        = prefs.coherencePreset ?? "gentle";
    targetBreathsRef.current = (prefs.coherenceBreaths ?? 6) as BreathCount;
    chimeEnabledRef.current  = prefs.coherenceChimeEnabled ?? true;
    toneTypeRef.current      = prefs.coherenceToneType ?? "chime";
  }, [isHydrated, prefs.coherencePreset, prefs.coherenceBreaths, prefs.coherenceChimeEnabled, prefs.coherenceToneType]);

  // ── Reduced motion ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = () => { reducedMotionRef.current = mq.matches; };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // ── AudioContext lifecycle ────────────────────────────────────────────────────
  useEffect(() => {
    const AC =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    audioCtxRef.current = ctx;
    return () => {
      if (ctx.state !== "closed") ctx.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  // ── iOS audio-session recovery ────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (document.visibilityState === "visible" && ctx.state !== "running") {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);

  // ── Animation loop — starts after canvas mounts when status becomes "running" ─
  useEffect(() => {
    if (status !== "running" || !shouldStartRef.current) return;
    shouldStartRef.current = false;

    // Scroll canvas into view so the user sees the animation immediately
    canvasRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    // Start tone (AudioContext was resumed in begin() before setStatus)
    const actx = audioCtxRef.current;
    if (chimeEnabledRef.current && actx && actx.state === "running") {
      (toneTypeRef.current === "bowl" ? playBowl : playChime)(actx, "start");
    }

    function draw(): void {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;

      const phase   = phaseRef.current;
      const elapsed = elapsedRef.current;
      const { inhale, exhale } = PRESETS[presetRef.current];
      const dur     = phase === "inhale" ? inhale : exhale;
      const t       = Math.min(elapsed / dur, 1);
      const reduced = reducedMotionRef.current;

      ctx2d.clearRect(0, 0, S, S);

      // Animated radius — mid-point when reduced motion is active
      const r = reduced
        ? (MIN_R + MAX_R) / 2
        : phase === "inhale"
          ? MIN_R + (MAX_R - MIN_R) * easeInOut(t)
          : MAX_R - (MAX_R - MIN_R) * easeInOut(t);

      // Glow halos
      if (!reduced) {
        for (const [ar, a] of [
          [r + 24, 0.11],
          [r + 46, 0.05],
          [r + 66, 0.02],
        ] as [number, number][]) {
          ctx2d.beginPath();
          ctx2d.arc(C, C, Math.min(ar, 278), 0, Math.PI * 2);
          ctx2d.fillStyle = hexAlpha(HUE, a);
          ctx2d.fill();
        }
      }

      // Radial gradient fill
      const grad = ctx2d.createRadialGradient(C, C - r * 0.2, 0, C, C, r);
      grad.addColorStop(0, hexAlpha(HUE, 0.50));
      grad.addColorStop(1, hexAlpha(HUE, 0.13));
      ctx2d.beginPath();
      ctx2d.arc(C, C, r, 0, Math.PI * 2);
      ctx2d.fillStyle = grad;
      ctx2d.fill();

      // Circle border
      ctx2d.beginPath();
      ctx2d.arc(C, C, r, 0, Math.PI * 2);
      ctx2d.strokeStyle = hexAlpha(HUE, 0.85);
      ctx2d.lineWidth = 2;
      ctx2d.stroke();

      // Subtle progress ring
      if (!reduced) {
        const rr = 235;
        ctx2d.beginPath();
        ctx2d.arc(C, C, rr, 0, Math.PI * 2);
        ctx2d.strokeStyle = hexAlpha(HUE, 0.09);
        ctx2d.lineWidth = 3;
        ctx2d.lineCap = "butt";
        ctx2d.stroke();

        if (t > 0) {
          ctx2d.beginPath();
          ctx2d.arc(C, C, rr, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
          ctx2d.strokeStyle = hexAlpha(HUE, 0.30);
          ctx2d.lineWidth = 3;
          ctx2d.lineCap = "round";
          ctx2d.stroke();
        }
      }

      // Centre label — cross-fades opacity when reduced motion is on
      const label = phase === "inhale" ? "Breathe in" : "Breathe out";
      const opacity = reduced
        ? t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1
        : 1;

      ctx2d.textAlign    = "center";
      ctx2d.textBaseline = "middle";
      if (!reduced) {
        ctx2d.shadowColor = HUE;
        ctx2d.shadowBlur  = 18;
      }
      ctx2d.font      = "300 26px Arial, Helvetica, sans-serif";
      ctx2d.fillStyle = hexAlpha(HUE, 0.95 * opacity);
      ctx2d.fillText(label, C, C);
      ctx2d.shadowBlur  = 0;
      ctx2d.shadowColor = "transparent";
    }

    function frame(ts: number): void {
      if (!isRunningRef.current) return;

      const delta = lastTsRef.current ? ts - lastTsRef.current : 0;
      lastTsRef.current   = ts;
      elapsedRef.current += delta;

      const { inhale, exhale } = PRESETS[presetRef.current];
      const dur = phaseRef.current === "inhale" ? inhale : exhale;

      if (elapsedRef.current >= dur) {
        elapsedRef.current -= dur; // carry remainder to avoid drift

        if (phaseRef.current === "inhale") {
          phaseRef.current = "exhale";
          const bCtx = audioCtxRef.current;
          if (chimeEnabledRef.current && bCtx && bCtx.state === "running") {
            (toneTypeRef.current === "bowl" ? playBowl : playChime)(bCtx, "exhale");
          }
        } else {
          // Full breath (inhale + exhale) completed
          breathCountRef.current += 1;
          setCompletedBreaths(breathCountRef.current);

          if (breathCountRef.current >= targetBreathsRef.current) {
            isRunningRef.current = false;
            const finCtx = audioCtxRef.current;
            if (chimeEnabledRef.current && finCtx && finCtx.state === "running") {
              (toneTypeRef.current === "bowl" ? playBowl : playChime)(finCtx, "complete");
            }
            setStatus("complete");
            return;
          }

          phaseRef.current = "inhale";
          const bCtx = audioCtxRef.current;
          if (chimeEnabledRef.current && bCtx && bCtx.state === "running") {
            (toneTypeRef.current === "bowl" ? playBowl : playChime)(bCtx, "inhale");
          }
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(frame);
    }

    lastTsRef.current = 0;
    rafRef.current    = requestAnimationFrame(frame);

    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [status]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Controls ──────────────────────────────────────────────────────────────────

  async function begin() {
    const actx = audioCtxRef.current;
    if (actx && actx.state !== "running") {
      try { await actx.resume(); } catch { /* non-fatal */ }
    }
    phaseRef.current       = "inhale";
    elapsedRef.current     = 0;
    lastTsRef.current      = 0;
    breathCountRef.current = 0;
    isRunningRef.current   = true;
    shouldStartRef.current = true;
    setCompletedBreaths(0);
    setStatus("running");
  }

  function stop() {
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    breathCountRef.current = 0;
    setCompletedBreaths(0);
    setStatus("idle");
  }

  // ── Derived UI values ─────────────────────────────────────────────────────────
  const preset        = isHydrated ? (prefs.coherencePreset ?? "gentle") : "gentle";
  const targetBreaths = isHydrated ? ((prefs.coherenceBreaths ?? 6) as BreathCount) : 6;
  const chimeEnabled  = isHydrated ? (prefs.coherenceChimeEnabled ?? true) : true;
  const toneType      = isHydrated ? (prefs.coherenceToneType ?? "chime") : "chime";

  const toggleChime = () => set("coherenceChimeEnabled", !chimeEnabled);

  const activeBtn: React.CSSProperties = {
    background: "var(--primary)",
    color: "white",
    boxShadow: "0 4px 12px rgba(43,107,127,0.35)",
  };
  const inactiveBtn: React.CSSProperties = {
    background: "var(--background-light)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-color)",
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <section className="my-16">
      <div
        className="flex flex-col items-center gap-6 rounded-3xl p-8 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >

        {/* ── Idle / Intro ──────────────────────────────────────────────────────── */}
        {status === "idle" && (
          <>
            <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] text-center">
              Heart–Brain Coherence
            </h2>

            {/* Link to the coherence guide in Instructions */}
            <Link
              href="/instructions#coherence-breathing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-[var(--background-light)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all"
            >
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Tap to learn about Heart–Brain Coherence
            </Link>

            {/* Eyes-open safety line */}
            <p className="text-[var(--text-secondary)] text-xs text-center max-w-sm leading-relaxed italic opacity-75">
              Eyes open or closed — whatever feels safe. If anything feels uncomfortable, stop and breathe normally.
            </p>

            {/* Settings */}
            <div className="flex flex-col items-center gap-5 w-full max-w-xs">

              {/* Pace */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">Pace</span>
                <div className="flex gap-2">
                  {(Object.keys(PRESETS) as CoherencePreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => set("coherencePreset", p)}
                      aria-pressed={preset === p}
                      className="py-1.5 px-4 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                      style={preset === p ? activeBtn : inactiveBtn}
                    >
                      {PRESETS[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breaths */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">Breaths</span>
                <div className="flex gap-2">
                  {BREATH_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => set("coherenceBreaths", n)}
                      aria-pressed={targetBreaths === n}
                      className="py-1.5 px-4 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                      style={targetBreaths === n ? activeBtn : inactiveBtn}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone type */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)]">Tone</span>
                <div className="flex gap-2">
                  {(["chime", "bowl"] as const).map((tt) => (
                    <button
                      key={tt}
                      onClick={() => set("coherenceToneType", tt)}
                      aria-pressed={toneType === tt}
                      className="py-1.5 px-4 rounded-xl text-[13px] font-semibold transition-all cursor-pointer"
                      style={toneType === tt ? activeBtn : inactiveBtn}
                    >
                      {tt === "chime" ? "Chime" : "Bowl"}
                    </button>
                  ))}
                </div>
              </div>

              <ChimeToggle
                checked={chimeEnabled}
                onToggle={toggleChime}
                label={toneType === "bowl" ? "Bowl" : "Chime"}
              />
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] text-center opacity-60">
              Tone cues guide each breath
            </p>

            {/* Begin */}
            <button
              onClick={begin}
              className="px-8 py-3 rounded-full border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-sm transition-all hover:bg-[var(--primary)] hover:text-white cursor-pointer"
            >
              Begin when you&apos;re ready
            </button>

            {/* Three steps */}
            <div className="flex flex-col gap-5 w-full max-w-md">
              {[
                {
                  n: "1",
                  head: "Drop into your heart.",
                  body: "Rest a hand over your heart. Your attention naturally follows touch — wherever you feel contact, awareness follows. This gently moves your focus out of your head and into your heart.",
                },
                {
                  n: "2",
                  head: "Breathe slow, exhale long.",
                  body: "Breathe so your out-breath is longer than your in-breath. Start wherever feels easy — it should never feel forced. A longer exhale activates your parasympathetic nervous system, telling your body it is safe. Imagine each breath flowing in and out through your heart.",
                },
                {
                  n: "3",
                  head: "Feel genuine gratitude.",
                  body: "Choose something real — your kids, your family, being alive, a good moment today. Most of the time we feel something only because of what is happening around us; here you are choosing the feeling on purpose. Sustained gratitude settles your heart into a coherent rhythm and brings your heart and brain into sync.",
                },
              ].map(({ n, head, body }) => (
                <div key={n} className="flex gap-4 items-start">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "var(--primary)" }}
                    aria-hidden="true"
                  >
                    {n}
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)] text-sm mb-0.5">{head}</p>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Running ───────────────────────────────────────────────────────────── */}
        {status === "running" && (
          <>
            <canvas
              ref={canvasRef}
              width={S}
              height={S}
              style={{ width: 320, height: 320, borderRadius: 20 }}
              aria-label="Coherence breathing — circle expands on inhale, contracts on exhale"
            />

            {/* Breath counter — muted, non-pressuring */}
            <p className="text-[var(--text-secondary)] text-xs opacity-55 tracking-widest tabular-nums">
              {completedBreaths} / {targetBreaths}
            </p>

            {/* Pace (switchable during session) */}
            <div className="flex gap-2">
              {(Object.keys(PRESETS) as CoherencePreset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => set("coherencePreset", p)}
                  aria-pressed={preset === p}
                  className="py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={preset === p ? { background: "var(--primary)", color: "white" } : inactiveBtn}
                >
                  {PRESETS[p].label}
                </button>
              ))}
            </div>

            <ChimeToggle
              checked={chimeEnabled}
              onToggle={toggleChime}
              small
              label={toneType === "bowl" ? "Bowl" : "Chime"}
            />

            {/* Stop — always visible, understated styling */}
            <button
              onClick={stop}
              className="px-6 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] text-sm transition-all hover:border-[var(--text-secondary)] cursor-pointer"
            >
              Stop
            </button>
          </>
        )}

        {/* ── Complete ──────────────────────────────────────────────────────────── */}
        {status === "complete" && (
          <>
            <h2 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] text-center">
              Heart–Brain Coherence
            </h2>
            <p className="text-[var(--text-secondary)] text-center leading-relaxed">
              Well done. Take a moment before you move on.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  breathCountRef.current = 0;
                  setCompletedBreaths(0);
                  setStatus("idle");
                }}
                className="px-6 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] font-semibold text-sm transition-all hover:bg-[var(--primary)] hover:text-white cursor-pointer"
              >
                Begin again
              </button>
              <button
                onClick={() => {
                  breathCountRef.current = 0;
                  setCompletedBreaths(0);
                  setStatus("idle");
                }}
                className="px-6 py-2 rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] text-sm transition-all hover:border-[var(--text-secondary)] cursor-pointer"
              >
                Done
              </button>
            </div>
          </>
        )}

      </div>
    </section>
  );
}
