import type { NavIconName } from "@/components/NavIcons";

/**
 * The library: every tool, page and outside site that CRUX can send a person
 * to. One list feeds the home screen, the sidebar and drawer (through
 * `nav.ts`) and the Ask CRUX guide, so adding a feature is one entry here.
 *
 * To add content from another specialty, add a `Feature` with `shelf: "care"`
 * (or a new shelf below), an `href`, and `provider` set to who supplied it.
 * Health content that a clinician has not finished reviewing must carry
 * `status: "in-review"`: it is then shown on the "In review" shelf with a
 * draft label, and the guide never suggests it.
 */

export type ShelfId = "calm" | "understand" | "connect" | "care" | "everyday" | "review" | "dock";

/** Colour of a feature's icon tile. `accent` follows the theme; the rest are fixed. */
export type TileTint = "accent" | "blue" | "teal" | "plum" | "ochre" | "slate";

export interface Feature {
  /** Stable id: used by analytics and by the guide. Never reuse or rename. */
  id: string;
  label: string;
  /** A path inside CRUX, or a full address for a separate site. */
  href: string;
  icon: NavIconName;
  /** One short line: shown in the list view, the drawer and the guide's cards. */
  tagline: string;
  /** What it is and who it is for, in a sentence or two. Read by the guide. */
  about: string;
  shelf: ShelfId;
  /** True when it opens a separate site in a new tab. */
  external?: boolean;
  /** Who supplied it, when that is not CRUX itself. Shown next to the feature. */
  provider?: string;
  /** Health content still waiting on a clinician's review. */
  status?: "in-review";
  /** The separate site has its own AI assistant. Shown so nobody is surprised. */
  hasAssistant?: boolean;
}

export interface Shelf {
  id: ShelfId;
  title: string;
  blurb: string;
  tint: TileTint;
}

/** Shelves in the order the home screen shows them. The dock is drawn apart. */
export const SHELVES: Shelf[] = [
  { id: "calm",       title: "Calm",       blurb: "Sound and breathing to settle your body",          tint: "accent" },
  { id: "understand", title: "Understand", blurb: "What is going on, and what the options are",       tint: "blue" },
  { id: "connect",    title: "Connect",    blurb: "Other people who get it",                          tint: "teal" },
  { id: "care",       title: "More care",  blurb: "Other areas of health, from other specialties",    tint: "plum" },
  { id: "everyday",   title: "Everyday",   blurb: "Practical tools for day-to-day life",              tint: "ochre" },
  { id: "review",     title: "In review",  blurb: "Drafts. A doctor has not finished checking these", tint: "slate" },
];

export const DOCK_TINT: TileTint = "slate";

export const FEATURES: Feature[] = [
  // ── Calm: the four audio tools ─────────────────────────────────────────────
  {
    id: "binaural",
    label: "Binaural Beats",
    href: "/binaural",
    icon: "headphones",
    tagline: "Sessions for focus, calm and sleep",
    about:
      "Audio sessions that play a slightly different tone in each ear. People use them to wind down, to focus, or to ease into sleep. Needs headphones.",
    shelf: "calm",
  },
  {
    id: "noise",
    label: "Noise Therapy",
    href: "/noise",
    icon: "waves",
    tagline: "Steady sound to settle the alarm",
    about:
      "Steady background sound: white, pink, brown and green noise, heavy rain, ocean waves and running water, plus an adjustable pure tone that some people with tinnitus use to mask ringing in the ears. Keeps playing with the screen off.",
    shelf: "calm",
  },
  {
    id: "breathe",
    label: "Breathing",
    href: "/breathe",
    icon: "wind",
    tagline: "Box breathing and coherence",
    about:
      "Two guided breathing exercises with a voice and a moving pacer: box breathing (in, hold, out, hold, four counts each) and slower heart and brain coherence breathing. A few minutes is enough, and it can be done anywhere.",
    shelf: "calm",
  },
  {
    id: "body-scan",
    label: "Body Scan",
    href: "/body-scan",
    icon: "body",
    tagline: "Guided, head to toe",
    about:
      "A narrated relaxation that moves attention slowly from head to toe, releasing tension along the way. Done lying down or sitting. Often used before sleep.",
    shelf: "calm",
  },

  // ── Understand ─────────────────────────────────────────────────────────────
  {
    id: "brain",
    label: "Your Brain",
    href: "/brain",
    icon: "brain",
    tagline: "What the loop is and why it feels this way",
    about:
      "A plain-language explainer, written with a doctor, of the stress loop: why the body stays on alert after danger has passed, and how sound and breathing interrupt it. Ends with a short quiz.",
    shelf: "understand",
  },
  {
    id: "instructions",
    label: "Instructions",
    href: "/instructions",
    icon: "book",
    tagline: "How to use each tool",
    about:
      "How to use each tool, a wind-down routine for before sleep, how to save CRUX to a phone, and safety information.",
    shelf: "understand",
  },
  {
    id: "treatment-guides",
    label: "Treatment Guides",
    href: "https://community-treatment-platform.vercel.app/",
    icon: "compass",
    tagline: "PTSD, pain, sleep and more, explained",
    about:
      "The Community Treatment Platform: guides for veterans, first responders and their clinicians on PTSD, alcohol and drug use, depression, moral injury, chronic pain, teeth grinding and sleep apnoea, and sexual dysfunction. Each has a plain-language view and a clinician view, and explains how DVA cards and referrals fit in. Information only.",
    shelf: "understand",
    external: true,
  },

  // ── Connect ────────────────────────────────────────────────────────────────
  {
    id: "room",
    label: "The Room",
    href: "/room",
    icon: "chat",
    tagline: "Say hello to whoever is up",
    about:
      "A live, anonymous chat room for whoever is awake. No accounts, and nothing is kept past 24 hours. It is company, not counselling.",
    shelf: "connect",
  },

  // ── More care: content from other specialties ──────────────────────────────
  {
    id: "ibd-compass",
    label: "IBD Compass",
    href: "https://ibd-compass.vercel.app/",
    icon: "leaf",
    tagline: "Living with Crohn's disease or colitis",
    about:
      "For people living with Crohn's disease or ulcerative colitis, and their families and carers: treatments and diets with evidence labels, research summaries, and a builder for questions to take to a specialist. Information only.",
    shelf: "care",
    external: true,
    hasAssistant: true,
  },

  // ── Everyday ───────────────────────────────────────────────────────────────
  {
    id: "bill-toolkit",
    label: "Bill Toolkit",
    href: "https://seniors-bill-tracker.vercel.app/",
    icon: "receipt",
    tagline: "Large-print bill list and calendar",
    about:
      "A large-print bill list, calendar and printable history of paid bills, made for seniors keeping on top of household bills. Everything stays on the person's own device.",
    shelf: "everyday",
    external: true,
  },

  // ── In review: drafts a clinician has not finished checking ────────────────
  {
    id: "ibs-compass",
    label: "IBS Compass",
    href: "https://ibs-compass-nine.vercel.app/",
    icon: "leaf",
    tagline: "Irritable bowel syndrome",
    about: "Information for people with irritable bowel syndrome. A draft that is still waiting on clinical review.",
    shelf: "review",
    external: true,
    status: "in-review",
    hasAssistant: true,
  },
  {
    id: "spectrum-compass",
    label: "Spectrum Compass",
    href: "https://spectrum-compass.vercel.app/",
    icon: "family",
    tagline: "For parents of children with autism or ADHD",
    about: "Information and calming tools for parents of children with autism or ADHD. A draft that is still waiting on a doctor's review.",
    shelf: "review",
    external: true,
    status: "in-review",
    hasAssistant: true,
  },

  // ── Dock: always within reach ──────────────────────────────────────────────
  {
    id: "ask",
    label: "Ask CRUX",
    href: "/ask",
    icon: "search",
    tagline: "Say what you need and it points the way",
    about: "The guide itself: a chat that points people to the right tool or page.",
    shelf: "dock",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: "settings",
    tagline: "Colours, brightness and defaults",
    about:
      "Colour theme, screen brightness (dim, default, bright), default sound and volume, and which screen CRUX opens on.",
    shelf: "dock",
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    icon: "info",
    tagline: "Who makes CRUX and why",
    about: "Who makes CRUX, why it is free, and how to support it.",
    shelf: "dock",
  },
];

const BY_ID = new Map(FEATURES.map((f) => [f.id, f]));

/** The feature with this id. Throws on an unknown id, so a typo fails the build. */
export function feature(id: string): Feature {
  const found = BY_ID.get(id);
  if (!found) throw new Error(`Unknown library feature: ${id}`);
  return found;
}

/** The feature with this id, or undefined. For ids that arrive from outside. */
export function findFeature(id: string): Feature | undefined {
  return BY_ID.get(id);
}

export function featuresOn(shelf: ShelfId): Feature[] {
  return FEATURES.filter((f) => f.shelf === shelf);
}

/** What the guide may suggest: everything reviewed, apart from the guide itself. */
export const GUIDE_FEATURES: Feature[] = FEATURES.filter(
  (f) => f.status !== "in-review" && f.id !== "ask",
);
