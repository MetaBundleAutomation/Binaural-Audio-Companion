"use client";

import { useEffect } from "react";
import { HEARTBEAT_MS, lengthBucket, trackEvent } from "@/lib/analytics";

// A break longer than this, with the app hidden, starts a new session when the
// person comes back — the same cut-off most analytics tools use.
const NEW_SESSION_AFTER_MS = 30 * 60 * 1000;

/**
 * Measures how long the app is open and in front of the person.
 *
 *   session_5min   every 5 minutes of visible time   (count × 5 / 60 = hours)
 *   session_end    { length } when the visit ends     (bucketed visible time)
 *
 * Only time with the tab visible is counted. Listening with the screen off is
 * measured by the tool events instead, so the two don't double up.
 *
 * Renders nothing. Mounted once in the root layout.
 */
export default function SessionTracker() {
  useEffect(() => {
    let activeMs = 0;
    let visibleSince: number | null =
      document.visibilityState === "visible" ? Date.now() : null;
    let hiddenSince: number | null = null;
    let heartbeatsSent = 0;
    let ended = false;

    // Fold the time since the page last became visible into `activeMs`.
    const settle = () => {
      if (visibleSince === null) return;
      const now = Date.now();
      activeMs += now - visibleSince;
      visibleSince = now;
    };

    const end = () => {
      if (ended) return;
      settle();
      ended = true;
      trackEvent("session_end", { length: lengthBucket(activeMs / 1000) });
    };

    const begin = () => {
      activeMs = 0;
      heartbeatsSent = 0;
      ended = false;
      visibleSince = document.visibilityState === "visible" ? Date.now() : null;
      hiddenSince = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        settle();
        visibleSince = null;
        hiddenSince = Date.now();
        return;
      }
      const away = hiddenSince === null ? 0 : Date.now() - hiddenSince;
      hiddenSince = null;
      if (away > NEW_SESSION_AFTER_MS) {
        end();
        begin();
      } else {
        visibleSince = Date.now();
      }
    };

    const onPageHide = () => end();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) begin();
    };

    // Checked twice a minute; the heartbeat itself is every 5 minutes of
    // visible time, however many ticks that takes.
    const tick = setInterval(() => {
      settle();
      const due = Math.floor(activeMs / HEARTBEAT_MS);
      while (heartbeatsSent < due) {
        heartbeatsSent += 1;
        trackEvent("session_5min");
      }
    }, 30 * 1000);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
