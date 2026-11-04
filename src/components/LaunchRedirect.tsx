"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePreferences, type Preferences } from "@/hooks/usePreferences";

/** Where each "Launch screen" setting opens. */
export const LAUNCH_ROUTES: Record<Preferences["launchScreen"], string> = {
  "home":          "/",
  "player":        "/binaural",
  "noise":         "/noise",
  "box-breathing": "/breathe",
  "body-scan":     "/body-scan",
};

const SESSION_KEY = "crux:launched";

/**
 * Rendered on the home page only. On the first page view of a browser session
 * it sends the person to their chosen launch screen; coming back to Home later
 * in the same session stays on Home.
 */
export default function LaunchRedirect() {
  const router = useRouter();
  const { prefs, isHydrated } = usePreferences();
  const done = useRef(false);

  useEffect(() => {
    if (!isHydrated || done.current) return;
    done.current = true;

    let launched = false;
    try {
      launched = window.sessionStorage.getItem(SESSION_KEY) === "1";
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // No session storage: treat every load as the first.
    }
    if (launched) return;

    const target = LAUNCH_ROUTES[prefs.launchScreen] ?? "/";
    if (target !== "/") router.replace(target);
  }, [isHydrated, prefs.launchScreen, router]);

  return null;
}
