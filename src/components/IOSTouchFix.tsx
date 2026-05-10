"use client";

import { useEffect } from "react";

/**
 * Prevents iOS Safari from rubber-band scrolling the page horizontally
 * when the user swipes left/right. The app only scrolls vertically —
 * any horizontal touch movement should never move the page itself.
 *
 * Must use a direct DOM listener with { passive: false } so that
 * preventDefault() is allowed. React's synthetic onTouchMove is passive
 * by default in React 17+ and cannot call preventDefault().
 */
export default function IOSTouchFix() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      // If horizontal movement dominates, block page-level scroll entirely
      if (dx > dy) e.preventDefault();
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
    };
  }, []);

  return null;
}
