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
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-balance text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-pretty text-base md:text-lg leading-relaxed text-[var(--text-secondary)]">
        An unexpected error occurred. If the problem persists, try refreshing the page.
      </p>
      <button onClick={reset} className="btn-primary mt-8">
        Try again
      </button>
    </main>
  );
}
