"use client";

import { useEffect, useRef } from "react";
import { usePreferences } from "@/hooks/usePreferences";

/**
 * Invisible component that scrolls to the correct section once on page load,
 * based on the user's saved "Launch screen" preference.
 *
 * Rendered in the home page (app/page.tsx) so it only fires on the home route.
 * The small delay lets layout settle before the scroll fires.
 */
export default function LaunchScrollHandler() {
  const { prefs, isHydrated } = usePreferences();
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasScrolledRef.current) return;
    hasScrolledRef.current = true;

    if (prefs.launchScreen === "library") {
      setTimeout(() => {
        document.getElementById("library")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else if (prefs.launchScreen === "lastPlayed") {
      setTimeout(() => {
        document.getElementById("player")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
    // "home" → no scroll, stay at top
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  return null;
}
