"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { usePreferences } from "@/hooks/usePreferences";
import { makeWhiteNoise, makePinkNoise, makeBrownNoise, makeGreenNoise } from "@/lib/audio/cruxNoise";
import PureToneTherapyRaw from "./noise-therapy/PureToneTherapy";

// PureToneTherapy is intentionally untyped (@ts-nocheck); give it a typed shell
// for the props we pass so this strict component still type-checks.
const PureToneTherapy = PureToneTherapyRaw as unknown as React.ComponentType<{
  getAudioEl: () => HTMLAudioElement | null;
  isActive: boolean;
  artworkUrl: string;
  onActivate: () => void;
  onDeactivate: () => void;
}>;

// ─── Types & Data ─────────────────────────────────────────────────────────────

type NoiseType = "white" | "pink" | "brown" | "green" | "heavyrain" | "runningwater" | "oceanwaves";
type SoundType = NoiseType | "puretone";

const NOISE_INFO: Record<
  SoundType,
  { label: string; tagline: string; color: string }
> = {
  white:     { label: "White Noise", tagline: "Steady. Consistent. Grounding.", color: "#8C9BAA" },
  pink:      { label: "Pink Noise",  tagline: "Natural. Balanced. Calming.",    color: "#4BA8BD" },
  brown:     { label: "Brown Noise", tagline: "Deep. Warm. Anchoring.",         color: "#3A8FA3" },
  green:     { label: "Green Noise", tagline: "Lush. Mellow. Soothing.",        color: "#4FA98C" },
  heavyrain: { label: "Heavy Rain",  tagline: "Heavy. Enveloping. Grounding.",  color: "#477A9E" },
  runningwater: { label: "Gentle Rainforest Waterfall", tagline: "Flowing. Fresh. Soothing.", color: "#3FA7D6" },
  oceanwaves:   { label: "Gentle Ocean Waves", tagline: "Rolling. Soothing. Coastal.", color: "#2F9CB0" },
  puretone:  { label: "Pure Tone",   tagline: "Tinnitus relief",                color: "#5EA0C8" },
};

const TILE_TYPES: SoundType[] = ["white", "pink", "brown", "green", "heavyrain", "runningwater", "oceanwaves", "puretone"];

const RAIN_URL    = "/audio/heavy-rain-v2.mp3";
const ARTWORK_URL = "/crux-icon-512.png";

// Video sounds — a long stereo field recording paired with a matching looping video,
// both large and lazy-loaded only on demand. The clips are 24 kHz, so we decode at
// 24 kHz (not the 48 kHz graph rate) to halve the in-memory buffer with no quality
// loss; the loop seam is handled by loopStart/loopEnd at playback.
const RUNNING_WATER_URL    = "/audio/running-water.mp3";                 // ~8.6 MB
const RUNNING_WATER_VIDEO  = "/video/running-water-loop.mp4";            // ~40 MB seamless loop — fetched only when the fullscreen video opens
const RUNNING_WATER_POSTER = "/video/running-water-loop-poster.jpg";
const OCEAN_WAVES_URL      = "/audio/gentle-ocean-waves.mp3";            // ~2.7 MB
const OCEAN_WAVES_VIDEO    = "/video/gentle-waves-on-tropical-beach-loop.mp4";  // ~16 MB seamless loop — fetched only when the fullscreen video opens
const OCEAN_WAVES_POSTER   = "/video/gentle-waves-on-tropical-beach-loop-poster.jpg";

const VIDEO_SOUND: Partial<Record<NoiseType, { audio: string; video: string; poster: string; decodeRate: number }>> = {
  runningwater: { audio: RUNNING_WATER_URL, video: RUNNING_WATER_VIDEO, poster: RUNNING_WATER_POSTER, decodeRate: 24000 },
  oceanwaves:   { audio: OCEAN_WAVES_URL,   video: OCEAN_WAVES_VIDEO,   poster: OCEAN_WAVES_POSTER,   decodeRate: 24000 },
};
const isVideoSound = (t: SoundType): t is "runningwater" | "oceanwaves" => t === "runningwater" || t === "oceanwaves";
// The MP3s carry a little silent encoder padding at each end; trim this much off EACH
// end via the loop node's loopStart/loopEnd so the loop point doesn't click/gap.
const VIDEO_AUDIO_LOOP_TRIM = 0.05; // seconds — tweak if a tick is ever audible

// Per-sound gain cap at full slider, calibrated so every sound sits at the SAME
// PERCEIVED loudness — ITU-R BS.1770 integrated loudness ≈ -29 LUFS, measured with
// ffmpeg on each rendered/decoded buffer — so switching between sounds has no volume
// jump. Plain RMS-matching wasn't enough: bright sounds (white, the water recordings)
// measured equal on a meter but sounded clearly louder than dark brown noise. These
// caps equalise the *heard* level (cap = 10^((-29 - bufferLUFS)/20)); peaks all stay
// well under clipping.
const NOISE_VOL_CAP: Record<NoiseType, number> = {
  white:        0.121,
  pink:         0.302,
  brown:        0.396,
  green:        0.267,
  heavyrain:    0.661,
  runningwater: 2.506,
  oceanwaves:   1.565,
};

const MEDIA_TITLE: Record<NoiseType, string> = {
  white: "White Noise", pink: "Pink Noise", brown: "Brown Noise", green: "Green Noise", heavyrain: "Heavy Rain", runningwater: "Gentle Rainforest Waterfall", oceanwaves: "Gentle Ocean Waves",
};

const isNoise = (t: SoundType): t is NoiseType => t !== "puretone";

// ─── Inline tile icons ──────────────────────────────────────────────────────────

function NoiseIcon({ type, size }: { type: SoundType; size: number }) {
  if (type === "puretone") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 12 Q7 3 12 12 Q17 21 22 12" />
      </svg>
    );
  }
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
  if (type === "runningwater") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 8 Q5 5 8 8 T14 8 T20 8" />
        <path d="M2 13 Q5 10 8 13 T14 13 T20 13" />
        <path d="M2 18 Q5 15 8 18 T14 18 T20 18" />
      </svg>
    );
  }
  if (type === "oceanwaves") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 13 Q5.5 9 9 13 T16 13 T23 13" />
        <path d="M2 18 Q5.5 14 9 18 T16 18 T23 18" />
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
  if (type === "green") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M1 12 Q4 6 7 12 Q10 18 13 12 Q16 6 19 12 Q21 16 23 12" />
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
  const displayTiles = useMemo(() => {
    const favSet = new Set(prefs.favouriteNoises);
    const favs = TILE_TYPES.filter(t => favSet.has(t));
    const rest = TILE_TYPES.filter(t => !favSet.has(t));
    return [...favs, ...rest];
  }, [prefs.favouriteNoises]);

  const [selected, setSelected]       = useState<SoundType>("pink");
  const [activeSound, setActiveSound] = useState<SoundType | null>(null); // what's actually sounding
  const [volume, setVolumeState]      = useState(30);
  const [autoSync, setAutoSync]       = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [videoFullscreen, setVideoFullscreen] = useState<NoiseType | null>(null); // which video sound is showing fullscreen
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ONE shared <audio> element for every sound — including Pure Tone. Playing
  // through a real media element (not Web Audio) is what survives a locked
  // screen and shows lock-screen controls on iOS/Android.
  const audioElRef    = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const volumeRef       = useRef(30);
  const volDebounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef     = useRef<SoundType | null>(null);

  // Web Audio graph for ALL noises (white/pink/brown/green + Heavy Rain). Each
  // loops sample-accurately via an AudioBufferSourceNode (gapless — no <audio loop>
  // seam) and is routed through the shared <audio> element via a MediaStream, so
  // volume is set by the GainNode — which works on iOS, where el.volume is ignored —
  // and lock-screen / background playback still work.
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const noiseGainRef   = useRef<GainNode | null>(null);
  const noiseStreamRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const noiseSrcRef    = useRef<AudioBufferSourceNode | null>(null);
  const bufferCacheRef   = useRef<Partial<Record<NoiseType, AudioBuffer>>>({});
  const bufferPendingRef = useRef<Partial<Record<NoiseType, Promise<AudioBuffer>>>>({});
  const videoRef         = useRef<HTMLVideoElement | null>(null);

  const noiseIsPlaying = activeSound !== null && isNoise(activeSound);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function noiseTargetVol(type: NoiseType) {
    return (volumeRef.current / 100) * NOISE_VOL_CAP[type];
  }

  function clearPauseTimer() {
    if (pauseTimerRef.current) { clearTimeout(pauseTimerRef.current); pauseTimerRef.current = null; }
  }

  function showControls() {
    setControlsVisible(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }

  // ── Web Audio graph (generated noises) ───────────────────────────────────────

  function ensureGraph(): AudioContext {
    if (audioCtxRef.current) return audioCtxRef.current;
    const AC = window.AudioContext
      || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    const dest = ctx.createMediaStreamDestination();
    gain.connect(dest); // NOT to ctx.destination — audio must flow through <audio>
    audioCtxRef.current = ctx;
    noiseGainRef.current = gain;
    noiseStreamRef.current = dest;
    return ctx;
  }

  // Click-free gain ramp on the Web Audio GainNode (sample-accurate).
  function rampGain(to: number, ms: number) {
    const g = noiseGainRef.current, ctx = audioCtxRef.current;
    if (!g || !ctx) return;
    const now = ctx.currentTime;
    const dur = Math.max(0.005, ms / 1000);
    try {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(Math.max(0, to), now + dur);
    } catch { try { g.gain.value = Math.max(0, to); } catch { /* noop */ } }
  }

  // Equal-power wrap crossfade so a decoded recording loops without a click
  // (the generated-noise WAVs are already seamless; Heavy Rain is a raw recording).
  function seamlessLoopBuffer(ctx: AudioContext, buf: AudioBuffer): AudioBuffer {
    const F = Math.min(Math.floor(buf.length / 4), Math.round(buf.sampleRate * 0.08)); // 80 ms
    if (F < 1) return buf;
    const n = buf.length - F;
    const out = ctx.createBuffer(buf.numberOfChannels, n, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const src = buf.getChannelData(c);
      const dst = out.getChannelData(c);
      for (let i = 0; i < n; i++) dst[i] = src[i];
      for (let i = 0; i < F; i++) {
        const t = i / F;
        dst[i] = src[i] * Math.sin((t * Math.PI) / 2) + src[n + i] * Math.cos((t * Math.PI) / 2);
      }
    }
    return out;
  }

  // Decode one noise into a seamlessly-loopable AudioBuffer. Generated noises come
  // from cruxNoise's crossfaded WAVs; Heavy Rain is fetched, decoded and wrap-
  // crossfaded; Running Water is fetched and decoded at its native 24 kHz (which
  // halves the in-memory buffer vs the 48 kHz graph rate, with no quality loss — the
  // source has nothing above 12 kHz), with its loop seam handled by loopStart/loopEnd
  // at playback. Looping any of them via Web Audio is sample-accurate → gapless.
  async function decodeBuffer(type: NoiseType): Promise<AudioBuffer> {
    const vid = VIDEO_SOUND[type];
    if (vid) {
      const data = await (await fetch(vid.audio)).arrayBuffer();
      const OAC = window.OfflineAudioContext
        || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
      return new OAC(2, 1, vid.decodeRate).decodeAudioData(data);
    }
    const ctx = ensureGraph();
    if (type === "heavyrain") {
      const data = await (await fetch(RAIN_URL)).arrayBuffer();
      return seamlessLoopBuffer(ctx, await ctx.decodeAudioData(data));
    }
    const made = type === "white" ? makeWhiteNoise()
               : type === "pink"  ? makePinkNoise()
               : type === "green" ? makeGreenNoise()
               :                     makeBrownNoise();
    const arr = await made.blob.arrayBuffer();
    try { URL.revokeObjectURL(made.url); } catch { /* noop */ }
    return ctx.decodeAudioData(arr);
  }

  // Cache + de-dupe, so a preload (on select) and a later play() never both fetch.
  async function getBuffer(type: NoiseType): Promise<AudioBuffer> {
    const cached = bufferCacheRef.current[type];
    if (cached) return cached;
    const inflight = bufferPendingRef.current[type];
    if (inflight) return inflight;
    const job = decodeBuffer(type).then((buf) => { bufferCacheRef.current[type] = buf; return buf; });
    bufferPendingRef.current[type] = job;
    try { return await job; }
    finally { delete bufferPendingRef.current[type]; }
  }

  function stopNoiseSource() {
    const src = noiseSrcRef.current;
    if (src) {
      try { src.stop(); } catch { /* noop */ }
      try { src.disconnect(); } catch { /* noop */ }
      noiseSrcRef.current = null;
    }
  }

  function setNoiseMediaSession(type: NoiseType) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: MEDIA_TITLE[type], artist: "CRUX", album: "Noise Therapy",
        artwork: [{ src: ARTWORK_URL, sizes: "512x512", type: "image/png" }],
      });
      navigator.mediaSession.playbackState = "playing";
    } catch { /* noop */ }
  }

  async function startNoise(type: NoiseType) {
    const el = audioElRef.current;
    if (!el) return;
    clearPauseTimer();

    // Every noise loops gaplessly via Web Audio, routed through the shared element.
    const ctx = ensureGraph();
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* noop */ } }
    const replacing = !!noiseSrcRef.current; // already playing another generated noise
    setIsLoading(!bufferCacheRef.current[type]);
    let buf: AudioBuffer;
    try { buf = await getBuffer(type); } catch { setIsLoading(false); return; }
    setIsLoading(false);

    stopNoiseSource();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    if (isVideoSound(type)) {
      // Trim the MP3's silent encoder padding off each end so the loop is seamless.
      src.loopStart = VIDEO_AUDIO_LOOP_TRIM;
      src.loopEnd = Math.max(src.loopStart + 0.1, buf.duration - VIDEO_AUDIO_LOOP_TRIM);
    }
    src.connect(noiseGainRef.current!);
    noiseSrcRef.current = src;
    src.start(0, isVideoSound(type) ? VIDEO_AUDIO_LOOP_TRIM : 0);

    const stream = noiseStreamRef.current!.stream;
    if (el.srcObject !== stream) {
      try { el.pause(); } catch { /* noop */ }
      try { el.removeAttribute("src"); } catch { /* noop */ }
      el.srcObject = stream;
      el.loop = false;
      el.volume = 1; // loudness is controlled by the Web Audio gain
    }
    if (!replacing) noiseGainRef.current!.gain.value = 0;
    if (el.paused) { try { await el.play(); } catch { return; } }
    rampGain(noiseTargetVol(type), replacing ? 240 : 700);
    setNoiseMediaSession(type);

    activeRef.current = type; setActiveSound(type); set("lastNoiseId", type);
  }

  function stopActive(fadeMs = 240) {
    const el = audioElRef.current;
    clearPauseTimer();
    rampGain(0, fadeMs); // every noise now plays through the Web Audio gain
    pauseTimerRef.current = setTimeout(() => {
      // only act if nothing else took over the shared element in the meantime
      if (activeRef.current !== null) return;
      try { el?.pause(); } catch { /* noop */ }
      stopNoiseSource();
      try { if (el) el.srcObject = null; } catch { /* noop */ }
    }, fadeMs + 40);
    activeRef.current = null;
    setActiveSound(null);
    if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
      try { navigator.mediaSession.playbackState = "paused"; } catch { /* noop */ }
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────────

  function handleToggleNoisePlay() {
    if (noiseIsPlaying) stopActive();
    else if (isNoise(selected)) startNoise(selected);
  }

  // Video sounds (Running Water, Ocean Waves): ensure selected + playing, then open
  // the immersive fullscreen video. startNoise's getBuffer lazy-decodes the clip
  // (de-duped) — never fetched on page load.
  function openVideoSound(t: NoiseType) {
    setSelected(t);
    setVideoFullscreen(t);
    if (activeRef.current !== t) {
      if (activeRef.current !== null) { stopActive(120); if (startTimerRef.current) clearTimeout(startTimerRef.current); startTimerRef.current = setTimeout(() => startNoise(t), 150); }
      else { startNoise(t); }
    }
  }

  function handleSelectTile(t: SoundType) {
    // Video sounds are special: tapping the tile (even when already selected) starts
    // the sound and opens the fullscreen video.
    if (isVideoSound(t)) { openVideoSound(t); return; }

    if (t === selected) return;
    const wasNoisePlaying = activeRef.current !== null && isNoise(activeRef.current);
    const wasToneActive   = activeRef.current === "puretone";

    // Leaving the currently-sounding source for a different kind of tile → stop it
    // (Pure Tone → anything, or a noise → Pure Tone). noise → noise is handled below.
    if (wasToneActive || (wasNoisePlaying && t === "puretone")) {
      stopActive(180);
    }

    setSelected(t);

    if (isNoise(t) && wasNoisePlaying) {
      stopActive(120);
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      startTimerRef.current = setTimeout(() => startNoise(t), 150);
    } else if (isNoise(t)) {
      startNoise(t);
    }
  }

  function handleVolume(value: number) {
    volumeRef.current = value;
    setVolumeState(value);
    const t = activeRef.current;
    if (t && isNoise(t)) rampGain(noiseTargetVol(t), 60);
    if (volDebounceRef.current) clearTimeout(volDebounceRef.current);
    volDebounceRef.current = setTimeout(() => set("lastNoiseVolume", value), 300);
  }

  // Pure Tone took over the shared element
  function handleToneActivate() {
    clearPauseTimer();
    stopNoiseSource(); // stop any generated-noise source; Pure Tone drives the element now
    activeRef.current = "puretone";
    setActiveSound("puretone");
  }

  function handleToneDeactivate() {
    activeRef.current = null;
    setActiveSound(null);
  }

  // ── Auto-sync (noises only) ────────────────────────────────────────────────────

  useEffect(() => {
    if (!autoSync) return;
    if (isAudioPlaying && activeRef.current === null && isNoise(selected)) {
      startNoise(selected);
    }
    if (!isAudioPlaying && activeRef.current !== null && isNoise(activeRef.current)) {
      stopActive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAudioPlaying, autoSync, selected]);

  // ── MediaSession play/pause handlers — registered ONCE ─────────────────────────

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const onPlay  = () => { audioElRef.current?.play().catch(() => {}); try { navigator.mediaSession.playbackState = "playing"; } catch {} };
    const onPause = () => { audioElRef.current?.pause();                 try { navigator.mediaSession.playbackState = "paused";  } catch {} };
    try {
      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
    } catch { /* noop */ }
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      } catch { /* noop */ }
    };
  }, []);

  // ── One-shot preference initialisation ───────────────────────────────────────

  useEffect(() => {
    if (!isHydrated) return;
    const target = (prefs.defaultNoiseId ?? prefs.lastNoiseId) as SoundType | null;
    if (target && TILE_TYPES.includes(target)) setSelected(target);
    const vol = prefs.lastNoiseVolume ?? prefs.defaultVolume ?? 30;
    volumeRef.current = vol;
    setVolumeState(vol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearPauseTimer();
      if (startTimerRef.current) clearTimeout(startTimerRef.current);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      try { audioElRef.current?.pause(); } catch { /* noop */ }
      try { noiseSrcRef.current?.stop(); } catch { /* noop */ }
      try { audioCtxRef.current?.close(); } catch { /* noop */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the fullscreen video opens: enforce muted (React's muted attr is unreliable;
  // the sound comes from the Web Audio MP3) and let Esc close it.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
    if (!videoFullscreen) {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
      return;
    }
    showControls();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setVideoFullscreen(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [videoFullscreen]);

  // The video media to show fullscreen (Running Water / Ocean Waves), or none.
  const fsVideo = videoFullscreen ? VIDEO_SOUND[videoFullscreen] : undefined;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
    <section id="noise" className="my-16 scroll-mt-24">
      <div
        className="rounded-3xl p-10 border border-[var(--border-color)] bg-[var(--background-card)]"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* One shared media element for every sound (survives a locked screen) */}
        <audio ref={audioElRef} preload="auto" playsInline loop />

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

        {/* Sound selection — 8 tiles (2 rows of 4 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {displayTiles.map((type) => {
            const n = NOISE_INFO[type];
            const isSelected = selected === type;
            const isFav = prefs.favouriteNoises.includes(type);
            return (
              <div key={type} className="relative">
                <button
                  onClick={() => handleSelectTile(type)}
                  aria-label={n.label}
                  aria-pressed={isSelected}
                  className={`w-full h-full rounded-2xl p-5 text-left border-2 transition-all cursor-pointer ${
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
                  {isVideoSound(type) && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold" style={{ color: n.color }}>
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                      Tap to watch video
                    </div>
                  )}
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

        {/* Controls — noise controls, or the Pure Tone panel */}
        {selected === "puretone" ? (
          <PureToneTherapy
            getAudioEl={() => audioElRef.current}
            isActive={activeSound === "puretone"}
            artworkUrl={ARTWORK_URL}
            onActivate={handleToneActivate}
            onDeactivate={handleToneDeactivate}
          />
        ) : (
          <div className="flex flex-col gap-5">

            {/* Play / Stop button */}
            <div className="flex justify-center">
              <button
                onClick={handleToggleNoisePlay}
                disabled={isLoading}
                className="w-[70px] h-[70px] rounded-full flex items-center justify-center cursor-pointer transition-all text-white disabled:opacity-70 disabled:cursor-wait"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 8px 24px rgba(43, 107, 127, 0.4)",
                }}
                aria-label={isLoading ? "Loading audio…" : noiseIsPlaying ? "Stop noise" : "Play noise"}
              >
                {isLoading ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-7 h-7 animate-spin">
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : noiseIsPlaying ? (
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
        )}
      </div>
    </section>

    {/* Immersive fullscreen video (Running Water / Ocean Waves) — fills the viewport on
        every device via a CSS overlay (reliable on iOS, where the native fullscreen API
        is limited). Tap anywhere or press Esc to close; the sound keeps playing. */}
    {fsVideo && (
      <div
        onClick={() => setVideoFullscreen(null)}
        onMouseMove={showControls}
        role="dialog"
        aria-modal="true"
        aria-label="Fullscreen video — tap to close"
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-pointer"
      >
        <video
          ref={videoRef}
          src={fsVideo.video}
          poster={fsVideo.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          className="w-full h-full object-cover"
        />
        <span
          aria-hidden
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl leading-none backdrop-blur-sm transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0"}`}
        >×</span>
        <span className={`absolute bottom-5 inset-x-0 text-center text-white/80 text-sm pointer-events-none transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0"}`}>
          Tap anywhere to close
        </span>
      </div>
    )}
    </>
  );
}
