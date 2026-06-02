"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePreferences } from "@/hooks/usePreferences";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type NoiseType = "white" | "pink" | "brown" | "heavyrain";

// Per-noise descriptions live in the Noise Therapy section under Instructions
// (reachable via the "Tap to learn how to use Noise Therapy" pill) — kept out of
// the cards here so selecting one doesn't expand its tile on small screens.
const NOISE_INFO: Record<
  NoiseType,
  { label: string; tagline: string; color: string }
> = {
  white: {
    label: "White Noise",
    tagline: "Steady. Consistent. Grounding.",
    color: "#8C9BAA",
  },
  pink: {
    label: "Pink Noise",
    tagline: "Natural. Balanced. Calming.",
    color: "#4BA8BD",
  },
  brown: {
    label: "Brown Noise",
    tagline: "Deep. Warm. Anchoring.",
    color: "#3A8FA3",
  },
  heavyrain: {
    label: "Heavy Rain",
    tagline: "Heavy. Enveloping. Grounding.",
    color: "#477A9E",
  },
};

const NOISE_TYPES: NoiseType[] = ["white", "pink", "brown", "heavyrain"];

// Recorded (sampled) noise types are fetched and decoded once, then looped.
// Their MP3s sit at a lower amplitude than the synthesised noise, so each carries
// a gain boost — measured from mean-volume analysis — that brings it in line with
// white/pink/brown at the same slider position.
// Recorded (sampled) noise types are fetched and decoded once, then looped.
// gainBoost balances the recording to sit at the same perceived level as the
// synthesised white/pink/brown noise at a given slider position (1.4 derived
// from mean-volume analysis of the recording).
const SAMPLED_NOISES: Partial<Record<NoiseType, { url: string; gainBoost: number }>> = {
  heavyrain: { url: "/audio/heavy-rain.mp3", gainBoost: 1.4 },
};

// ─── Audio Generation ─────────────────────────────────────────────────────────

function fillWhiteNoise(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
}

function fillPinkNoise(buffer: AudioBuffer) {
  // Paul Kellet's IIR approximation
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < buffer.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520;
    b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) / 7;
    b6 = w * 0.115926;
  }
}

function fillBrownNoise(buffer: AudioBuffer) {
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < buffer.length; i++) {
    const w = Math.random() * 2 - 1;
    data[i] = (last + 0.02 * w) / 1.02;
    last = data[i];
    data[i] *= 3.5; // compensate for low amplitude
  }
}

// ─── Inline wave icons ─────────────────────────────────────────────────────────

function NoiseIcon({ type, size }: { type: NoiseType; size: number }) {
  if (type === "heavyrain") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 15.58A5 5 0 0 0 18 6h-1.26A8 8 0 1 0 4 14.25" />
        <line x1="7"  y1="17" x2="5"  y2="22" />
        <line x1="11" y1="17" x2="9"  y2="22" />
        <line x1="15" y1="17" x2="13" y2="22" />
        <line x1="19" y1="17" x2="17" y2="22" />
      </svg>
    );
  }
  if (type === "white") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
        <rect x="1"  y="10" width="2" height="4"  rx="1" />
        <rect x="4"  y="7"  width="2" height="10" rx="1" />
        <rect x="7"  y="9"  width="2" height="6"  rx="1" />
        <rect x="10" y="4"  width="2" height="16" rx="1" />
        <rect x="13" y="8"  width="2" height="8"  rx="1" />
        <rect x="16" y="6"  width="2" height="12" rx="1" />
        <rect x="19" y="9"  width="2" height="6"  rx="1" />
        <rect x="22" y="11" width="2" height="2"  rx="1" />
      </svg>
    );
  }
  if (type === "pink") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="M1 12 Q3 6 5 12 Q7 18 9 12 Q11 7 13 12 Q15 17 17 12 Q19 8 21 12 Q22 15 23 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M1 14 Q6 4 12 14 Q18 22 23 14" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NoiseGeneratorProps {
  isAudioPlaying: boolean;
}

export default function NoiseGenerator({ isAudioPlaying }: NoiseGeneratorProps) {
  const { set, prefs, isHydrated, toggleFavouriteNoise } = usePreferences();

  // Favourites-first display order
  const displayNoiseTypes = useMemo(() => {
    const favSet = new Set(prefs.favouriteNoises);
    const favs = NOISE_TYPES.filter(t => favSet.has(t));
    const rest = NOISE_TYPES.filter(t => !favSet.has(t));
    return [...favs, ...rest];
  }, [prefs.favouriteNoises]);

  const [selectedNoise, setSelectedNoise] = useState<NoiseType>("pink");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(3);
  const [autoSync, setAutoSync] = useState(false);

  const audioCtxRef      = useRef<AudioContext | null>(null);
  const sourceRef        = useRef<AudioBufferSourceNode | null>(null);
  const gainRef          = useRef<GainNode | null>(null);
  const volumeRef        = useRef(3);
  const isPlayingRef     = useRef(false);
  const noiseRef         = useRef<NoiseType>("pink");
  // Fade-in state
  const fadeInActiveRef  = useRef(false);
  const fadeIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  // Sampled noises: cached decoded buffers (keyed by type) + request-ID for async cancellation
  const sampleBuffersRef = useRef<Partial<Record<NoiseType, AudioBuffer>>>({});
  const playRequestIdRef = useRef(0);
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getCtx(): AudioContext {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      return audioCtxRef.current;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtxRef.current = new AudioCtx();
    return audioCtxRef.current;
  }

  function clearFadeInterval() {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
    fadeInActiveRef.current = false;
  }

  function stopNoise() {
    playRequestIdRef.current++;          // invalidate any pending async startNoise
    setIsLoadingSample(false);
    clearFadeInterval();
    if (sourceRef.current) {
      try { sourceRef.current.stop(); sourceRef.current.disconnect(); } catch { /* already stopped */ }
      sourceRef.current = null;
    }
    gainRef.current = null;
    isPlayingRef.current = false;
    setIsPlaying(false);
  }

  async function startNoise(type: NoiseType, vol: number) {
    const requestId = ++playRequestIdRef.current;
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    let buf: AudioBuffer;

    const sampled = SAMPLED_NOISES[type];
    if (sampled) {
      // Recorded noise — use cached buffer if available, otherwise fetch and decode once
      let decoded = sampleBuffersRef.current[type];
      if (!decoded) {
        setIsLoadingSample(true);
        try {
          const res         = await fetch(sampled.url);
          const arrayBuffer = await res.arrayBuffer();
          decoded           = await ctx.decodeAudioData(arrayBuffer);
          sampleBuffersRef.current[type] = decoded;
        } catch {
          if (requestId === playRequestIdRef.current) setIsLoadingSample(false);
          return;
        }
        if (requestId !== playRequestIdRef.current) return; // user stopped/switched
        setIsLoadingSample(false);
      }
      buf = decoded;
    } else {
      // Synthesised noise — 3-second looping buffer
      const bufLen = ctx.sampleRate * 3;
      buf          = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      if (type === "white")     fillWhiteNoise(buf);
      else if (type === "pink") fillPinkNoise(buf);
      else                      fillBrownNoise(buf);
    }

    // Final guard after any awaits
    if (requestId !== playRequestIdRef.current) return;

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop   = true;

    const gain = ctx.createGain();
    const boost = SAMPLED_NOISES[type]?.gainBoost ?? 1;
    // Start near-silent for fade-in
    gain.gain.value = 0.001 * (vol / 100) * boost;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    sourceRef.current    = source;
    gainRef.current      = gain;
    isPlayingRef.current = true;
    setIsPlaying(true);
    // Auto-save: record the noise type that just started playing
    set("lastNoiseId", type);

    // ── 3-second logarithmic fade-in ─────────────────────────────────────────
    fadeInActiveRef.current = true;
    const startTime = Date.now();

    fadeIntervalRef.current = setInterval(() => {
      if (!gainRef.current || !audioCtxRef.current || audioCtxRef.current.state === "closed") {
        clearFadeInterval();
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      if (elapsed >= 3) {
        const boost = SAMPLED_NOISES[noiseRef.current]?.gainBoost ?? 1;
        gainRef.current.gain.setValueAtTime(
          (volumeRef.current / 100) * boost,
          audioCtxRef.current.currentTime,
        );
        clearFadeInterval();
        return;
      }
      const fadeInMult = Math.pow(1000, (elapsed / 3) - 1); // 0.001 → 1
      const boost = SAMPLED_NOISES[noiseRef.current]?.gainBoost ?? 1;
      gainRef.current.gain.setValueAtTime(
        (volumeRef.current / 100) * fadeInMult * boost,
        audioCtxRef.current.currentTime,
      );
    }, 50);
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  function handleTogglePlay() {
    if (isPlayingRef.current) {
      stopNoise();
    } else {
      startNoise(noiseRef.current, volumeRef.current);
    }
  }

  function handleSelectNoise(type: NoiseType) {
    noiseRef.current = type;
    setSelectedNoise(type);
    if (isPlayingRef.current) {
      stopNoise();
      setTimeout(() => startNoise(type, volumeRef.current), 50);
    }
  }

  function handleVolume(value: number) {
    volumeRef.current = value;
    setVolumeState(value);
    // Skip direct gain write during fade-in — the interval will use volumeRef.current
    if (gainRef.current && audioCtxRef.current && !fadeInActiveRef.current) {
      const boost = SAMPLED_NOISES[noiseRef.current]?.gainBoost ?? 1;
      gainRef.current.gain.setValueAtTime((value / 100) * boost, audioCtxRef.current.currentTime);
    }
  }

  // ── Auto-sync ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoSync) return;
    if (isAudioPlaying && !isPlayingRef.current) {
      startNoise(noiseRef.current, volumeRef.current);
    }
    if (!isAudioPlaying && isPlayingRef.current) {
      stopNoise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, autoSync]);

  // ── One-shot preference initialisation ───────────────────────────────────────
  // Runs once after localStorage has been read. Pre-selects the saved default
  // (or last-used) noise type so the component doesn't always cold-start on pink.

  useEffect(() => {
    if (!isHydrated) return;
    const target = (prefs.defaultNoiseId ?? prefs.lastNoiseId) as NoiseType | null;
    if (target && NOISE_TYPES.includes(target)) {
      noiseRef.current = target;
      setSelectedNoise(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // ── iOS audio-session recovery ────────────────────────────────────────────────
  // iOS suspends the AudioContext when the screen locks, a call comes in, or
  // the app goes to background.  Resume it the moment the page is visible again
  // so playback continues without requiring another tap.
  useEffect(() => {
    const handleVisibility = () => {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (
        document.visibilityState === "visible" &&
        (ctx.state === "suspended" || (ctx.state as string) === "interrupted")
      ) {
        ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopNoise();
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <section id="noise" className="my-16 scroll-mt-24">
      <div
        className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <h2 className="text-[32px] font-bold mb-4 tracking-tight text-[var(--text-primary)] text-center">
          Noise Therapy
        </h2>

        {/* Link to the Noise Therapy guide in Instructions */}
        <div className="flex justify-center mb-8">
          <Link
            href="/instructions#noise-therapy"
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
            Tap to learn how to use Noise Therapy
          </Link>
        </div>

        {/* Noise Type Selection */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayNoiseTypes.map((type) => {
            const n = NOISE_INFO[type];
            const isSelected = selectedNoise === type;
            const isFav = prefs.favouriteNoises.includes(type);
            return (
              <div key={type} className="relative">
                <button
                  onClick={() => handleSelectNoise(type)}
                  aria-label={n.label}
                  aria-pressed={isSelected}
                  className={`w-full rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--background-light)]"
                      : "border-[var(--border-color)] bg-[var(--background-light)] hover:border-[var(--primary-light)]"
                  }`}
                >
                  <div
                    className="mb-3 pr-7"
                    style={{ color: isSelected ? n.color : "var(--text-secondary)" }}
                  >
                    <NoiseIcon type={type} size={36} />
                  </div>
                  <div className="font-bold text-[17px] mb-1 text-[var(--text-primary)]">
                    {n.label}
                  </div>
                  <div
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: n.color }}
                  >
                    {n.tagline}
                  </div>
                </button>

                {/* Favourite heart */}
                <button
                  onClick={() => toggleFavouriteNoise(type)}
                  className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--background-card)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all cursor-pointer"
                  aria-label={isFav ? `Remove ${n.label} from favourites` : `Add ${n.label} to favourites`}
                  aria-pressed={isFav}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
                    style={{ transition: "fill 0.2s, stroke 0.2s" }}
                    fill={isFav ? "#A56B7C" : "none"}
                    stroke={isFav ? "#A56B7C" : "var(--text-secondary)"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-5">

          {/* Play / Stop button */}
          <div className="flex justify-center">
            <button
              onClick={handleTogglePlay}
              disabled={isLoadingSample}
              className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white disabled:opacity-70 disabled:cursor-wait"
              style={{
                background: "var(--primary)",
                boxShadow: "0 8px 24px rgba(43, 107, 127, 0.4)",
              }}
              aria-label={isLoadingSample ? "Loading audio…" : isPlaying ? "Stop noise" : "Play noise"}
            >
              {isLoadingSample ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-7 h-7 animate-spin">
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
              ) : isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-4 bg-[var(--background-light)] rounded-xl px-5 py-3 border border-[var(--border-color)]">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 shrink-0 text-[var(--text-secondary)]"
            >
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="flex-1"
              style={{ "--fill": `${volume}%` } as React.CSSProperties}
              aria-label="Noise volume"
            />
          </div>

          {/* Auto-sync toggle */}
          <div className="flex justify-center">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                role="switch"
                aria-checked={autoSync}
                aria-label="Auto-sync noise with audio playback"
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
        </div>
      </div>
    </section>
  );
}
