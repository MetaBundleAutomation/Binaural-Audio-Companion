"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext; }
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Cycle order (clockwise from 12 o'clock): Inhale → Hold → Exhale → Hold
const PHASES = [
  { name: "Inhale", subtitle: "breathe in",  color: "#4aa8e8" },
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
  { name: "Exhale", subtitle: "breathe out", color: "#56c9b5" },
  { name: "Hold",   subtitle: "hold still",  color: "#9ba8ff" },
];
const PHASE_LABELS = ["Inhale", "Hold", "Exhale", "Hold"];
const PHASE_MS     = 4000;
const MIN_R        = 28;
const MAX_R        = 108;
const MID_R        = (MIN_R + MAX_R) / 2;
const TRACK_R      = 175;
const TRACK_W      = 8;
const LABEL_V      = 228;
const LABEL_H      = 248;
const S            = 600;
const C            = S / 2;
const SEG_GAP      = 0.04;

const VOICE_KEY      = "crux_voice_guidance_enabled";
const VOICE_CONT_KEY = "crux_voice_continuous_enabled";

/**
 * Combined narration file.  Contains:
 *   0 – INTRO_END_S  : intro speech + countdown ("…three, two, one")
 *   INTRO_END_S – end: one full breathing cycle cued at 4-second intervals,
 *                      starting on "Inhale"
 */
const NARRATION_SRC = "/audio/Box Breathing.mp3?v=7";

/**
 * Timestamp (seconds) inside NARRATION_SRC where the word "Inhale" is spoken.
 * Measured with ffmpeg silencedetect (first silence_end before a ≥3 s gap).
 * The animation starts at this exact offset so audio and visuals stay in sync.
 */
const INTRO_END_S = 15.946;

/**
 * Index into PHASES where the animation opens.
 * The narration says "Inhale" at INTRO_END_S, so the first animated phase
 * must be Inhale (index 0).
 */
const PHASE_START_IDX = 0;

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
  if (phase === 0) return MIN_R + (MAX_R - MIN_R) * easeInOut(t);
  if (phase === 1) return MAX_R;
  if (phase === 2) return MAX_R - (MAX_R - MIN_R) * easeInOut(t);
  return MIN_R;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Status = "idle" | "intro" | "running" | "paused";

export default function BoxBreathing() {

  // ── Canvas / animation refs ──────────────────────────────────────────────

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const phaseRef     = useRef(PHASE_START_IDX);
  const elapsedRef   = useRef(0);
  const lastTsRef    = useRef(0);
  const isRunningRef = useRef(false);

  // ── Audio (Web Audio API) ─────────────────────────────────────────────────

  /**
   * Shared AudioContext — created on mount in suspended state (iOS-safe).
   * Resumed synchronously inside the Start tap handler (a user gesture),
   * which is the only point iOS allows audio to begin.  Once running, all
   * subsequent BufferSourceNode.start() calls work freely from timers and
   * event callbacks — unlike HTMLAudioElement which blocks every non-gesture play.
   */
  const audioCtxRef    = useRef<AudioContext | null>(null);

  /**
   * Pre-decoded PCM buffer for the entire narration file.
   * Decoded on mount so the first Start press plays instantly with no fetch lag.
   */
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  /**
   * Currently playing BufferSourceNode.
   * A new node must be created for every play; old nodes cannot be restarted.
   */
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  /**
   * setTimeout handle that fires at INTRO_END_S to start the animation.
   * Cancelled on stop/reset so the timer never fires after a session ends.
   */
  const introTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** True while the intro speech is playing — canvas shows "breathe with me". */
  const introModeRef = useRef(false);

  /**
   * Ref mirrors of voiceEnabled / voiceContinuous — updated synchronously in
   * toggle handlers so the rAF closure always reads the latest value.
   */
  const voiceEnabledRef    = useRef(true);
  const voiceContinuousRef = useRef(false);

  // ── React state ──────────────────────────────────────────────────────────

  const [status,          setStatus]          = useState<Status>("idle");
  const [voiceEnabled,    setVoiceEnabled]    = useState(true);   // default ON
  const [voiceContinuous, setVoiceContinuous] = useState(false);  // default OFF

  // ── Audio bootstrap ──────────────────────────────────────────────────────

  useEffect(() => {
    // AudioContext intentionally starts suspended on iOS — it will be resumed
    // inside the Start tap handler.  decodeAudioData works on a suspended
    // context, so the buffer is ready the moment the user presses Start.
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return;

    const ctx = new Ctor();
    audioCtxRef.current = ctx;

    fetch(NARRATION_SRC)
      .then((r) => r.arrayBuffer())
      .then((ab) => ctx.decodeAudioData(ab))
      .then((decoded) => { audioBufferRef.current = decoded; })
      .catch((e) => console.warn("[BoxBreathing] audio preload failed:", e));

    return () => {
      if (ctx.state !== "closed") ctx.close().catch(() => {});
      audioCtxRef.current   = null;
      audioBufferRef.current = null;
      audioSourceRef.current = null;
    };
  }, []);

  // ── Voice preference hydration ────────────────────────────────────────────

  // Hydrate both voice preferences from localStorage after mount.
  // Done in a single effect to avoid two sequential re-renders and to keep
  // the ref mirrors consistent with the state from the very first frame.
  useEffect(() => {
    try {
      const sv = localStorage.getItem(VOICE_KEY);
      if (sv !== null) {
        const v = sv === "true";
        setVoiceEnabled(v);
        voiceEnabledRef.current = v;
      }
      const sc = localStorage.getItem(VOICE_CONT_KEY);
      if (sc !== null) {
        const v = sc === "true";
        setVoiceContinuous(v);
        voiceContinuousRef.current = v;
      }
    } catch { /* localStorage unavailable — use defaults */ }
  }, []);

  // ── iOS audio-session recovery ────────────────────────────────────────────
  // iOS suspends the AudioContext when the screen locks, a call comes in, or
  // the app goes to background.  Resume it the moment the page is visible again
  // so playback continues without requiring another tap.
  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (
        document.visibilityState === "visible" &&
        (ctx.state === "suspended" || ctx.state === "interrupted")
      ) {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Draw ─────────────────────────────────────────────────────────────────

  function draw(idle: boolean) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const phase     = phaseRef.current;
    const elapsed   = elapsedRef.current;
    const t         = Math.min(elapsed / PHASE_MS, 1);
    const r         = getRadius(phase, elapsed, idle);
    const pc        = idle ? "#4a6b8a" : PHASES[phase].color;
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
    ctx.lineWidth   = idle ? 2 : 3;
    ctx.stroke();

    // Track ring – 4 segments
    for (let i = 0; i < 4; i++) {
      const sa       = -Math.PI / 2 + i * (Math.PI / 2) + SEG_GAP / 2;
      const ea       = -Math.PI / 2 + (i + 1) * (Math.PI / 2) - SEG_GAP / 2;
      const isActive = !idle && i === phase;

      ctx.beginPath();
      ctx.arc(C, C, TRACK_R, sa, ea);
      ctx.strokeStyle = alpha(PHASES[i].color, idle ? 0.22 : isActive ? 0.3 : 0.22);
      ctx.lineWidth   = TRACK_W;
      ctx.lineCap     = "round";
      ctx.stroke();

      if (isActive) {
        ctx.beginPath();
        ctx.arc(C, C, TRACK_R, sa, sa + (ea - sa) * t);
        ctx.strokeStyle = PHASES[i].color;
        ctx.lineWidth   = TRACK_W;
        ctx.lineCap     = "round";
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
      [C,           C - LABEL_V], // Inhale (top,    12 o'clock)
      [C + LABEL_H, C],           // Hold   (right,   3 o'clock)
      [C,           C + LABEL_V], // Exhale (bottom,  6 o'clock)
      [C - LABEL_H, C],           // Hold   (left,    9 o'clock)
    ];
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 26px Arial, sans-serif";
    for (let i = 0; i < 4; i++) {
      const isActive = !idle && i === phase;
      ctx.fillStyle = alpha(PHASES[i].color, idle ? 0.25 : isActive ? 1 : 0.28);
      ctx.fillText(PHASE_LABELS[i], labelPos[i][0], labelPos[i][1]);
    }

    // Centre — countdown when running, idle dash + hint text otherwise
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    if (idle) {
      ctx.font      = "200 64px Arial, sans-serif";
      ctx.fillStyle = "rgba(43,107,127,0.5)";
      ctx.fillText("—", C, C - 12);
      ctx.font      = "15px Arial, sans-serif";
      ctx.fillStyle = "rgba(90,107,122,0.7)";
      // introModeRef is read here (not passed as arg) so both draw(true) call
      // sites automatically show the right text without extra parameters.
      ctx.fillText(introModeRef.current ? "breathe with me" : "press start", C, C + 46);
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

  // ── Animation loop ────────────────────────────────────────────────────────

  function startLoop() {
    function frame(ts: number) {
      if (!isRunningRef.current) return;
      const delta = lastTsRef.current ? ts - lastTsRef.current : 0;
      lastTsRef.current   = ts;
      elapsedRef.current += delta;

      while (elapsedRef.current >= PHASE_MS) {
        elapsedRef.current -= PHASE_MS;
        phaseRef.current    = (phaseRef.current + 1) % 4;
      }

      draw(false);
      rafRef.current = requestAnimationFrame(frame);
    }
    lastTsRef.current = 0;
    rafRef.current    = requestAnimationFrame(frame);
  }

  // ── Audio helpers ─────────────────────────────────────────────────────────

  /**
   * Cancel the intro timer and stop any playing BufferSourceNode.
   * Safe to call at any time — every branch is a no-op when nothing is active.
   */
  function stopAllAudio() {
    if (introTimerRef.current !== null) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }
    if (audioSourceRef.current) {
      // Clear onended BEFORE stop() — stopping a node fires the ended event,
      // and we must not trigger the continuous-loop handler on a manual stop.
      audioSourceRef.current.onended = null;
      try { audioSourceRef.current.stop(); } catch { /* already stopped */ }
      audioSourceRef.current = null;
    }
    introModeRef.current = false;
  }

  /**
   * Create a new BufferSourceNode and begin playback from offsetSeconds.
   * Any previously playing source is stopped first.
   *
   * When the source ends naturally, loops back to INTRO_END_S if Continuous
   * voice guidance is ON — skipping the intro speech on subsequent cycles.
   */
  function playNarration(offsetSeconds: number) {
    const ctx    = audioCtxRef.current;
    const buffer = audioBufferRef.current;
    if (!ctx || !buffer) return;

    // Stop previous source (clears onended first to suppress the loop callback).
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      try { audioSourceRef.current.stop(); } catch { /* already stopped */ }
      audioSourceRef.current = null;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Keep a reference so the closure can verify it hasn't been superseded.
    audioSourceRef.current = source;

    source.onended = () => {
      // Guard: only loop if this source is still the active one.
      if (audioSourceRef.current === source && voiceContinuousRef.current) {
        playNarration(INTRO_END_S);
      }
    };

    source.start(0, offsetSeconds);
  }

  /**
   * Begin the animation loop.  phaseRef and elapsedRef must already be set
   * to the desired starting position before calling this.
   */
  function startAnimation() {
    isRunningRef.current = true;
    setStatus("running");
    startLoop();
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  async function start() {
    const ctx = audioCtxRef.current;

    // ── iOS AudioContext unlock ───────────────────────────────────────────────
    //
    // AudioContext starts in "suspended" state on iOS.  ctx.resume() MUST be
    // called synchronously inside a user-gesture handler (tap / click) to
    // transition it to "running".  Once running, all subsequent
    // BufferSourceNode.start() calls — including those from setTimeout and
    // audio-event callbacks — work without restriction.
    //
    // This is the fundamental difference from HTMLAudioElement: with the Web
    // Audio API you unlock the context once and the unlock persists for the
    // entire session, rather than needing a fresh gesture for every play().
    if (ctx && (ctx.state === "suspended" || ctx.state === "interrupted")) {
      try { await ctx.resume(); } catch { /* continue; playback won't work but animation will */ }
    }

    if (status === "paused") {
      // Re-enter the breathing cycle audio from INTRO_END_S so cues stay
      // aligned with whatever phase the animation is currently on.
      if (voiceEnabledRef.current && ctx && audioBufferRef.current) {
        playNarration(INTRO_END_S);
      }
      isRunningRef.current = true;
      setStatus("running");
      startLoop();
      return;
    }

    // ── Fresh start ───────────────────────────────────────────────────────────
    phaseRef.current   = PHASE_START_IDX;
    elapsedRef.current = 0;
    lastTsRef.current  = 0;

    if (voiceEnabledRef.current && ctx && audioBufferRef.current) {
      // Show idle canvas with "breathe with me" while the intro plays.
      introModeRef.current = true;
      setStatus("intro");
      draw(true);

      // Note the AudioContext clock at the moment playback begins.
      // Used to seed elapsedRef with sub-millisecond accuracy when the
      // setTimeout fires, compensating for any JS-engine scheduling delay.
      const startCtxTime = ctx.currentTime;
      playNarration(0);

      // ── setTimeout replaces timeupdate polling ──────────────────────────────
      //
      // HTMLAudioElement.timeupdate fires every ~250 ms, introducing up to
      // 250 ms of animation-start lag.  A single setTimeout keyed to
      // INTRO_END_S is both simpler and far more accurate; ctx.currentTime
      // advances at audio-clock precision so the overshoot correction below
      // is typically < 10 ms.
      introTimerRef.current = setTimeout(() => {
        introTimerRef.current = null;
        introModeRef.current  = false;

        // Correct for any overshoot: seed elapsed with however many ms past
        // INTRO_END_S the audio clock has already advanced.
        const audioPos = ctx.currentTime - startCtxTime;
        elapsedRef.current = Math.max(0, (audioPos - INTRO_END_S) * 1000);

        startAnimation();
      }, INTRO_END_S * 1000);

    } else {
      // Voice off — jump straight into animation.
      startAnimation();
    }
  }

  function pause() {
    stopAllAudio();
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setStatus("paused");
    draw(false); // Freeze canvas on the current frame
  }

  function reset() {
    stopAllAudio();
    isRunningRef.current  = false;
    cancelAnimationFrame(rafRef.current);
    phaseRef.current      = PHASE_START_IDX;
    elapsedRef.current    = 0;
    lastTsRef.current     = 0;
    setStatus("idle");
    draw(true); // Return canvas to idle state
    // Toggle states are intentionally preserved
  }

  function handleToggleVoice() {
    const next = !voiceEnabled;
    voiceEnabledRef.current = next; // Update ref immediately for animation loop
    setVoiceEnabled(next);
    try { localStorage.setItem(VOICE_KEY, String(next)); } catch { /* noop */ }

    if (!next) {
      // Turning voice OFF — stop any playing audio.
      stopAllAudio();
      // If we were waiting in the intro, jump to animation so the visual
      // continues uninterrupted.
      if (status === "intro") {
        startAnimation();
      }
    }
    // Turning ON: takes effect at next Start press — no retroactive action.
  }

  function handleToggleContinuous() {
    if (!voiceEnabled) return; // guard: no effect without master toggle
    const next = !voiceContinuous;
    voiceContinuousRef.current = next; // Update ref immediately for animation loop
    setVoiceContinuous(next);
    try { localStorage.setItem(VOICE_CONT_KEY, String(next)); } catch { /* noop */ }
    // No immediate audio change needed:
    //   Toggled ON:  ended handler will loop from INTRO_END_S on next cycle end ✓
    //   Toggled OFF: current audio completes; ended handler becomes a no-op ✓
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    // Synchronous draw — refs are guaranteed attached inside useEffect
    draw(true);
    return () => {
      cancelAnimationFrame(rafRef.current);
      stopAllAudio();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  // Single toggle: Start begins a session, Stop ends it (resets to idle).
  const btnLabel = status === "running" || status === "intro" ? "Stop" : "Start";
  const btnClick = status === "running" || status === "intro" ? reset : start;

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

        {/* ── Buttons ─────────────────────────────────────────────────── */}
        <div className="flex gap-4">
          <button
            onClick={btnClick}
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

        {/* ── Timing label ────────────────────────────────────────────── */}
        <p className="text-xs text-[var(--text-secondary)] opacity-50 tracking-widest">
          4 · 4 · 4 · 4 · box breathing
        </p>

        {/* ── Voice guidance toggle (master on/off) ────────────────────
             Uses <div role="switch"> instead of <button> inside <label>
             to prevent browsers double-dispatching click events.          */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={handleToggleVoice}
          role="presentation"
        >
          <div
            role="switch"
            aria-checked={voiceEnabled}
            aria-label="Toggle voice guidance"
            tabIndex={0}
            onKeyDown={(e) => (e.key === " " || e.key === "Enter") && handleToggleVoice()}
            className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              voiceEnabled ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
            }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              voiceEnabled ? "translate-x-5" : "translate-x-0"
            }`} />
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

        {/* ── Continuous voice guidance toggle ─────────────────────────
             Greyed out when master voice toggle is OFF (no effect without it).
             Placed directly below "Voice guidance" to form a logical group.  */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          <div
            className={`flex items-center gap-3 select-none ${
              voiceEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-40"
            }`}
            onClick={voiceEnabled ? handleToggleContinuous : undefined}
            role="presentation"
          >
            <div
              role="switch"
              aria-checked={voiceContinuous}
              aria-disabled={!voiceEnabled}
              aria-label="Toggle continuous voice guidance"
              tabIndex={voiceEnabled ? 0 : -1}
              onKeyDown={(e) =>
                voiceEnabled && (e.key === " " || e.key === "Enter") && handleToggleContinuous()
              }
              className={`relative w-11 h-6 rounded-full transition-colors overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                voiceEnabled ? "cursor-pointer" : "cursor-not-allowed"
              } ${
                voiceContinuous && voiceEnabled ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                voiceContinuous ? "translate-x-5" : "translate-x-0"
              }`} />
            </div>
            <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
              {/* Repeat / loop icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              Continuous voice guidance
            </span>
          </div>
          {/* Helper text — visible to sighted users and screen readers */}
          <p className="text-xs text-[var(--text-secondary)] opacity-60 text-center max-w-xs">
            Helpful for visually impaired users — voice continues throughout the session
          </p>
          {/* Silent-mode hint — especially relevant on iPhone/iPad */}
          <p className="text-xs text-[var(--text-secondary)] opacity-40 text-center max-w-xs italic">
            On mobile, ensure your device is not on silent mode
          </p>
        </div>

      </div>
    </section>
  );
}
