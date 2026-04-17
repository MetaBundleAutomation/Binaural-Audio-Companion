"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, parseDuration } from "@/data/tracks";

export interface AudioEngine {
  isPlaying: boolean;
  isLooping: boolean;
  currentTrackIndex: number;
  elapsed: number;
  volume: number;
  analyser: AnalyserNode | null;
  loadTrack: (index: number) => void;
  togglePlay: () => void;
  toggleLoop: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (value: number) => void;
}

export function useAudioEngine(): AudioEngine {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolumeState] = useState(10);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const analyserRef    = useRef<AnalyserNode | null>(null);
  const oscLeftRef     = useRef<OscillatorNode | null>(null);
  const oscRightRef    = useRef<OscillatorNode | null>(null);
  const gainNodeRef    = useRef<{ left: GainNode; right: GainNode } | null>(null);
  const startTimeRef   = useRef(0);
  const pauseTimeRef   = useRef(0);
  const isPlayingRef   = useRef(false);
  const isLoopingRef   = useRef(false);
  const animFrameRef   = useRef<number>(0);
  const volumeRef      = useRef(10);
  const currentTrackRef = useRef(0);
  // 1 = full user volume; approaches 0.001 (≈ −60 dB) during logarithmic fade
  const fadeMultiplierRef = useRef(1);

  const getOrCreateContext = useCallback(() => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      return audioCtxRef.current;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    return ctx;
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
  }, []);

  const stopAudio = useCallback(() => {
    stopOscillators();
    isPlayingRef.current = false;
    setIsPlaying(false);
    startTimeRef.current = 0;
    pauseTimeRef.current = 0;
    fadeMultiplierRef.current = 1;
    // Reset loop state on every track change (manual select or auto-advance).
    isLoopingRef.current = false;
    setIsLooping(false);
    setElapsed(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }

    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
    }
  }, [stopOscillators]);

  const updateProgress = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const el = ctx.currentTime - startTimeRef.current;
    const track = tracks[currentTrackRef.current];
    const total = parseDuration(track.duration);
    const clamped = Math.max(0, Math.min(el, total));

    if (isLoopingRef.current) {
      // ── Loop mode ───────────────────────────────────────────────────────────
      // Show a lap-timer: time wraps back to 0:00 at the start of each 15-min cycle.
      // No fade, no auto-stop — the oscillators play indefinitely until manually stopped.
      setElapsed(el % total);
    } else {
      // ── Normal mode ─────────────────────────────────────────────────────────
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
          const t = clamped - fadeStart;                // 0 → fadeOutDuration
          const fadeMult = Math.pow(0.001, t / fadeOutDuration);
          fadeMultiplierRef.current = fadeMult;
          if (gainNodeRef.current) {
            const vol = volumeRef.current / 100;
            const gain = 0.25 * vol * fadeMult;
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
    }

    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [stopAudio]);

  const playAudio = useCallback(() => {
    const ctx = getOrCreateContext();
    const track = tracks[currentTrackRef.current];

    if (ctx.state === "suspended") ctx.resume();

    stopOscillators();

    const freq    = track.binauralFreq || 10;
    const baseFreq = 200;
    const vol     = volumeRef.current / 100;

    // If resuming mid-fade, initialise gain at the correct logarithmic level
    const total          = parseDuration(track.duration);
    const fadeOutDuration = track.fadeOutDuration ?? 0;
    const resumePos      = pauseTimeRef.current > 0 ? pauseTimeRef.current : 0;
    const fadeStart      = total - fadeOutDuration;
    let fadeMult = 1;
    if (!isLoopingRef.current && fadeOutDuration > 0 && resumePos >= fadeStart) {
      const t = resumePos - fadeStart;
      fadeMult = Math.pow(0.001, t / fadeOutDuration);
    }
    fadeMultiplierRef.current = fadeMult;
    const targetGain = 0.25 * vol * fadeMult;

    const merger  = ctx.createChannelMerger(2);
    const analyser = analyserRef.current!;

    const oscL  = ctx.createOscillator();
    const gainL = ctx.createGain();
    oscL.type = "sine";
    oscL.frequency.value = baseFreq;
    gainL.gain.value = targetGain;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR  = ctx.createOscillator();
    const gainR = ctx.createGain();
    oscR.type = "sine";
    oscR.frequency.value = baseFreq + freq;
    gainR.gain.value = targetGain;
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1);

    merger.connect(analyser);
    analyser.connect(ctx.destination);

    oscL.start();
    oscR.start();

    oscLeftRef.current  = oscL;
    oscRightRef.current = oscR;
    gainNodeRef.current = { left: gainL, right: gainR };

    startTimeRef.current = pauseTimeRef.current > 0
      ? ctx.currentTime - pauseTimeRef.current
      : ctx.currentTime;

    isPlayingRef.current = true;
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateProgress);

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: "MindFlow",
        album: "Binaural Audio",
      });
      navigator.mediaSession.playbackState = "playing";
    }
  }, [getOrCreateContext, stopOscillators, updateProgress]);

  const pauseAudio = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (audioCtxRef.current && startTimeRef.current > 0) {
      pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
    }

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
  }, [stopOscillators]);

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
        artist: "MindFlow",
        album: "Binaural Audio",
      });
    }
  }, [stopAudio]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) pauseAudio();
    else playAudio();
  }, [pauseAudio, playAudio]);

  const toggleLoop = useCallback(() => {
    const newLooping = !isLoopingRef.current;
    isLoopingRef.current = newLooping;
    setIsLooping(newLooping);

    if (newLooping) {
      // ── Loop turned ON ───────────────────────────────────────────────────
      // Cancel any in-progress logarithmic fade and restore the gain to the
      // user's chosen volume immediately.
      fadeMultiplierRef.current = 1;
      if (gainNodeRef.current && audioCtxRef.current) {
        const vol  = volumeRef.current / 100;
        const gain = 0.25 * vol;
        const now  = audioCtxRef.current.currentTime;
        gainNodeRef.current.left.gain.cancelScheduledValues(now);
        gainNodeRef.current.right.gain.cancelScheduledValues(now);
        gainNodeRef.current.left.gain.setValueAtTime(gain, now);
        gainNodeRef.current.right.gain.setValueAtTime(gain, now);
      }
    } else {
      // ── Loop turned OFF ──────────────────────────────────────────────────
      // Re-anchor the 15-min timer to the current cycle position so the fade
      // and auto-stop apply naturally from here.
      // e.g. if looping for 22 min: 22 % 15 = 7 min → 8 min left before fade starts.
      if (audioCtxRef.current && isPlayingRef.current) {
        const track = tracks[currentTrackRef.current];
        const total = parseDuration(track.duration);
        const el    = audioCtxRef.current.currentTime - startTimeRef.current;
        const cyclePos = el % total;
        startTimeRef.current = audioCtxRef.current.currentTime - cyclePos;
      }
    }
  }, []);

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
    const vol = value / 100;
    if (gainNodeRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      // Respect the current fade multiplier so a volume change during the fade
      // recomputes the curve from the new target level rather than snapping to full.
      const gain = 0.25 * vol * fadeMultiplierRef.current;
      gainNodeRef.current.left.gain.setValueAtTime(gain, now);
      gainNodeRef.current.right.gain.setValueAtTime(gain, now);
    }
  }, []);

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
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [stopAudio]);

  return {
    isPlaying,
    isLooping,
    currentTrackIndex,
    elapsed,
    volume,
    analyser: analyserRef.current,
    loadTrack,
    togglePlay,
    toggleLoop,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
  };
}
