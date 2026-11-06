"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FeatureApp, FeatureRow, FeatureWidget } from "@/components/FeatureTile";
import NavIcon from "@/components/NavIcons";
import { trackEvent } from "@/lib/analytics";
import { GUIDE_LIMITS, GUIDE_STARTERS } from "@/lib/guide";
import { guideSession } from "@/lib/guideSession";
import { SHELVES, featuresOn } from "@/lib/library";

/**
 * The home screen: a tablet-style library. Inside the "screen" there is a
 * status row, an ask bar that hands the question to the guide, the Calm tools
 * as widgets, every other shelf as app icons, and a dock along the bottom.
 * Everything drawn here comes from `src/lib/library.ts`.
 *
 * "List" swaps the icons for rows with a line of description each, for anyone
 * who would rather read than recognise icons. The choice is remembered on the
 * device.
 */

type View = "icons" | "list";
const VIEW_KEY = "crux:libraryView";

// The home screen shows the three shortest starters; the Ask page shows all.
const HOME_STARTERS = GUIDE_STARTERS.slice(0, 3);

function useClock(): Date | null {
  // Null until mounted, so the server and the first client render agree.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

export default function LibraryHome() {
  const router = useRouter();
  const now = useClock();
  const [question, setQuestion] = useState("");
  const [view, setView] = useState<View>("icons");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(VIEW_KEY) === "list") setView("list");
    } catch {
      // No storage: icons it is.
    }
  }, []);

  const chooseView = (next: View) => {
    setView(next);
    trackEvent("library_view", { view: next });
    try {
      window.localStorage.setItem(VIEW_KEY, next);
    } catch {
      // Not remembered, still applied.
    }
  };

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (trimmed) guideSession.ask(trimmed.slice(0, GUIDE_LIMITS.messageChars));
    router.push("/ask");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  const calm = featuresOn("calm");
  const dock = featuresOn("dock");
  const shelves = SHELVES.filter((s) => s.id !== "calm")
    .map((shelf) => ({ shelf, items: featuresOn(shelf.id) }))
    .filter((s) => s.items.length > 0);
  const calmShelf = SHELVES.find((s) => s.id === "calm");

  return (
    <div className="mx-auto max-w-[1150px] px-4 pb-16 sm:px-5">
      {/* Greeting */}
      <section id="hero" className="pt-7 text-center md:pt-12">
        <span className="eyebrow">Free · No accounts · Made for veterans</span>
        <h1 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-4xl md:mt-5 md:text-5xl">
          Always remember to be <span className="text-brand-gradient">kind to yourself</span>.
        </h1>
      </section>

      {/* The tablet */}
      <section
        aria-label="Library"
        className="card mt-8 rounded-[2rem] p-4 sm:p-6 md:mt-10 md:p-8"
        style={{
          boxShadow:
            "0 0 0 6px var(--surface-solid), 0 0 0 7px var(--border-color), 0 30px 80px -30px rgba(0,0,0,0.8)",
        }}
      >
        {/* Status row */}
        <div className="flex min-h-11 items-center justify-between gap-3">
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            {now ? (
              <>
                {now.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
                <span className="ml-2 font-normal text-[var(--text-secondary)]">
                  {now.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                </span>
              </>
            ) : (
              <span className="sr-only">Library</span>
            )}
          </p>
          <div role="group" aria-label="Show the library as" className="flex shrink-0 rounded-full border border-[var(--border-color)] p-1">
            {(["icons", "list"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => chooseView(option)}
                aria-pressed={view === option}
                className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
                  view === option
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <NavIcon name={option === "icons" ? "grid" : "list"} className="h-4 w-4" />
                {option === "icons" ? "Icons" : "List"}
              </button>
            ))}
          </div>
        </div>

        {/* Ask bar: hands the question to the guide */}
        <form onSubmit={onSubmit} action="/ask" className="mx-auto mt-4 max-w-2xl">
          <label htmlFor="home-ask" className="block text-center text-[18px] font-semibold text-[var(--text-primary)]">
            What do you need right now?
          </label>
          <div className="mt-3 flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--surface-solid)] py-1.5 pl-4 pr-1.5 focus-within:border-[var(--primary)] sm:pl-5">
            <NavIcon name="search" className="h-5 w-5 shrink-0 text-[var(--text-secondary)]" />
            <input
              id="home-ask"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={GUIDE_LIMITS.messageChars}
              autoComplete="off"
              enterKeyHint="send"
              placeholder="Say it in your own words"
              className="min-w-0 grow bg-transparent py-2.5 text-[16px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
            />
            <button type="submit" className="btn-primary min-h-11 shrink-0 px-5 py-2">
              Ask
            </button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {HOME_STARTERS.map((starter) => (
              <button key={starter} type="button" onClick={() => ask(starter)} className="btn-ghost min-h-11">
                {starter}
              </button>
            ))}
          </div>
        </form>

        {/* Calm: the four tools, as widgets */}
        {calmShelf && (
          <section aria-labelledby="shelf-calm" className="mt-8">
            <ShelfHeading id="shelf-calm" title={calmShelf.title} blurb={calmShelf.blurb} />
            <div className={view === "icons" ? "mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4" : "mt-4 grid gap-3 md:grid-cols-2"}>
              {calm.map((f) =>
                view === "icons" ? (
                  <FeatureWidget key={f.id} feature={f} from="home" />
                ) : (
                  <FeatureRow key={f.id} feature={f} from="home" />
                ),
              )}
            </div>
          </section>
        )}

        {/* Every other shelf */}
        <div className={view === "icons" ? "mt-9 grid gap-x-10 gap-y-9 md:grid-cols-2 xl:grid-cols-3" : "mt-9 flex flex-col gap-9"}>
          {shelves.map(({ shelf, items }) => (
            <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`}>
              <ShelfHeading id={`shelf-${shelf.id}`} title={shelf.title} blurb={shelf.blurb} />
              {view === "icons" ? (
                <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-4">
                  {items.map((f) => (
                    <FeatureApp key={f.id} feature={f} from="home" />
                  ))}
                </div>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {items.map((f) => (
                    <FeatureRow key={f.id} feature={f} from="home" />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Dock */}
        <nav aria-label="Dock" className="mt-10 flex justify-center">
          {view === "icons" ? (
            <div className="grid w-full max-w-md grid-cols-3 gap-x-2 rounded-[1.75rem] border border-[var(--border-color)] bg-[var(--surface-solid)] px-3 py-2">
              {dock.map((f) => (
                <FeatureApp key={f.id} feature={f} from="home" />
              ))}
            </div>
          ) : (
            <div className="grid w-full gap-3 md:grid-cols-2">
              {dock.map((f) => (
                <FeatureRow key={f.id} feature={f} from="home" />
              ))}
            </div>
          )}
        </nav>
      </section>

      {/* Closing affirmation: a quiet bookend to the greeting at the top */}
      <p className="mx-auto max-w-[600px] px-4 pt-12 text-center text-base font-light italic text-[var(--text-secondary)] text-balance">
        You&apos;re right where you&apos;re supposed to be.
      </p>
    </div>
  );
}

function ShelfHeading({ id, title, blurb }: { id: string; title: string; blurb: string }) {
  return (
    <div>
      <h2 id={id} className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-1.5 text-[14px] leading-snug text-[var(--text-secondary)]">{blurb}</p>
    </div>
  );
}
