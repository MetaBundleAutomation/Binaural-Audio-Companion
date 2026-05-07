export interface AromaPairing {
  oil:  string;
  hint: string;
}

/**
 * Recommended essential oil pairings for each CRUX session.
 * Covers all 11 tracks; falls back to DEFAULT_AROMA for unrecognised names.
 */
export const AROMA_PAIRINGS: Record<string, AromaPairing> = {
  "Focus":      { oil: "Rosemary or Peppermint",        hint: "Enhance mental clarity and alertness" },
  "Calm":       { oil: "Lavender or Chamomile",          hint: "Soften the mind and ease tension" },
  "Sleep":      { oil: "Lavender or Vetiver",            hint: "Diffuse 10 min before you settle in" },
  "Creativity": { oil: "Sweet Orange or Bergamot",       hint: "Open the mind and invite new ideas" },
  "Energy":     { oil: "Peppermint or Eucalyptus",       hint: "Invigorate and sharpen alertness" },
  "Meditation": { oil: "Sandalwood or Frankincense",     hint: "Ground and deepen your practice" },
  "Learning":   { oil: "Rosemary or Lemon",              hint: "Support memory retention and focus" },
  "Anxiety":    { oil: "Lavender or Bergamot",           hint: "Soothe and ground the nervous system" },
  "EMDR 50":    { oil: "Bergamot or Frankincense",       hint: "Uplifting yet calming — diffuse before your session" },
  "EMDR 60":    { oil: "Lavender or Frankincense",       hint: "Light your diffuser 2–3 min before starting" },
  "EMDR 70":    { oil: "Frankincense or Cedarwood",      hint: "Light your diffuser 2–3 min before starting" },
};

export const DEFAULT_AROMA: AromaPairing = {
  oil:  "Lavender or Frankincense",
  hint: "A grounding pairing for any session",
};

export function getPairing(trackName: string): AromaPairing {
  return AROMA_PAIRINGS[trackName] ?? DEFAULT_AROMA;
}
