"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { tracks } from "@/data/tracks";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import BinauralPlayer from "./BinauralPlayer";
import BreathingHost from "./BreathingHost";
import BodyScan from "./BodyScan";
import NoiseGenerator from "./NoiseGenerator";
import NowPlayingBar, { type NowPlaying } from "./NowPlayingBar";

/**
 * The four audio tools live here, inside the root layout, so moving between
 * pages never unmounts them: a track, a noise or a guided session keeps playing
 * while you read Your Brain or chat in the room.
 *
 * Each tool is mounted the first time its page is opened (so canvases and
 * carousels measure themselves while visible) and then kept, hidden, for the
 * rest of the visit. The page files under `src/app/<tool>/` only carry the
 * route and its metadata; what you see on them is rendered from here.
 *
 * Because the tools stay in the page while hidden, an `id` inside a tool must
 * not be reused anywhere else in the app. A link such as
 * `/instructions#body-scan` goes to the first element with that id, and a
 * hidden tool comes first: the page then does not scroll, and the pages opened
 * after it stop scrolling to the top. Tool sections use ids ending in `-tool`.
 */

const TOOL_ROUTES = ["/binaural", "/noise", "/breathe", "/body-scan"] as const;
type ToolRoute = (typeof TOOL_ROUTES)[number];

function asToolRoute(pathname: string): ToolRoute | null {
  return (TOOL_ROUTES as readonly string[]).includes(pathname) ? (pathname as ToolRoute) : null;
}

export default function ToolStage() {
  const pathname = usePathname();
  const current = asToolRoute(pathname);

  // The binaural engine is owned here so it outlives every page.
  const engine = useAudioEngine();
  const track = tracks[engine.currentTrackIndex];
  useToolTracking("binaural", track?.name, engine.isPlaying);

  // Routes visited so far: a tool mounts on its first visit and stays mounted.
  const [visited, setVisited] = useState<ToolRoute[]>(() => (current ? [current] : []));
  useEffect(() => {
    if (current && !visited.includes(current)) setVisited((v) => [...v, current]);
  }, [current, visited]);
  const mounted = useMemo(
    () => new Set<ToolRoute>(current ? [...visited, current] : visited),
    [visited, current],
  );

  // What is running, for the now-playing bar.
  const [noise, setNoise] = useState<string | null>(null);
  const [breathing, setBreathing] = useState(false);
  const [bodyScan, setBodyScan] = useState(false);
  const onNoise = useCallback((sound: string | null) => setNoise(sound), []);
  const onBreathing = useCallback((running: boolean) => setBreathing(running), []);
  const onBodyScan = useCallback((running: boolean) => setBodyScan(running), []);

  const playing: NowPlaying = {
    binaural: engine.isPlaying ? track?.name ?? "Binaural beat" : null,
    noise,
    breathing,
    bodyScan,
  };

  const show = (route: ToolRoute) => current === route;

  return (
    <>
      {mounted.has("/binaural") && (
        <div hidden={!show("/binaural")} className="max-w-[1400px] mx-auto px-5">
          <BinauralPlayer engine={engine} />
        </div>
      )}
      {mounted.has("/noise") && (
        <div hidden={!show("/noise")} className="max-w-[1400px] mx-auto px-5 pt-8">
          <NoiseGenerator isAudioPlaying={engine.isPlaying} onActiveChange={onNoise} />
        </div>
      )}
      {mounted.has("/breathe") && (
        <div hidden={!show("/breathe")} className="max-w-[1400px] mx-auto px-5">
          <BreathingHost onRunningChange={onBreathing} />
        </div>
      )}
      {mounted.has("/body-scan") && (
        <div hidden={!show("/body-scan")} className="max-w-[1400px] mx-auto px-5 pt-8">
          <BodyScan onRunningChange={onBodyScan} />
        </div>
      )}
      <NowPlayingBar pathname={pathname} playing={playing} />
    </>
  );
}
