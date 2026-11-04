"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "crux:volume-warning-dismissed";

export default function VolumeWarningModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(21, 26, 30, 0.82)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vol-warning-title"
    >
      <div
        className="glass-strong w-full max-w-md rounded-3xl p-8 flex flex-col gap-5"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Headphones icon */}
        <div className="flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-14 h-14"
            aria-hidden="true"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
        </div>

        <h2
          id="vol-warning-title"
          className="text-[22px] font-semibold tracking-tight text-center text-[var(--text-primary)]"
        >
          Before you begin
        </h2>

        <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed text-center">
          Binaural beats require{" "}
          <strong className="text-[var(--text-primary)]">stereo headphones</strong> — they
          won&apos;t work through speakers. Please set your volume to a{" "}
          <strong className="text-[var(--text-primary)]">comfortable, low level</strong>{" "}
          before pressing play.
        </p>

        <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed text-center">
          If you experience discomfort, dizziness, or heightened anxiety at any time, stop
          the audio immediately.
        </p>

        <button
          onClick={dismiss}
          className="btn-primary w-full mt-2"
        >
          Got it — I&apos;ll keep it low
        </button>
      </div>
    </div>
  );
}
