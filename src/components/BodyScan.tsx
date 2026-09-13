"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePreferences } from "@/hooks/usePreferences";

// ─── Types ────────────────────────────────────────────────────────────────────

type Narrator      = "john" | "emily";
type SessionStatus = "idle" | "playing" | "paused" | "complete";

// ─── Narrator registry ────────────────────────────────────────────────────────

const NARRATORS: Record<Narrator, { label: string; src: string; totalS: number }> = {
  john:  { label: "Ben",  src: "/audio/ben_body_scan.mp3",  totalS: 907 }, // ~15:07 (placeholder — tell me the real length)
  emily: { label: "Jane", src: "/audio/jane_body_scan.mp3", totalS: 881 }, // ~14:41 (placeholder — tell me the real length)
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(s: number): string {
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BodyScan() {
  const { prefs, isHydrated, set } = usePreferences();

  // ── Refs ───────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef      = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ──────────────────────────────────────────────────────────────────
  const [status,           setStatus]          = useState<SessionStatus>("idle");
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [elapsed,       setElapsed]       = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  // Three-tier capability detection — inline, matching existing codebase pattern.
  // Tier 1: video + ambience + narration
  // Tier 2: narration only (video/MP4 not supported)
  // Tier 3: blocked — play() rejects, session doesn't start
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────
  const narrator    = isHydrated ? (prefs.bodyScanNarrator ?? "john") : "john";
  const totalS      = audioDuration || NARRATORS[narrator].totalS;
  const progressPct = totalS > 0 ? Math.min(100, (elapsed / totalS) * 100) : 0;
  const isActive    = status === "playing" || status === "paused";
  const showControls = status !== "playing" || isControlsVisible;

  // ── Video capability detection (no shared hook — done inline like other components) ──
  useEffect(() => {
    const v = document.createElement("video");
    setCanPlayVideo(v.canPlayType("video/mp4") !== "");
  }, []);

  // ── Audio metadata + ended events; re-wired when narrator changes ──────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioDuration(0);
    audio.load(); // force metadata refresh for new src

    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onEnded = () => {
      cancelAnimationFrame(rafRef.current);
      const video = videoRef.current;
      if (video) { video.pause(); video.currentTime = 0; }
      setStatus("complete");
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [narrator]);

  // ── Auto-hide controls during playback ────────────────────────────────────
  useEffect(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (status === "playing") {
      idleTimerRef.current = setTimeout(() => setIsControlsVisible(false), 3000);
    } else {
      setIsControlsVisible(true);
    }
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [status]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (audio) audio.pause();
      if (video) { video.pause(); }
    };
  }, []);

  // ── rAF progress loop ──────────────────────────────────────────────────────
  function startProgressLoop() {
    cancelAnimationFrame(rafRef.current);
    const tick = () => {
      const audio = audioRef.current;
      if (audio) setElapsed(audio.currentTime);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;

    if (status === "paused") {
      try {
        await audio.play();
        if (canPlayVideo) videoRef.current?.play().catch(() => {});
        setStatus("playing");
        startProgressLoop();
      } catch { /* non-fatal — stay paused */ }
      return;
    }

    // Fresh start
    audio.currentTime = 0;
    setElapsed(0);

    try {
      await audio.play();
    } catch {
      return; // autoplay blocked — stay idle
    }

    // Tier 1: play video ambience if supported; silent fallback to tier 2/3
    const video = videoRef.current;
    if (canPlayVideo && video) {
      video.currentTime = 0;
      try {
        await video.play();
        /* video plays silently — visual background only */
      } catch { /* video blocked — narration-only fallback */ }
    }

    setStatus("playing");
    startProgressLoop();
  }

  function pause() {
    audioRef.current?.pause();
    videoRef.current?.pause();
    cancelAnimationFrame(rafRef.current);
    setStatus("paused");
  }

  function stop() {
    cancelAnimationFrame(rafRef.current);
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    const video = videoRef.current;
    if (video) { video.pause(); video.currentTime = 0; }
    setElapsed(0);
    setStatus("idle");
  }

  function wakeControls() {
    setIsControlsVisible(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (status === "playing") {
      idleTimerRef.current = setTimeout(() => setIsControlsVisible(false), 3000);
    }
  }

  function seek(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setElapsed(seconds);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <section id="body-scan" className="my-16 scroll-mt-24">

      {/* Narration audio — hidden, controlled via ref */}
      <audio ref={audioRef} src={NARRATORS[narrator].src} preload="none" />

      {/* ── Fullscreen video overlay — always in DOM (so videoRef stays valid),
             visible only when session is active. Same pattern as NoiseGenerator. ── */}
      {canPlayVideo && (
        <div
          className={`fixed inset-0 z-[100] bg-black transition-opacity duration-700 ${
            isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onPointerMove={isActive ? wakeControls : undefined}
          onClick={isActive ? wakeControls : undefined}
        >
          {/* Beach sunrise fills the viewport */}
          <video
            ref={videoRef}
            src="/video/beach-sunrise.mp4"
            muted
            loop
            playsInline
            preload="none"
            className="w-full h-full object-cover"
            aria-hidden="true"
          />

          {/* Readability overlay */}
          <div className="absolute inset-0 bg-black/45" />

          {/* Controls — centred, auto-hide during playback */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 transition-opacity duration-[1200ms] ${
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <h2 className="text-[32px] font-bold tracking-tight text-white text-center">Body Scan</h2>

            <Link
              href="/instructions#body-scan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold text-[var(--primary)] bg-white/10 border border-white/20 hover:border-white/40 transition-all"
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
              Tap to learn how to use Body Scan
            </Link>

            <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 360 }}>
              {/* Play / Pause */}
              <div className="flex justify-center">
                <button
                  onClick={status === "playing" ? pause : play}
                  className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white"
                  style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(43,107,127,0.4)" }}
                  aria-label={status === "playing" ? "Pause" : "Play"}
                >
                  {status === "playing" ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Scrub bar + time */}
              <div className="flex items-center gap-3 px-1 text-[11px] tabular-nums text-white/70">
                <span>{formatTime(elapsed)}</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(totalS, 1)}
                  step={1}
                  value={Math.floor(elapsed)}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="flex-1"
                  style={{ "--fill": `${progressPct}%` } as React.CSSProperties}
                  aria-label="Session progress"
                />
                <span>{formatTime(totalS)}</span>
              </div>

              {/* End session */}
              <div className="flex justify-center">
                <button
                  onClick={stop}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border border-white/25 text-white/60 hover:border-white/50 hover:text-white/90 transition-all cursor-pointer"
                  aria-label="End session and return to start"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                  End session
                </button>
              </div>
            </div>

            <p className="text-white/40 text-xs">Tap anywhere to show controls</p>
          </div>
        </div>
      )}

      {/* ── Card — idle and complete states (fades out when session is active) ── */}
      <div
        className={`relative overflow-hidden rounded-3xl border border-[var(--border-color)] transition-opacity duration-500 ${
          isActive ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <div className="absolute inset-0 bg-[var(--background-card)]" />

        <div className="relative z-10 flex flex-col items-center gap-6 p-10">

          <h2 className="text-[32px] font-bold tracking-tight text-[var(--text-primary)] text-center">
            Body Scan
          </h2>

          <Link
            href="/instructions#body-scan"
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
            Tap to learn how to use Body Scan
          </Link>

          {/* ── Narrator selector — idle only ───────────────────────────── */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Narrator</span>
              <div
                role="group"
                aria-label="Narrator"
                className="flex p-1 rounded-full bg-[var(--background-light)] border border-[var(--border-color)]"
              >
                {(["john", "emily"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => set("bodyScanNarrator", n)}
                    aria-pressed={narrator === n}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                      narrator === n
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {NARRATORS[n].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Play button (idle) / audio-only controls (no video support) ── */}
          <div className="flex flex-col gap-4 w-full" style={{ maxWidth: 360 }}>
            <div className="flex justify-center">
              <button
                onClick={status === "playing" ? pause : play}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white"
                style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(43,107,127,0.4)" }}
                aria-label={status === "playing" ? "Pause" : "Play"}
              >
                {status === "playing" ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
                    <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Scrub + end session shown in card only for audio-only fallback */}
            {!canPlayVideo && isActive && (
              <>
                <div className="flex items-center gap-3 px-1 text-[11px] tabular-nums text-[var(--text-secondary)]">
                  <span>{formatTime(elapsed)}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(totalS, 1)}
                    step={1}
                    value={Math.floor(elapsed)}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="flex-1"
                    style={{ "--fill": `${progressPct}%` } as React.CSSProperties}
                    aria-label="Session progress"
                  />
                  <span>{formatTime(totalS)}</span>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={stop}
                    className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    aria-label="End session and return to start"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    End session
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Description — idle only ──────────────────────────────────── */}
          {status === "idle" && (
            <div className="flex flex-col items-center gap-2 text-center" style={{ maxWidth: 420 }}>
              <p className="text-sm font-bold text-[var(--text-primary)] tracking-wide">
                ~15 min · Guided Meditation
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                A full-body relaxation from head to toe. Find a comfortable position before you begin.
              </p>
            </div>
          )}

          {/* ── Complete state ───────────────────────────────────────────── */}
          {status === "complete" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="font-semibold text-[var(--text-primary)]">
                Well done. Take a moment before you move on.
              </p>
              <button
                onClick={stop}
                className="px-6 py-2 rounded-full text-sm font-semibold border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all cursor-pointer"
              >
                Begin again
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
