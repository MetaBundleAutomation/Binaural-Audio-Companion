/**
 * House rules for the room, applied in the browser before a message is sent.
 * The database applies the same rules again in `guard_message()` (see
 * `supabase/migrations/`), so bypassing the browser gains nothing.
 */

export const MAX_MESSAGE_LENGTH = 280;

/** Minimum gap between two messages from the same person. */
export const MESSAGE_COOLDOWN_MS = 5000;

/** How long messages stay visible. The database hides older rows. */
export const MESSAGE_LIFETIME_HOURS = 24;

export const ROOM_RULES = [
  "Be kind. Everyone here is working on the same thing.",
  "No real names, phone numbers or links.",
  "Messages disappear after 24 hours. Nothing is kept.",
];

export const CRISIS_LINES = [
  { name: "Open Arms", detail: "veterans & families, 24/7", number: "1800 011 046", tel: "1800011046" },
  { name: "Lifeline", detail: "24/7", number: "13 11 14", tel: "131114" },
  { name: "000", detail: "in an emergency", number: "000", tel: "000" },
];

// Kept short on purpose: slurs and the harshest words. Everyday Australian
// swearing is left alone. Keep this list identical to the one in the SQL.
const BLOCKED_WORDS = [
  "fuck", "fucking", "fucked", "fucker", "motherfucker", "cunt", "cunts",
  "faggot", "fag", "nigger", "nigga", "retard", "retarded", "whore", "slut",
  "kike", "chink", "spic", "tranny", "twat",
];

const LINK_RE = /(https?:\/\/|www\.)\S+/gi;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE_RE = /\+?\d[\d\s().-]{7,}\d/g;

export interface CleanResult {
  body: string;
  /** True when nothing sendable was left. */
  empty: boolean;
  /** True when a link, email or phone number was removed. */
  redacted: boolean;
}

/** Trim, strip anything identifying, mask blocked words, and cap the length. */
export function cleanMessage(raw: string): CleanResult {
  let body = raw.replace(/\s+/g, " ").trim();
  const before = body;
  body = body.replace(LINK_RE, "[link removed]");
  body = body.replace(EMAIL_RE, "[email removed]");
  body = body.replace(PHONE_RE, "[number removed]");
  const redacted = body !== before;

  for (const word of BLOCKED_WORDS) {
    body = body.replace(new RegExp(`\\b${word}\\b`, "gi"), "*".repeat(word.length));
  }

  body = body.slice(0, MAX_MESSAGE_LENGTH).trim();
  return { body, empty: body.length === 0, redacted };
}

const CRISIS_RE =
  /\b(suicid\w*|kill (myself|me)|end (it all|my life)|self[- ]?harm|don'?t want to (be here|live|wake up)|want to die|not worth living)\b/i;

/** When this is true, show the sender the crisis lines. The message still goes through. */
export function looksLikeCrisis(body: string): boolean {
  return CRISIS_RE.test(body);
}
