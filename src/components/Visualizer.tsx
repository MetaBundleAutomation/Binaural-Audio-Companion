"use client";

import { useEffect, useRef } from "react";

interface VisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

const COLORS = ["#e8a87c", "#5eb3cc", "#f5c99b", "#81c3d7", "#d4915f"];

export default function Visualizer({ analyser, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let bufferLength = 0;
    let dataArray: Uint8Array<ArrayBuffer> | null = null;

    if (analyser) {
      bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;
    }

    function draw() {
      if (!canvas || !ctx) return;
      animRef.current = requestAnimationFrame(draw);

      const w = canvas.width;
      const h = canvas.height;

      // Clear
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      ctx.fillStyle = isDark ? "#2a2a20" : "#FAF9F0";
      ctx.fillRect(0, 0, w, h);

      if (!isPlaying || !analyser || !dataArray) return;

      analyser.getByteFrequencyData(dataArray);

      const barWidth = (w / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * h * 0.8;
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fillRect(x, h - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [analyser, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full absolute inset-0 z-[1]"
      aria-label="Audio visualizer"
      role="img"
    />
  );
}
