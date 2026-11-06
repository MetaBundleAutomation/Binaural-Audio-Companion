import { GUIDE_FEATURES, type Feature } from "@/lib/library";

/**
 * Ask CRUX: the guide that points a person to the right tool or page.
 *
 * It works in two ways and this file is shared by both:
 *   - On the device. `localAnswer()` matches the person's words against a small
 *     table of needs. Nothing leaves the phone, and it works offline. This is
 *     what runs when no AI key is set, when the network is down, or when the
 *     AI call fails.
 *   - With AI. When ANTHROPIC_API_KEY is set on the server, `/api/guide` asks
 *     Claude to choose from the same library (see `guidePrompt.ts`).
 *
 * Either way the guide is a signpost, not a clinician: it only ever points to
 * things in the library, and `screenCrisis()` runs first on every message so a
 * person in danger sees the crisis numbers straight away, with no network call.
 */

export interface GuideTurn {
  role: "user" | "guide";
  text: string;
}

export interface GuideAnswer {
  reply: string;
  /** Library feature ids, most helpful first. */
  featureIds: string[];
  /** True when the crisis numbers should be shown with this answer. */
  crisis: boolean;
  /** True when it reads like a medical emergency: 000 is then shown first. */
  emergency?: boolean;
  /** Where the answer came from: the AI service, or the matcher on this device. */
  source: "ai" | "device";
}

export const GUIDE_LIMITS = {
  /** Longest message a person can send. */
  messageChars: 500,
  /** How many past turns are sent with a question. */
  turns: 10,
  /** Most features one answer may suggest. */
  picks: 3,
  /** Longest reply shown, as a guard on the AI's output. */
  replyChars: 700,
} as const;

// The Room needs Supabase. This repeats the check in `supabase.ts` on purpose:
// importing that file here would add the whole Supabase client to the home page.
const ROOM_IS_OPEN = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/** The features the guide may suggest right now. The Room is left out until it is switched on. */
export function guideFeatures(): Feature[] {
  return GUIDE_FEATURES.filter((f) => f.id !== "room" || ROOM_IS_OPEN);
}

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Crisis screen ────────────────────────────────────────────────────────────
// Deliberately broad. A false alarm costs one extra line and three phone
// numbers; a miss could cost far more.
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid/,
  /\bkill(?:ing)? (?:myself|my self|him|her|them|someone|somebody|everyone)\b/,
  /\bend(?:ing)? (?:my (?:own )?life|it all)\b/,
  /\btak(?:e|ing) my (?:own )?life\b/,
  /\b(?:want|wanna|wish|going|gonna|ready|plan|planning) (?:to )?(?:die|be dead)\b/,
  /\bwish i (?:was|were) dead\b/,
  /\bbetter off (?:dead|without me)\b/,
  /\b(?:don't|dont|do not) (?:want|wanna) (?:to )?(?:be here|live|be alive|wake up|go on)\b/,
  /\bno (?:reason|point) (?:to|in) (?:live|living|go on|going on|carry on|carrying on)\b/,
  /\b(?:can't|cant|cannot) (?:go on|keep going|do this anymore|do this any more|take (?:it|this) (?:anymore|any more))\b/,
  /\b(?:not|isn't|isnt) worth living\b/,
  /\bself[- ]?harm/,
  /\b(?:hurt|hurting|harm|harming|cut|cutting) myself\b/,
  /\boverdos/,
  /\b(?:hurt|harm|kill|shoot|stab)(?:ing)? (?:him|her|them|someone|somebody|my (?:wife|husband|partner|kid|kids|family))\b/,
];

/** True when the message suggests the person, or someone else, may be in danger. */
export function screenCrisis(text: string): boolean {
  const t = normalise(text);
  return CRISIS_PATTERNS.some((pattern) => pattern.test(t));
}

export const CRISIS_REPLY =
  "Thank you for telling me. You deserve to talk to a person right now, not an app. Open Arms answers day and night for veterans and families, and Lifeline is there for anyone. If you are in immediate danger, call 000.";

export function crisisAnswer(source: GuideAnswer["source"]): GuideAnswer {
  return { reply: CRISIS_REPLY, featureIds: [], crisis: true, source };
}

// ── Medical emergency screen ─────────────────────────────────────────────────
// Things a relaxation app must never answer with a breathing exercise.
const EMERGENCY_PATTERNS: RegExp[] = [
  /\bchest pains?\b/,
  /\b(?:having|had|has had|is having|just had|think i'm having|think im having) (?:a |another )?(?:seizure|fit|stroke|heart attack)\b/,
  /\b(?:can't|cant|cannot|struggling to|trouble|hard to) breath(?:e|ing)\b/,
  /\b(?:bleeding (?:heavily|badly|a lot|out)|(?:won't|wont|will not) stop bleeding)\b/,
  /\bunconscious\b/,
  /\b(?:passed|passing|blacked|blacking) out\b/,
  /\b(?:collapsed|choking|anaphyla)/,
  /\bnot (?:breathing|responding|waking up)\b/,
];

/** True when the message reads like a medical emergency. */
export function screenEmergency(text: string): boolean {
  const t = normalise(text);
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(t));
}

export const EMERGENCY_REPLY =
  "That could be a medical emergency, and it is not something an app should handle. Call 000 now, or ask someone near you to call.";

export function emergencyAnswer(source: GuideAnswer["source"]): GuideAnswer {
  return { reply: EMERGENCY_REPLY, featureIds: [], crisis: true, emergency: true, source };
}

/** The safety answer for this message, if it needs one. Checked before anything else. */
export function safetyAnswer(text: string, source: GuideAnswer["source"]): GuideAnswer | null {
  if (screenCrisis(text)) return crisisAnswer(source);
  if (screenEmergency(text)) return emergencyAnswer(source);
  return null;
}

// ── On-device matcher ────────────────────────────────────────────────────────

interface Need {
  /** Words and short phrases that signal this need. Matched on word edges. */
  words: string[];
  /** Feature ids to suggest, most helpful first. */
  picks: string[];
  line: string;
  /** Said in place of `line` when none of the picks is available. */
  lineWithoutPicks?: string;
}

const NEEDS: Need[] = [
  {
    words: ["sleep", "sleeping", "asleep", "insomnia", "awake", "nightmare", "nightmares", "bed", "bedtime", "tired", "exhausted", "wake", "waking", "rest", "night"],
    picks: ["body-scan", "binaural", "noise"],
    line: "For sleep, most people start with the body scan lying down, or a low steady sound left playing.",
  },
  {
    words: ["anxious", "anxiety", "panic", "panicking", "stressed", "stress", "wound up", "on edge", "angry", "anger", "rage", "furious", "racing", "overwhelmed", "hypervigilant", "jumpy", "agitated", "calm", "calm down", "settle", "relax", "worry", "worried", "nervous", "scared", "fear", "triggered", "flashback", "flashbacks", "shaking", "heart"],
    picks: ["breathe", "noise", "binaural"],
    line: "When your body is wound up, slow breathing is the quickest place to start. Steady sound can help it stay settled.",
  },
  {
    words: ["tinnitus", "ringing", "ears", "ear", "buzzing", "hissing"],
    picks: ["noise", "instructions"],
    line: "For ringing in the ears, Noise Therapy has an adjustable pure tone and steady sounds that some people use to mask it. Instructions explains how to set it up.",
  },
  {
    words: ["focus", "concentrate", "concentration", "study", "studying", "distracted", "attention", "work"],
    picks: ["binaural", "noise"],
    line: "For focus, try a Binaural Beats session with headphones, or steady noise in the background.",
  },
  {
    words: ["pain", "sore", "ache", "aching", "aches", "tension", "tense", "tight", "muscles", "back", "neck", "headache", "jaw", "grinding"],
    picks: ["body-scan", "breathe", "treatment-guides"],
    line: "The body scan and slow breathing are both about easing tension. The Treatment Guides explain what chronic pain care involves. Pain that is new or getting worse is one for your GP.",
  },
  {
    words: ["why", "understand", "ptsd", "trauma", "brain", "loop", "explain", "learn", "what is happening", "what's happening", "what's wrong", "moral injury", "alcohol", "drink", "drinking", "drunk", "booze", "grog", "drugs", "apnoea", "apnea"],
    picks: ["brain", "treatment-guides"],
    line: "Your Brain explains why the body stays on alert. The Treatment Guides cover PTSD, pain, sleep and more in plain language.",
  },
  {
    words: ["treatment", "treatments", "therapy", "medication", "medications", "medicine", "tablets", "dose", "dva", "claim", "claims", "gold card", "white card", "referral", "diagnosis", "diagnosed", "doctor", "gp", "psychologist", "psychiatrist", "specialist"],
    picks: ["treatment-guides"],
    line: "I can't advise on treatment, medication or claims. That is one for your GP or specialist. The Treatment Guides explain what the options involve, so you can go in prepared.",
  },
  {
    words: ["lonely", "alone", "talk", "someone", "chat", "company", "isolated", "nobody", "no one", "mates"],
    picks: ["room"],
    line: "The Room is a live chat with whoever is up, for company. If you need to talk to someone now, Open Arms answers day and night on 1800 011 046.",
    lineWithoutPicks: "If you need to talk to a person, Open Arms answers day and night on 1800 011 046.",
  },
  {
    words: ["sad", "down", "low", "hopeless", "numb", "empty", "crying", "grief", "grieving", "guilt", "guilty", "ashamed", "shame", "worthless", "depressed", "depression"],
    picks: ["treatment-guides", "body-scan"],
    line: "That sounds heavy. The Treatment Guides explain what help for low mood involves, and the body scan can give your body a rest. If it would help to talk to a person, Open Arms answers day and night on 1800 011 046.",
  },
  {
    words: ["instructions", "headphones", "install", "home screen", "offline", "not working", "no sound", "volume", "safe", "safety"],
    picks: ["instructions", "settings"],
    line: "Instructions covers how each tool works and how to set CRUX up on your phone.",
  },
  {
    words: ["colour", "colours", "color", "colors", "theme", "brightness", "bright", "brighter", "dim", "dimmer", "dark", "darker", "screen", "hard to read", "text size"],
    picks: ["settings"],
    line: "Settings has the colour themes and three brightness levels.",
  },
  {
    words: ["crohn", "crohn's", "crohns", "colitis", "ibd", "bowel", "gut"],
    picks: ["ibd-compass"],
    line: "IBD Compass covers Crohn's disease and colitis. It is a separate site.",
  },
  {
    words: ["bill", "bills", "budget", "rent", "electricity", "payment", "payments"],
    picks: ["bill-toolkit"],
    line: "Bill Toolkit is a large-print list and calendar for household bills. It is a separate site.",
  },
  {
    words: ["autism", "autistic", "adhd", "ibs", "irritable"],
    picks: [],
    line: "CRUX has nothing reviewed on that yet. There is a draft on the In review shelf on the home screen, waiting on a doctor's check.",
  },
  {
    words: ["who made", "who makes", "who built", "who runs", "donate", "donation"],
    picks: ["about"],
    line: "About says who makes CRUX and why it is free.",
  },
];

const NO_MATCH: GuideAnswer = {
  reply:
    "I couldn't match that to anything in CRUX. Tell me a bit more, for example whether it is sleep, feeling wound up, ringing ears, or wanting to understand what is going on. These are where most people start.",
  featureIds: ["breathe", "brain"],
  crisis: false,
  source: "device",
};

function hasWord(text: string, word: string): boolean {
  let from = 0;
  for (;;) {
    const at = text.indexOf(word, from);
    if (at === -1) return false;
    const before = at === 0 ? " " : text[at - 1];
    const after = at + word.length >= text.length ? " " : text[at + word.length];
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
    from = at + 1;
  }
}

/** Answer on the device, with no network: match the words against the needs above. */
export function localAnswer(text: string): GuideAnswer {
  const safety = safetyAnswer(text, "device");
  if (safety) return safety;

  const t = normalise(text);
  const available = new Map(guideFeatures().map((f) => [f.id, f]));

  // A feature named outright comes first.
  const named = [...available.values()].filter((f) => hasWord(t, f.label.toLowerCase())).map((f) => f.id);

  const scored = NEEDS
    .map((need) => ({ need, score: need.words.filter((w) => hasWord(t, w)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (scored.length === 0 && named.length === 0) {
    return { ...NO_MATCH, featureIds: NO_MATCH.featureIds.filter((id) => available.has(id)) };
  }

  const picks: string[] = [];
  for (const id of [...named, ...scored.flatMap((s) => s.need.picks)]) {
    if (available.has(id) && !picks.includes(id)) picks.push(id);
  }

  const lines = scored.map(({ need }) =>
    need.lineWithoutPicks && !need.picks.some((id) => available.has(id)) ? need.lineWithoutPicks : need.line,
  );
  const reply = lines.length > 0 ? lines.join(" ") : "Here it is.";
  return { reply, featureIds: picks.slice(0, GUIDE_LIMITS.picks), crisis: false, source: "device" };
}

/** Starter questions shown before the first message. */
export const GUIDE_STARTERS = [
  "I can't sleep",
  "I'm wound up",
  "My ears are ringing",
  "I want to understand what's happening",
];
