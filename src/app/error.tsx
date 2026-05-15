"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console in development; swap for an error-reporting service if needed.
    console.error("[CRUX] Unhandled error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-[32px] font-bold mb-3 tracking-tight text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="text-[16px] text-[var(--text-secondary)] mb-8 leading-relaxed max-w-md">
        An unexpected error occurred. If the problem persists, try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-full border border-[var(--primary)] text-[var(--primary)] font-semibold text-sm transition-all hover:bg-[var(--primary)] hover:text-white cursor-pointer"
      >
        Try again
      </button>
    </main>
  );
}
