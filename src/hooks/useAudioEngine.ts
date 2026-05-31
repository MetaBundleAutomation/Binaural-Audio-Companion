"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, parseDuration } from "@/data/tracks";
import { usePreferences } from "@/hooks/usePreferences";

export interface AudioEngine {
  isPlaying: boolean;
  currentTrackIndex: number;
  elapsed: number;
  volume: number;
  analyser: AnalyserNode | null;
  loadTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
}

// EMDR bilateral audio constants — reverse-engineered from reference YouTube (50 BPM analysis)
// Pattern: discrete hard-panned L/R pulses, never both ears simultaneously
const EMDR_FREQ      = 176;   // Hz — carrier (measured from reference audio)
const EMDR_ATTACK_S  = 0.008; // 8 ms linear attack ramp
const EMDR_DUTY      = 0.96;  // pulse occupies 96% of beat interval → ~40 ms silent gap
const EMDR_RELEASE_S = 0.050; // 50 ms linear release at end of each pulse

/**
 * Pre-compute a mono pulse buffer for the given BPM.
 *   – 176 Hz sine carrier
 *   – 8 ms linear attack → full sustain → 50 ms linear release
 *   – Duration = (60/bpm) * EMDR_DUTY seconds
 */
function createEMDRPulseBuffer(ctx: AudioContext, bpm: number): AudioBuffer {
  const sr         = ctx.sampleRate;
  const pulseDur   = (60 / bpm) * EMDR_DUTY;
  const n          = Math.floor(sr * pulseDur);
  const buf        = ctx.createBuffer(1, n, sr);
  const d          = buf.getChannelData(0);
  const atkN       = Math.min(Math.floor(sr * EMDR_ATTACK_S), n);
  const relN       = Math.min(Math.floor(sr * EMDR_RELEASE_S), n - atkN);
  const susN       = n - atkN - relN;
  for (let i = 0; i < n; i++) {
    let env: number;
    if      (i < atkN)           env = i / atkN;                            // ramp up
    else if (i < atkN + susN)    env = 1.0;                                 // sustain
    else                         env = 1.0 - (i - atkN - susN) / relN;     // ramp down
    d[i] = Math.sin(2 * Math.PI * EMDR_FREQ * i / sr) * env;
  }
  return buf;
}

export function useAudioEngine(): AudioEngine {
  const { set, prefs, isHydrated } = usePreferences();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolumeState] = useState(10);

  const audioCtxRef       = useRef<AudioContext | null>(null);
  const volumeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const oscLeftRef        = useRef<OscillatorNode | null>(null);
  const oscRightRef       = useRef<OscillatorNode | null>(null);
  const gainNodeRef       = useRef<{ left: GainNode; right: GainNode } | null>(null);
  const mergerRef          = useRef<ChannelMergerNode | null>(null);
  const emdrSchedulerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const emdrNextTimeRef    = useRef(0);          // Web Audio ctx.currentTime of next scheduled pulse
  const emdrSideRef        = useRef<0 | 1>(0);  // 0 = left, 1 = right
  const emdrPulseBufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef      = useRef(0);
  const pauseTimeRef    = useRef(0);
  const isPlayingRef    = useRef(false);
  const animFrameRef    = useRef<number>(0);
  const volumeRef       = useRef(10);
  const currentTrackRef = useRef(0);
  // 1 = full user volume; approaches 0.001 (≈ −60 dB) during logarithmic fade-out
  const fadeMultiplierRef = useRef(1);
  // Fade-in: soft 3-second ramp at the start of every playback
  const needsFadeInRef  = useRef(false);
  const fadeInStartRef  = useRef(0);
  const fadeInMultRef   = useRef(1); // current fade-in multiplier, used by setVolume
  // Prevents the preference-initialisation effect from running more than once
  const hasInitialisedRef = useRef(false);

  const getOrCreateContext = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      return audioCtxRef.current;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    audioCtxRef.current      = ctx;
    analyserRef.current      = analyser;
    emdrPulseBufferRef.current = null; // invalidate — new context needs a fresh buffer
    return ctx;
  }, []);

  const stopEMDRScheduler = useCallback(() => {
    if (emdrSchedulerRef.current) {
      clearInterval(emdrSchedulerRef.current);
      emdrSchedulerRef.current = null;
    }
  }, []);

  const stopOscillators = useCallback(() => {
    if (oscLeftRef.current) {
      try { oscLeftRef.current.stop(); oscLeftRef.current.disconnect(); } catch { /* already stopped */ }
      oscLeftRef.current = null;
    }
    if (oscRightRef.current) {
      try { oscRightRef.current.stop(); oscRightRef.current.disconnect(); } catch { /* already stopped */ }
      oscRightRef.current = null;
    }
    gainNodeRef.current = null;
    if (mergerRef.current) {
      try { mergerRef.current.disconnect(); } catch { /* already disconnected */ }
      mergerRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    stopEMDRScheduler();
    stopOscillators();
    isPlayingRef.current = false;
    setIsPlaying(false);
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
    fadeMultiplierRef.current = 1;
    needsFadeInRef.current = false;
    fadeInMultRef.current = 1;
    setElapsed(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
    }
  }, [stopEMDRScheduler, stopOscillators]);

  const updateProgress = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;

    // ── Fade-in (first 3 seconds of every playback) ──────────────────────────
    if (needsFadeInRef.current) {
      const fadeInElapsed = ctx.currentTime - fadeInStartRef.current;
      let fadeInMult: number;
      if (fadeInElapsed < 3) {
        // Logarithmic ramp: 0.001 → 1 over 3 seconds
        fadeInMult = Math.pow(1000, (fadeInElapsed / 3) - 1);
      } else {
        fadeInMult = 1;
        needsFadeInRef.current = false;
      }
      fadeInMultRef.current = fadeInMult;
      // EMDR tracks: oscillators are silent — only update gain for non-EMDR tracks
      if (gainNodeRef.current && !tracks[currentTrackRef.current].emdrBpm) {
        const vol  = volumeRef.current / 100;
        const gain = 0.25 * vol * fadeMultiplierRef.current * fadeInMult;
        gainNodeRef.current.left.gain.setValueAtTime(gain, ctx.currentTime);
        gainNodeRef.current.right.gain.setValueAtTime(gain, ctx.currentTime);
      }
    }

    const el      = ctx.currentTime - startTimeRef.current;
    const track   = tracks[currentTrackRef.current];
    const total   = parseDuration(track.duration);
    const clamped = Math.max(0, Math.min(el, total));

    setElapsed(clamped);

    // Logarithmic fade-out during the final fadeOutDuration seconds.
    // Formula: gain = userVol × 0.25 × Math.pow(0.001, t / fadeOutDuration)
    //   t=0   → ×1.000  (full volume — fade barely noticeable for the first minute)
    //   t=150 → ×0.032  (≈ −30 dB — quiet but not yet silent, halfway through)
    //   t=300 → ×0.001  (≈ −60 dB — below human perception threshold → silence)
    // This matches how the ear hears loudness (logarithmic scale = dB), so the
    // fade feels imperceptibly slow at first and then gradually more pronounced.
    const fadeOutDuration = track.fadeOutDuration ?? 0;
    if (fadeOutDuration > 0) {
      const fadeStart = total - fadeOutDuration;
      if (clamped >= fadeStart) {
        const t        = clamped - fadeStart;                // 0 → fadeOutDuration
        const fadeMult = Math.pow(0.001, t / fadeOutDuration);
        fadeMultiplierRef.current = fadeMult;
        // EMDR tracks: oscillators are silent — fade-out is applied via pulse gain
        if (gainNodeRef.current && !tracks[currentTrackRef.current].emdrBpm) {
          const vol  = volumeRef.current / 100;
          // fadeInMult will be 1 by the time fade-out starts (3s vs 10min)
          const gain = 0.25 * vol * fadeMult * fadeInMultRef.current;
          gainNodeRef.current.left.gain.setValueAtTime(gain, ctx.currentTime);
          gainNodeRef.current.right.gain.setValueAtTime(gain, ctx.currentTime);
        }
      } else {
        fadeMultiplierRef.current = 1;
      }
    }

    // Auto-advance at the end of the track
    if (clamped >= total) {
      const next = (currentTrackRef.current + 1) % tracks.length;
      stopAudio();
      currentTrackRef.current = next;
      setCurrentTrackIndex(next);
      return;
    }

    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [stopAudio]);

  const startEMDRScheduler = useCallback((bpm: number) => {
    stopEMDRScheduler();
    const ctx    = audioCtxRef.current;
    const merger = mergerRef.current;
    if (!ctx || !merger) return;

    // Build the pulse buffer for this BPM.
    // Each pulse: 176 Hz sine, 8 ms attack, full sustain, 50 ms release.
    // Duration = (60/bpm) * EMDR_DUTY  (96% of beat interval → ~40 ms silent gap).
    emdrPulseBufferRef.current = createEMDRPulseBuffer(ctx, bpm);

    const interval = 60 / bpm;   // seconds between consecutive L / R pulses
    emdrNextTimeRef.current = ctx.currentTime;
    emdrSideRef.current     = 0; // start on left

    // Lookahead scheduler: fires every 25 ms, schedules any pulses due within
    // the next 100 ms using sample-accurate Web Audio timing.
    emdrSchedulerRef.current = setInterval(() => {
      const c   = audioCtxRef.current;
      const mrg = mergerRef.current;
      const buf = emdrPulseBufferRef.current;
      if (!c || !mrg || !buf || c.state === "closed") return;

      while (emdrNextTimeRef.current < c.currentTime + 0.1) {
        const side   = emdrSideRef.current;
        const source = c.createBufferSource();
        source.buffer = buf;

        const g = c.createGain();
        g.gain.value = 0.7 * (volumeRef.current / 100)
                           * fadeMultiplierRef.current
                           * fadeInMultRef.current;
        source.connect(g);
        g.connect(mrg, 0, side); // side 0 → left channel, 1 → right channel
        source.start(emdrNextTimeRef.current);

        emdrSideRef.current     = (1 - side) as 0 | 1;
        emdrNextTimeRef.current += interval;
      }
    }, 25);
  }, [stopEMDRScheduler]);

  const playAudio = useCallback(() => {
    const ctx   = getOrCreateContext();
    const track = tracks[currentTrackRef.current];

    if (ctx.state === "suspended") ctx.resume();

    stopEMDRScheduler();
    stopOscillators();

    const freq    = track.binauralFreq || 10;
    const baseFreq = 200;
    const vol     = volumeRef.current / 100;

    // If resuming mid-fade, initialise gain at the correct logarithmic level
    const total           = parseDuration(track.duration);
    const fadeOutDuration = track.fadeOutDuration ?? 0;
    const resumePos       = pauseTimeRef.current > 0 ? pauseTimeRef.current : 0;
    const fadeStart       = total - fadeOutDuration;
    let fadeMult = 1;
    if (fadeOutDuration > 0 && resumePos >= fadeStart) {
      const t = resumePos - fadeStart;
      fadeMult = Math.pow(0.001, t / fadeOutDuration);
    }
    fadeMultiplierRef.current = fadeMult;

    // Fade-in: every playback (including resume) starts at near-silence.
    needsFadeInRef.current = true;
    fadeInMultRef.current  = 0.001;
    // EMDR tracks: oscillators are silenced — only the pulse scheduler produces audio
    const isEMDR      = !!track.emdrBpm;
    const initialGain = isEMDR ? 0 : 0.25 * vol * fadeMult * 0.001;

    const merger  = ctx.createChannelMerger(2);
    mergerRef.current = merger;
    const analyser = analyserRef.current!;

    const oscL  = ctx.createOscillator();
    const gainL = ctx.createGain();
    oscL.type = "sine";
    oscL.frequency.value = baseFreq;
    gainL.gain.value = initialGain;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR  = ctx.createOscillator();
    const gainR = ctx.createGain();
    oscR.type = "sine";
    oscR.frequency.value = baseFreq + freq;
    gainR.gain.value = initialGain;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(analyser);
    analyser.connect(ctx.destination);

    oscL.start();
    oscR.start();

    oscLeftRef.current  = oscL;
    oscRightRef.current = oscR;
    gainNodeRef.current = { left: gainL, right: gainR };

    // Anchor fade-in timing to this exact moment
    fadeInStartRef.current = ctx.currentTime;

    startTimeRef.current = pauseTimeRef.current > 0
      ? ctx.currentTime - pauseTimeRef.current
      : ctx.currentTime;

    isPlayingRef.current = true;
    setIsPlaying(true);
    // Auto-save: record the beat that just started playing
    set("lastBeatId", track.name);
    animFrameRef.current = requestAnimationFrame(updateProgress);

    if (track.emdrBpm) startEMDRScheduler(track.emdrBpm);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: "CRUX",
        album: "Binaural Audio",
      });
      navigator.mediaSession.playbackState = "playing";
    }
  }, [getOrCreateContext, stopEMDRScheduler, stopOscillators, startEMDRScheduler, updateProgress]);

  const pauseAudio = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (audioCtxRef.current && startTimeRef.current > 0) {
      pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
    }

    // If paused mid-fade-in, reset so the next play starts a fresh fade-in.
    needsFadeInRef.current = false;
    fadeInMultRef.current  = 1;

    stopEMDRScheduler();
    stopOscillators();
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  }, [stopEMDRScheduler, stopOscillators]);

  const loadTrack = useCallback((index: number) => {
    stopAudio();
    currentTrackRef.current = index;
    setCurrentTrackIndex(index);
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: tracks[index].name,
        artist: "CRUX",
        album: "Binaural Audio",
      });
    }
  }, [stopAudio]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) pauseAudio();
    else playAudio();
  }, [pauseAudio, playAudio]);

  const nextTrack = useCallback(() => {
    const wasPlaying = isPlayingRef.current;
    const next = (currentTrackRef.current + 1) % tracks.length;
    loadTrack(next);
    if (wasPlaying) setTimeout(() => playAudio(), 50);
  }, [loadTrack, playAudio]);

  const prevTrack = useCallback(() => {
    const wasPlaying = isPlayingRef.current;
    const prev = (currentTrackRef.current - 1 + tracks.length) % tracks.length;
    loadTrack(prev);
    if (wasPlaying) setTimeout(() => playAudio(), 50);
  }, [loadTrack, playAudio]);

  const seek = useCallback((time: number) => {
    if (!audioCtxRef.current) return;

    if (isPlayingRef.current) {
      if (gainNodeRef.current) {
        const ctx      = audioCtxRef.current;
        const fadeTime = 0.1;
        const now      = ctx.currentTime;
        gainNodeRef.current.left.gain.setValueAtTime(gainNodeRef.current.left.gain.value, now);
        gainNodeRef.current.left.gain.linearRampToValueAtTime(0, now + fadeTime);
        gainNodeRef.current.right.gain.setValueAtTime(gainNodeRef.current.right.gain.value, now);
        gainNodeRef.current.right.gain.linearRampToValueAtTime(0, now + fadeTime);

        setTimeout(() => {
          stopOscillators();
          pauseTimeRef.current = time;
          playAudio();
        }, fadeTime * 1000 + 10);
      } else {
        stopOscillators();
        pauseTimeRef.current = time;
        playAudio();
      }
    } else {
      pauseTimeRef.current = time;
      setElapsed(time);
    }
  }, [stopOscillators, playAudio]);

  const setVolume = useCallback((value: number) => {
    volumeRef.current = value;
    setVolumeState(value);
    // Debounce: don't write to localStorage on every pixel of a slider drag
    if (volumeDebounceRef.current) clearTimeout(volumeDebounceRef.current);
    volumeDebounceRef.current = setTimeout(() => { set("lastVolume", value); }, 300);
    // EMDR tracks: oscillators are silent — don't restore their gain on volume change
    if (gainNodeRef.current && audioCtxRef.current && !tracks[currentTrackRef.current].emdrBpm) {
      const now  = audioCtxRef.current.currentTime;
      const vol  = value / 100;
      // Respect both the fade-out and fade-in multipliers so a volume change
      // never snaps to the wrong level during either ramp.
      const gain = 0.25 * vol * fadeMultiplierRef.current * fadeInMultRef.current;
      gainNodeRef.current.left.gain.setValueAtTime(gain, now);
      gainNodeRef.current.right.gain.setValueAtTime(gain, now);
    }
  }, []);

  // ── One-shot preference initialisation ───────────────────────────────────
  // Runs once after localStorage has been read. Sets the initial track and
  // volume from the user's saved "My Defaults" preferences.

  useEffect(() => {
    if (!isHydrated || hasInitialisedRef.current) return;
    hasInitialisedRef.current = true;

    // Initial track: explicit default → last-played → 0
    const targetName = prefs.defaultBeatId ?? prefs.lastBeatId;
    if (targetName) {
      const idx = tracks.findIndex(t => t.name === targetName);
      if (idx !== -1) {
        currentTrackRef.current = idx;
        setCurrentTrackIndex(idx);
      }
    }

    // Initial volume from saved default (avoids the hardcoded 10% cold start)
    volumeRef.current = prefs.defaultVolume;
    setVolumeState(prefs.defaultVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isPlayingRef.current) pauseAudio(); else playAudio();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevTrack();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextTrack();
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [pauseAudio, playAudio, prevTrack, nextTrack]);

  // ── Media Session (hardware media keys, lock screen, headphone controls) ──

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play",          () => playAudio());
    navigator.mediaSession.setActionHandler("pause",         () => pauseAudio());
    navigator.mediaSession.setActionHandler("nexttrack",     () => nextTrack());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    return () => {
      try {
        navigator.mediaSession.setActionHandler("play",          null);
        navigator.mediaSession.setActionHandler("pause",         null);
        navigator.mediaSession.setActionHandler("nexttrack",     null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
      } catch { /* browser may not support removal */ }
    };
  }, [playAudio, pauseAudio, nextTrack, prevTrack]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopAudio();
      if (volumeDebounceRef.current) clearTimeout(volumeDebounceRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    currentTrackIndex,
    elapsed,
    volume,
    analyser: analyserRef.current,
    loadTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  };
}
