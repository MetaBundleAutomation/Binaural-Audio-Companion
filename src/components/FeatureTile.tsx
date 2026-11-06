"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import NavIcon from "@/components/NavIcons";
import { trackEvent } from "@/lib/analytics";
import { DOCK_TINT, SHELVES, type Feature, type TileTint } from "@/lib/library";

/**
 * The pieces a library feature is drawn with: its coloured icon tile, an
 * app-style icon with a label (home screen), a widget (the Calm tools) and a
 * row (list view and the guide's answers).
 *
 * Tile colours: the accent tile follows the theme. The others are fixed deep
 * tones with a white glyph, each measured at 5:1 or better against white, so
 * the glyph stays clear in every theme and brightness level. Labels are never
 * drawn on a coloured tile: they sit on the panel in the normal text colour.
 */
const TINTS: Record<TileTint, CSSProperties> = {
  accent: { background: "var(--btn-primary-bg)", color: "var(--on-accent)" },
  blue:   { background: "linear-gradient(160deg, #3C5AA8, #2A3F7A)", color: "#fff" },
  teal:   { background: "linear-gradient(160deg, #1F7A80, #155A60)", color: "#fff" },
  plum:   { background: "linear-gradient(160deg, #7A4A8C, #593468)", color: "#fff" },
  ochre:  { background: "linear-gradient(160deg, #8A6420, #654812)", color: "#fff" },
  slate:  { background: "var(--surface-solid)", color: "var(--text-primary)", border: "1px solid var(--border-color)" },
};

function tintFor(feature: Feature): TileTint {
  return SHELVES.find((s) => s.id === feature.shelf)?.tint ?? DOCK_TINT;
}

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

/** Where a feature was opened from, for the usage numbers. */
export type OpenedFrom = "home" | "ask" | "guides";

/** A link to a feature: in-app pages route normally, separate sites open in a new tab. */
export function FeatureLink({
  feature,
  from,
  className,
  children,
}: {
  feature: Feature;
  from: OpenedFrom;
  className?: string;
  children: ReactNode;
}) {
  const onClick = () => trackEvent("library_open", { item: feature.id, from });
  if (feature.external) {
    return (
      <a href={feature.href} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={feature.href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/** The rounded, coloured square with the feature's glyph. */
export function FeatureIcon({ feature, size = "md" }: { feature: Feature; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-16 w-16 rounded-[1.15rem]" : "h-12 w-12 rounded-2xl";
  const glyph = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <span
      className={`grid shrink-0 place-items-center shadow-[0_10px_24px_-12px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.18)] ${box}`}
      style={TINTS[tintFor(feature)]}
      aria-hidden="true"
    >
      <NavIcon name={feature.icon} className={glyph} />
    </span>
  );
}

/** What a person should know before opening it: separate site, own AI, draft, who supplied it. */
export function featureNotes(feature: Feature): string[] {
  return [
    feature.status === "in-review" ? "Draft, not yet checked by a doctor" : null,
    feature.external ? "Opens a separate site" : null,
    feature.hasAssistant ? "Has its own AI assistant" : null,
    feature.provider ? `Provided by ${feature.provider}` : null,
  ].filter((note): note is string => note !== null);
}

/** Home-screen icon: tile above, label below. `compact` is the dock, four across. */
export function FeatureApp({
  feature,
  from,
  compact = false,
}: {
  feature: Feature;
  from: OpenedFrom;
  compact?: boolean;
}) {
  const notes = featureNotes(feature);
  return (
    <FeatureLink
      feature={feature}
      from={from}
      className={`group flex flex-col items-center gap-2 rounded-2xl px-1 py-2 text-center ${FOCUS}`}
    >
      <span className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
        <FeatureIcon feature={feature} size={compact ? "md" : "lg"} />
        {feature.external && (
          <span
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-[var(--border-color)] bg-[var(--surface-solid)] text-[var(--text-primary)]"
            aria-hidden="true"
          >
            <NavIcon name="external" className="h-3.5 w-3.5" />
          </span>
        )}
      </span>
      <span className={`font-semibold leading-tight text-[var(--text-primary)] ${compact ? "text-[13px]" : "text-[14px]"}`}>
        {feature.label}
      </span>
      {feature.status === "in-review" && (
        <span className="rounded-full border border-[var(--border-color)] px-2 py-0.5 text-[12px] font-semibold leading-none text-[var(--text-primary)]">
          Draft
        </span>
      )}
      <span className="sr-only">
        . {feature.tagline}. {notes.join(". ")}
      </span>
    </FeatureLink>
  );
}

/** Widget: a larger tile with the tagline on it, used for the Calm tools. */
export function FeatureWidget({ feature, from }: { feature: Feature; from: OpenedFrom }) {
  return (
    <FeatureLink
      feature={feature}
      from={from}
      className={`card card-hover flex flex-col gap-3 p-4 sm:p-5 ${FOCUS}`}
    >
      <FeatureIcon feature={feature} />
      <span>
        <span className="block text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
          {feature.label}
        </span>
        <span className="mt-1 block text-[14px] leading-snug text-[var(--text-secondary)]">
          {feature.tagline}
        </span>
      </span>
    </FeatureLink>
  );
}

/** Row: icon, label, tagline and notes. Used by the list view and the guide. */
export function FeatureRow({ feature, from }: { feature: Feature; from: OpenedFrom }) {
  const notes = featureNotes(feature);
  return (
    <FeatureLink
      feature={feature}
      from={from}
      className={`card card-hover flex items-center gap-4 p-4 ${FOCUS}`}
    >
      <FeatureIcon feature={feature} />
      <span className="min-w-0 grow">
        <span className="block text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
          {feature.label}
        </span>
        <span className="block text-[14px] leading-snug text-[var(--text-secondary)]">
          {feature.tagline}
        </span>
        {notes.length > 0 && (
          <span className="mt-1 block text-[12px] font-semibold leading-snug text-[var(--text-secondary)]">
            {notes.join(" · ")}
          </span>
        )}
      </span>
      <NavIcon
        name={feature.external ? "external" : "arrow"}
        className="h-4 w-4 shrink-0 text-[var(--accent-2)]"
      />
    </FeatureLink>
  );
}
