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

export default function BoxBreathing({ isAudioPlaying }: { isAudioPlaying: boolean }) {

  // ── Canvas / animation refs ──────────────────────────────────────────────

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const phaseRef     = useRef(0);
  const elapsedRef   = useRef(0);
  const lastTsRef    = useRef(0);
  const isRunningRef = useRef(false);

  // ── Voice — Audio instances ──────────────────────────────────────────────

  const introAudioRef  = useRef<HTMLAudioElement | null>(null);
  const inhaleAudioRef = useRef<HTMLAudioElement | null>(null);
  const holdAudioRef   = useRef<HTMLAudioElement | null>(null);
  const exhaleAudioRef = useRef<HTMLAudioElement | null>(null);

  // ── Voice — runtime state refs ───────────────────────────────────────────

  /** The cue Audio node currently playing (if any). */
  const activeCueRef = useRef<HTMLAudioElement | null>(null);

  /** Stored reference to the intro 'ended' handler so we can remove it on reset. */
  const introEndedHandlerRef = useRef<(() => void) | null>(null);

  /** True while the intro is playing — controls centre canvas text. */
  const introModeRef = useRef(false);

  /**
   * Number of completed full cycles (Inhale→Hold→Exhale→Hold).
   * Increments each time the phase wraps from 3 back to 0.
   * After cycleCountRef >= 1, cues only play when continuous mode is on.
   */
  const cycleCountRef = useRef(0);

  /**
   * Ref mirrors of voiceEnabled / voiceContinuous — kept in sync immediately
   * in the toggle handlers so the animation-loop frame function (a closure)
   * always reads the up-to-date value without needing React re-renders.
   */
  const voiceEnabledRef    = useRef(true);
  const voiceContinuousRef = useRef(false);

  // ── React state ──────────────────────────────────────────────────────────

  const [status,          setStatus]          = useState<Status>("idle");
  const [autoSync,        setAutoSync]        = useState(false);
  const [voiceEnabled,    setVoiceEnabled]    = useState(true);   // default ON
  const [voiceContinuous, setVoiceContinuous] = useState(false);  // default OFF

  // ── Audio bootstrap ──────────────────────────────────────────────────────

  useEffect(() => {
    const intro  = new Audio("/audio/intro.wav");
    const inhale = new Audio("/audio/inhale.wav");
    const hold   = new Audio("/audio/hold.wav");
    const exhale = new Audio("/audio/exhale.wav");
    [intro, inhale, hold, exhale].forEach(a => { a.volume = 0.8; a.preload = "auto"; });
    introAudioRef.current  = intro;
    inhaleAudioRef.current = inhale;
    holdAudioRef.current   = hold;
    exhaleAudioRef.current = exhale;
    return () => {
      [intro, inhale, hold, exhale].forEach(a => a.pause());
      introAudioRef.current = inhaleAudioRef.current =
        holdAudioRef.current = exhaleAudioRef.current = null;
    };
  }, []);

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
      // introModeRef is checked here (not passed as arg) so both draw(true) call
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

        // A full cycle completes whenever the phase wraps back to 0
        if (phaseRef.current === 0) cycleCountRef.current += 1;

        // Play the cue for the new phase (respects voice/continuous settings)
        maybePlayCue(phaseRef.current);
      }

      draw(false);
      rafRef.current = requestAnimationFrame(frame);
    }
    lastTsRef.current = 0;
    rafRef.current    = requestAnimationFrame(frame);
  }

  // ── Voice helpers ─────────────────────────────────────────────────────────

  /**
   * Stop all audio (intro + any active cue) and cancel the intro ended-handler.
   * Safe to call at any time (no-ops if nothing is playing).
   */
  function stopAllAudio() {
    const intro = introAudioRef.current;
    if (intro) {
      if (introEndedHandlerRef.current) {
        intro.removeEventListener("ended", introEndedHandlerRef.current);
        introEndedHandlerRef.current = null;
      }
      intro.pause();
      intro.currentTime = 0;
    }
    if (activeCueRef.current) {
      activeCueRef.current.pause();
      activeCueRef.current.currentTime = 0;
      activeCueRef.current = null;
    }
    introModeRef.current = false;
  }

  /**
   * Immediately play the phase cue for the given phase index.
   * Stops any currently-playing cue first to prevent overlap.
   * Phases 1 and 3 share hold.wav.
   */
  function playCue(phase: number) {
    if (activeCueRef.current) {
      activeCueRef.current.pause();
      activeCueRef.current.currentTime = 0;
      activeCueRef.current = null;
    }
    const audio =
      phase === 0 ? inhaleAudioRef.current :
      phase === 2 ? exhaleAudioRef.current :
      holdAudioRef.current; // phases 1 & 3 → hold.wav
    if (!audio) return;
    audio.currentTime = 0;
    activeCueRef.current = audio;
    audio.play().catch(() => {
      console.warn(`BoxBreathing: cue audio unavailable for phase ${phase} (${PHASE_LABELS[phase]})`);
      activeCueRef.current = null;
    });
  }

  /**
   * Play a cue only when the rules allow it:
   *   – master voice toggle must be ON
   *   – during the first cycle (cycleCount === 0): always play
   *   – after the first cycle:  play only when continuous mode is ON
   */
  function maybePlayCue(phase: number) {
    if (!voiceEnabledRef.current) return;
    if (cycleCountRef.current === 0 || voiceContinuousRef.current) {
      playCue(phase);
    }
  }

  /**
   * Begin the breathing animation and immediately fire the Inhale cue.
   * Called after the intro finishes (or is skipped), or when voice is off.
   */
  function startAnimationWithCue() {
    isRunningRef.current = true;
    setStatus("running");
    maybePlayCue(0); // Inhale cue at the very start of phase 0
    startLoop();
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  function start() {
    if (status === "paused") {
      // Resume from pause — don't replay intro or reset cycle count
      isRunningRef.current = true;
      setStatus("running");
      startLoop();
      return;
    }

    // Fresh start — reset all counters
    phaseRef.current      = 0;
    elapsedRef.current    = 0;
    cycleCountRef.current = 0;

    if (voiceEnabledRef.current && introAudioRef.current) {
      // Show idle canvas with "breathe with me" while the intro plays
      introModeRef.current = true;
      setStatus("intro");
      draw(true); // Paint "breathe with me" synchronously

      const intro = introAudioRef.current;
      intro.currentTime = 0;

      const handleEnded = () => {
        introEndedHandlerRef.current = null;
        introModeRef.current         = false;
        startAnimationWithCue();
      };
      introEndedHandlerRef.current = handleEnded;
      // { once: true } auto-removes the listener after it fires
      intro.addEventListener("ended", handleEnded, { once: true });

      intro.play().catch(() => {
        // Audio unavailable — skip intro and start animation immediately
        console.warn("BoxBreathing: intro audio unavailable, starting animation directly");
        intro.removeEventListener("ended", handleEnded);
        introEndedHandlerRef.current = null;
        introModeRef.current         = false;
        startAnimationWithCue();
      });
    } else {
      // Voice off — jump straight to the animation, no cues
      startAnimationWithCue();
    }
  }

  /** Skip the intro mid-play and jump directly into the breathing animation. */
  function skipIntro() {
    stopAllAudio();
    cycleCountRef.current = 0;
    startAnimationWithCue();
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
    phaseRef.current      = 0;
    elapsedRef.current    = 0;
    lastTsRef.current     = 0;
    cycleCountRef.current = 0;
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
      // Turning voice OFF — stop any playing audio
      stopAllAudio();
      // If we were waiting in the intro, jump to animation so visual is uninterrupted
      if (status === "intro") {
        cycleCountRef.current = 0;
        startAnimationWithCue(); // voice is now off so maybePlayCue is a no-op
      }
    }
    // Turning ON: takes effect at next Start press — no retroactive action
  }

  function handleToggleContinuous() {
    if (!voiceEnabled) return; // guard: no effect without master toggle
    const next = !voiceContinuous;
    voiceContinuousRef.current = next; // Update ref immediately for animation loop
    setVoiceContinuous(next);
    try { localStorage.setItem(VOICE_CONT_KEY, String(next)); } catch { /* noop */ }
    // No immediate audio change needed:
    //   Toggled ON:  maybePlayCue will fire at next phase transition ✓
    //   Toggled OFF: current cue completes; next transition won't play ✓
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

  // Auto-sync: mirror the audio player's play/pause state
  useEffect(() => {
    if (!autoSync) return;
    if (isAudioPlaying  && status === "idle")    start();
    if (!isAudioPlaying && status === "running") pause();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, autoSync]);

  // ── Render ────────────────────────────────────────────────────────────────

  const btnLabel =
    status === "running" ? "Pause"  :
    status === "intro"   ? "Skip"   :
    status === "paused"  ? "Resume" : "Start";

  const btnClick =
    status === "running" ? pause :
    status === "intro"   ? skipIntro :
    start;

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
        </div>

        {/* ── Auto-sync toggle (unchanged) ─────────────────────────────── */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button
            role="switch"
            aria-checked={autoSync}
            onClick={() => setAutoSync((v) => !v)}
            className={`relative w-11 h-6 rounded-full border-0 cursor-pointer transition-colors overflow-hidden ${
              autoSync ? "bg-[var(--primary)]" : "bg-[var(--border-color)]"
            }`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
              autoSync ? "translate-x-5" : "translate-x-0"
            }`} />
          </button>
          <span className="text-sm text-[var(--text-secondary)]">
            Start and stop with the audio player
          </span>
        </label>

      </div>
    </section>
  );
}
