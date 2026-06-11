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

    const sectionId =
      prefs.launchScreen === "player"       ? "player"       :
      prefs.launchScreen === "noise"        ? "noise"        :
      prefs.launchScreen === "box-breathing"? "box-breathing":
      null;
    if (sectionId) {
      const timer = setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 150);
      return () => clearTimeout(timer);
    }
    // "home" → no scroll, stay at top
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  return null;
}
