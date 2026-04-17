"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";

// ─── Types & Data ─────────────────────────────────────────────────────────────

type NoiseType = "white" | "pink" | "brown";

const NOISE_INFO: Record<
  NoiseType,
  { label: string; tagline: string; description: string; color: string }
> = {
  white: {
    label: "White Noise",
    tagline: "Steady. Consistent. Grounding.",
    description:
      "All frequencies at equal strength — like a steady fan or static rain. White noise masks sudden sounds that can trigger a stress response, giving your nervous system permission to stand down.",
    color: "#8C9BAA",
  },
  pink: {
    label: "Pink Noise",
    tagline: "Natural. Balanced. Calming.",
    description:
      "Louder at low frequencies, softer at high — the pattern of rainfall, wind, and rivers. Pink noise promotes deeper sleep stages and reduces the brain's sensitivity to intrusive thoughts.",
    color: "#4BA8BD",
  },
  brown: {
    label: "Brown Noise",
    tagline: "Deep. Warm. Anchoring.",
    description:
      "A heavy bass rumble — like distant thunder or ocean swells. Brown noise carries the deepest tone of all three and is preferred by many veterans for reducing hypervigilance at night.",
    color: "#3A8FA3",
  },
};

const NOISE_TYPES: NoiseType[] = ["white", "pink", "brown"];

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
  const { set } = usePreferences();

  const [selectedNoise, setSelectedNoise] = useState<NoiseType>("pink");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(3);
  const [autoSync, setAutoSync] = useState(false);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const gainRef        = useRef<GainNode | null>(null);
  const volumeRef      = useRef(3);
  const isPlayingRef   = useRef(false);
  const noiseRef       = useRef<NoiseType>("pink");
  // Fade-in state
  const fadeInActiveRef  = useRef(false);
  const fadeIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

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
    clearFadeInterval();
    if (sourceRef.current) {
      try { sourceRef.current.stop(); sourceRef.current.disconnect(); } catch { /* already stopped */ }
      sourceRef.current = null;
    }
    gainRef.current = null;
    isPlayingRef.current = false;
    setIsPlaying(false);
  }

  function startNoise(type: NoiseType, vol: number) {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    // 3-second looping buffer
    const bufLen = ctx.sampleRate * 3;
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    if (type === "white")      fillWhiteNoise(buf);
    else if (type === "pink")  fillPinkNoise(buf);
    else                       fillBrownNoise(buf);

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop   = true;

    const gain = ctx.createGain();
    // Start near-silent for fade-in
    gain.gain.value = 0.001 * (vol / 100);

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
      if (!gainRef.current || !audioCtxRef.current) {
        clearFadeInterval();
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      if (elapsed >= 3) {
        // Fade-in complete — set target volume and stop polling
        gainRef.current.gain.setValueAtTime(
          volumeRef.current / 100,
          audioCtxRef.current.currentTime,
        );
        clearFadeInterval();
        return;
      }
      const fadeInMult = Math.pow(1000, (elapsed / 3) - 1); // 0.001 → 1
      gainRef.current.gain.setValueAtTime(
        (volumeRef.current / 100) * fadeInMult,
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
      gainRef.current.gain.setValueAtTime(value / 100, audioCtxRef.current.currentTime);
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
    <section id="noise" className="my-16">
      <div
        className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        <h2 className="text-[32px] font-bold mb-2 tracking-tight text-[var(--text-primary)]">
          Noise Therapy
        </h2>
        <p className="text-[16px] text-[var(--text-secondary)] mb-8 leading-relaxed">
          Background noise softens the environment, reduces sensory overload, and gives your nervous system something steady to hold on to. Choose what works for you.
        </p>

        {/* Noise Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {NOISE_TYPES.map((type) => {
            const n = NOISE_INFO[type];
            const isSelected = selectedNoise === type;
            return (
              <button
                key={type}
                onClick={() => handleSelectNoise(type)}
                aria-label={n.label}
                aria-pressed={isSelected}
                className={`rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--background-light)]"
                    : "border-[var(--border-color)] bg-[var(--background-light)] hover:border-[var(--primary-light)]"
                }`}
              >
                <div
                  className="mb-3"
                  style={{ color: isSelected ? n.color : "var(--text-secondary)" }}
                >
                  <NoiseIcon type={type} size={36} />
                </div>
                <div className="font-bold text-[17px] mb-1 text-[var(--text-primary)]">
                  {n.label}
                </div>
                <div
                  className="text-[11px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: n.color }}
                >
                  {n.tagline}
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                  {n.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-5">

          {/* Volume reminder */}
          <p className="text-center text-xs text-[var(--text-secondary)]">
            🎧 Lower your volume before pressing play
          </p>

          {/* Play / Stop button */}
          <div className="flex justify-center">
            <button
              onClick={handleTogglePlay}
              className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white"
              style={{
                background: "var(--primary)",
                boxShadow: "0 8px 24px rgba(43, 107, 127, 0.4)",
              }}
              aria-label={isPlaying ? "Stop noise" : "Play noise"}
            >
              {isPlaying ? (
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
                Auto-sync with audio playback
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
