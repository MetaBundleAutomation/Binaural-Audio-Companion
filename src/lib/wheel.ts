// The CRUX Wheel — the "Explore" area added around CRUX.
//
// This is a mock-up for doctor review. Nothing here is medical advice, and
// every health claim is DRAFT until a clinician signs it off.
//
// WHEEL_LABEL is the working name only. The doctor and Les may change it; keep
// it here so one edit renames it everywhere (home button, page heading, nav).

export const WHEEL_LABEL = "Explore";
export const WHEEL_HREF = "/explore";
export const WHEEL_TAGLINE = "Practical, science-backed health topics for veterans";

// The banner every wheel page shows, so a reader always knows the content is
// not yet reviewed. Change the two words "DRAFT —" to "Reviewed —" per section
// once the doctor signs off (handled later, per the design brief).
export const WHEEL_DRAFT_NOTICE =
  "DRAFT — for doctor review. Not medical advice.";

export interface Spoke {
  /** URL-safe id, also the page path: /explore/<id>. */
  id: string;
  label: string;
  /** One line shown under the label on the wheel. */
  description: string;
}

// The eight spokes, from the build brief (section 5.2). Content comes later,
// one spoke at a time, each confirmed with Les and reviewed by the doctor.
export const SPOKES: Spoke[] = [
  { id: "food",        label: "Food & Eating",              description: "Fuel your body well, without the guilt" },
  { id: "movement",    label: "Movement",                   description: "Small steps, real benefits" },
  { id: "sleep",       label: "Sleep & Light",              description: "Rest and reset" },
  { id: "mind",        label: "Mind & Stress",              description: "How stress works, and what helps" },
  { id: "body",        label: "Body & Pain",                description: "Easing the load on your body" },
  { id: "supplements", label: "Supplements & Alternatives", description: "What's known, what isn't" },
  { id: "treatments",  label: "Treatments & Getting Help",  description: "What help looks like, in plain words" },
  { id: "connection",  label: "Connection & Support",       description: "You don't have to do it alone" },
];
