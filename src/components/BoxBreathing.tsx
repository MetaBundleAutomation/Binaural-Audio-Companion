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

/**
 * Combined narration file.  Contains:
 *   0 – INTRO_END_S  : intro speech + countdown ("…three, two, one")
 *   INTRO_END_S – end: one full breathing cycle cued at 4-second intervals,
 *                      starting on "Exhale"
 */
const NARRATION_SRC = "/audio/Box Breathing Narration.mp3?v=4";

/**
 * Timestamp (seconds) inside NARRATION_SRC where the word "Exhale" is spoken.
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

  // ── Audio ─────────────────────────────────────────────────────────────────

  /**
   * Single HTMLAudioElement for the combined narration.
   * Primed (play→pause) on the first Start tap to unlock iOS audio,
   * then played from currentTime=0 on each fresh start.
   */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * `timeupdate` handler that watches for currentTime ≥ INTRO_END_S.
   * Stored here so it can be removed on pause / reset / unmount.
   */
  const timeupdateHandlerRef = useRef<(() => void) | null>(null);

  /**
   * `ended` handler that loops the phase section of the narration
   * (seeking back to INTRO_END_S) when Continuous voice guidance is ON.
   */
  const endedHandlerRef = useRef<(() => void) | null>(null);

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
    const audio = new Audio(NARRATION_SRC);
    audio.volume  = 0.8;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
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
   * Stop the narration audio and remove all event handlers.
   * Safe to call at any time — every branch is a no-op when nothing is active.
   */
  function stopAllAudio() {
    const audio = audioRef.current;
    if (audio) {
      if (timeupdateHandlerRef.current) {
        audio.removeEventListener("timeupdate", timeupdateHandlerRef.current);
        timeupdateHandlerRef.current = null;
      }
      if (endedHandlerRef.current) {
        audio.removeEventListener("ended", endedHandlerRef.current);
        endedHandlerRef.current = null;
      }
      audio.pause();
      audio.currentTime = 0;
    }
    introModeRef.current = false;
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

  function start() {
    // ── iOS HTMLAudioElement unlock ───────────────────────────────────────────
    //
    // iOS Safari requires HTMLAudioElement.play() to be called synchronously
    // inside the tap/click handler.  load() forces iOS to fetch the file
    // (preload="auto" is ignored on iOS).  We do NOT pause after play() here —
    // the real play() call below runs in the same synchronous handler, so any
    // async .then() pause would race against actual playback and kill the audio.
    if (audioRef.current) {
      audioRef.current.load();
    }
    // ── End iOS unlock ────────────────────────────────────────────────────────

    if (status === "paused") {
      // Resume from pause.  Resume the narration audio if it hasn't ended yet
      // (covers the case where the user paused while audio was still playing).
      const audio = audioRef.current;
      if (audio && audio.currentTime > 0 && !audio.ended) {
        audio.play().catch(() => {});
      }
      isRunningRef.current = true;
      setStatus("running");
      startLoop();
      return;
    }

    // ── Fresh start ───────────────────────────────────────────────────────────
    // Reset animation to Exhale (PHASE_START_IDX) at t=0.
    phaseRef.current   = PHASE_START_IDX;
    elapsedRef.current = 0;
    lastTsRef.current  = 0;

    if (voiceEnabledRef.current && audioRef.current) {
      const audio = audioRef.current;
      audio.currentTime = 0;

      // Show idle canvas with "breathe with me" while the intro plays.
      introModeRef.current = true;
      setStatus("intro");
      draw(true);

      // ── timeupdate: watches for the "Exhale" voice onset ────────────────────
      //
      // `timeupdate` fires every ~250 ms (browser-throttled).  When
      // currentTime crosses INTRO_END_S the handler:
      //   1. Removes itself (one-shot).
      //   2. Aligns elapsedRef to the audio's exact position — compensates for
      //      the ~250 ms polling granularity so the first animation frame is
      //      correctly placed within the Exhale phase.
      //   3. Kicks off the rAF animation loop.
      const handleTimeUpdate = () => {
        if (audio.currentTime < INTRO_END_S) return;

        audio.removeEventListener("timeupdate", handleTimeUpdate);
        timeupdateHandlerRef.current = null;
        introModeRef.current = false;

        // Align the animation clock to where the audio already is.
        // lastTsRef=0 means the first rAF delta will be 0, preserving this offset.
        elapsedRef.current = (audio.currentTime - INTRO_END_S) * 1000;

        startAnimation();
      };
      timeupdateHandlerRef.current = handleTimeUpdate;
      audio.addEventListener("timeupdate", handleTimeUpdate);

      // ── ended: loop the phase section when Continuous guidance is ON ────────
      //
      // The narration file contains one breathing cycle (16 s of cues).
      // When the file ends and Continuous is enabled, seek back to INTRO_END_S
      // and replay — skipping the intro speech so the user only hears the cues.
      const handleEnded = () => {
        if (voiceContinuousRef.current && audioRef.current) {
          const a = audioRef.current;
          a.currentTime = INTRO_END_S;
          a.play().catch(() => {});
        }
      };
      endedHandlerRef.current = handleEnded;
      audio.addEventListener("ended", handleEnded);

      audio.play().catch((err: unknown) => {
        // Audio unavailable — skip intro and start animation immediately.
        console.warn("[BoxBreathing] Audio failed, starting animation directly:", err);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        timeupdateHandlerRef.current = null;
        introModeRef.current         = false;
        startAnimation();
      });

    } else {
      // Voice off — jump straight to animation at Exhale, no audio.
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
