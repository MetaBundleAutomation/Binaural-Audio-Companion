"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, parseDuration } from "@/data/tracks";

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

export function useAudioEngine(): AudioEngine {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [volume, setVolumeState] = useState(10);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const oscLeftRef = useRef<OscillatorNode | null>(null);
  const oscRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<{ left: GainNode; right: GainNode } | null>(null);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);
  const isPlayingRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const volumeRef = useRef(10);
  const currentTrackRef = useRef(0);

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
    setElapsed(0);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, [stopOscillators]);

  const updateProgress = useCallback(() => {
    if (!isPlayingRef.current || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const el = ctx.currentTime - startTimeRef.current;
    const track = tracks[currentTrackRef.current];
    const total = parseDuration(track.duration);
    const clamped = Math.max(0, Math.min(el, total));

    setElapsed(clamped);

    if (clamped >= total) {
      // Auto-advance
      const next = (currentTrackRef.current + 1) % tracks.length;
      stopAudio();
      currentTrackRef.current = next;
      setCurrentTrackIndex(next);
      // Will be started by the effect or user
      return;
    }

    animFrameRef.current = requestAnimationFrame(updateProgress);
  }, [stopAudio]);

  const playAudio = useCallback(() => {
    const ctx = getOrCreateContext();
    const track = tracks[currentTrackRef.current];

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    stopOscillators();

    const freq = track.binauralFreq || 10;
    const baseFreq = 200;
    const vol = volumeRef.current / 100;
    const targetGain = 0.25 * vol;

    const merger = ctx.createChannelMerger(2);
    const analyser = analyserRef.current!;

    const oscL = ctx.createOscillator();
    const gainL = ctx.createGain();
    oscL.type = "sine";
    oscL.frequency.value = baseFreq;
    gainL.gain.value = targetGain;
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0);

    const oscR = ctx.createOscillator();
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

    oscLeftRef.current = oscL;
    oscRightRef.current = oscR;
    gainNodeRef.current = { left: gainL, right: gainR };

    if (pauseTimeRef.current > 0) {
      startTimeRef.current = ctx.currentTime - pauseTimeRef.current;
    } else {
      startTimeRef.current = ctx.currentTime;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    animFrameRef.current = requestAnimationFrame(updateProgress);
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
  }, [stopOscillators]);

  const loadTrack = useCallback((index: number) => {
    stopAudio();
    currentTrackRef.current = index;
    setCurrentTrackIndex(index);
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    setElapsed(0);
  }, [stopAudio]);

  const togglePlay = useCallback(() => {
    if (isPlayingRef.current) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [pauseAudio, playAudio]);

  const nextTrack = useCallback(() => {
    const wasPlaying = isPlayingRef.current;
    const next = (currentTrackRef.current + 1) % tracks.length;
    loadTrack(next);
    if (wasPlaying) {
      setTimeout(() => playAudio(), 50);
    }
  }, [loadTrack, playAudio]);

  const prevTrack = useCallback(() => {
    const wasPlaying = isPlayingRef.current;
    const prev = (currentTrackRef.current - 1 + tracks.length) % tracks.length;
    loadTrack(prev);
    if (wasPlaying) {
      setTimeout(() => playAudio(), 50);
    }
  }, [loadTrack, playAudio]);

  const seek = useCallback((time: number) => {
    if (!audioCtxRef.current) return;

    if (isPlayingRef.current) {
      // Fade out to avoid clicks
      if (gainNodeRef.current) {
        const ctx = audioCtxRef.current;
        const fadeTime = 0.1;
        const now = ctx.currentTime;
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
      gainNodeRef.current.left.gain.setValueAtTime(0.25 * vol, now);
      gainNodeRef.current.right.gain.setValueAtTime(0.25 * vol, now);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isPlayingRef.current) pauseAudio();
          else playAudio();
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

  // Cleanup on unmount
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
