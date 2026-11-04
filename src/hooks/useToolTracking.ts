"use client";

import { useEffect, useRef } from "react";
import {
  HEARTBEAT_MS,
  lengthBucket,
  toolEventName,
  trackEvent,
  type ToolId,
  type ToolPhase,
} from "@/lib/analytics";
import { logPlay } from "@/lib/supabase";
import { getVisitor } from "@/lib/visitor";

interface ActiveRun {
  item: string;
  startedAt: number;
  heartbeat: ReturnType<typeof setInterval>;
}

type EventProps = Record<string, string | number | boolean | null>;

// Every phase goes out twice: as the roll-up row (tool_start) and as the
// per-item row (binaural_focus_start). Same properties on both.
function send(tool: ToolId, item: string, phase: ToolPhase, props: EventProps) {
  trackEvent(`tool_${phase}`, props);
  trackEvent(toolEventName(tool, item, phase), props);
}

function endRun(tool: ToolId, current: ActiveRun) {
  clearInterval(current.heartbeat);
  const seconds = (Date.now() - current.startedAt) / 1000;
  send(tool, current.item, "stop", { tool, length: lengthBucket(seconds) });
  // Runs shorter than a few seconds are taps, not listening.
  const visitor = getVisitor();
  if (visitor && seconds >= 5) void logPlay(visitor.id, tool, current.item, seconds);
}

/**
 * Reports one tool's usage to analytics.
 *
 * Call it once in the component that owns the tool's playing/running state:
 *
 *   useToolTracking("binaural", track?.name, isPlaying);
 *
 * Behaviour:
 *   - `isActive` false → true   sends *_start { tool, item }
 *   - every 5 minutes active    sends *_5min  { tool, item }
 *   - `isActive` true → false   sends *_stop  { tool, length }
 *   - the component unmounting, or the page being closed, also sends *_stop
 *     so runs that end by navigating away are still counted
 *
 * `item` is the label shown to the person (track name, noise, voice, preset,
 * narrator). It is read when the run starts; changing it mid-run (a voice
 * toggle, a frequency nudge) does not create extra events.
 *
 * Audio in CRUX keeps playing with the screen off, so a hidden tab does NOT
 * count as a stop. Only `pagehide` (close / navigate away) flushes early.
 */
export function useToolTracking(
  tool: ToolId,
  item: string | null | undefined,
  isActive: boolean,
): void {
  const run = useRef<ActiveRun | null>(null);
  // Latest props for listeners that are bound once.
  const latest = useRef({ item, isActive });
  latest.current = { item, isActive };

  useEffect(() => {
    const start = () => {
      if (run.current) return;
      const label = latest.current.item ?? "unknown";
      send(tool, label, "start", { tool, item: label });
      run.current = {
        item: label,
        startedAt: Date.now(),
        heartbeat: setInterval(() => {
          send(tool, label, "5min", { tool, item: label });
        }, HEARTBEAT_MS),
      };
    };

    const stop = () => {
      const current = run.current;
      if (!current) return;
      run.current = null;
      endRun(tool, current);
    };

    if (isActive) start();
    else stop();

    // Page closed or navigated away while active: count it as a stop now,
    // because there may be no later chance to send anything.
    const onPageHide = () => stop();
    // Restored from the back/forward cache while still active: begin a fresh
    // run so the rest of the session is counted too.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && latest.current.isActive) start();
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [tool, isActive]);

  // Unmount while active (e.g. switching breathing tabs) counts as a stop.
  useEffect(() => {
    return () => {
      const current = run.current;
      if (!current) return;
      run.current = null;
      endRun(tool, current);
    };
  }, [tool]);
}
