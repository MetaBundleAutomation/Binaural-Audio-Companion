// Topic card content for the CRUX Wheel.
//
// DRAFT for doctor review. Every card here is a starting point, not final
// medical advice. Numbers are placeholders until a clinician confirms them
// against a named guideline.
//
// The design is driven entirely by this data, so the doctor (or Les) can edit
// wording here without touching any component. One card is shown per spoke for
// the mock-up; more can be added to the arrays later.
//
// Evidence levels follow the build brief's three-level scale, which is a
// simpler version of the scale IBS Compass and the Community Treatment Platform
// already use (strong / promising / traditional / anecdotal).

export type EvidenceLevel = "strong" | "some" | "early";

export interface Source {
  label: string;
  href?: string;
}

export interface TopicCard {
  /** URL-safe id, unique within its spoke. */
  id: string;
  title: string;
  /** 2–3 plain sentences: what this is. */
  shortVersion: string;
  /** Honest summary of what the research shows. */
  science: string;
  evidence: EvidenceLevel;
  /** ✅ What it may help with. */
  goodPoints: string[];
  /** ⚠️ Risks, side effects, who should take care. */
  watchOuts: string[];
  /** Gentle, no labels. */
  whoItMaySuit: string;
  /** One small, doable thing. */
  quickTip: string;
  /** When to get advice. */
  talkToDoctorIf: string;
  /** A standing safety line shown in a highlighted box (e.g. supplements). */
  safetyNote?: string;
  /** Collapsed by default. Links added once confirmed. */
  sources: Source[];
  /** Optional nudge back to a CRUX tool. */
  linkBackToCrux?: { text: string; href: string };
}

export const EVIDENCE_META: Record<EvidenceLevel, { label: string; dot: string; note: string }> = {
  // The dot colour carries the level; the label carries the meaning, so the
  // badge never relies on colour alone.
  strong: { label: "Strong evidence", dot: "var(--accent-2)", note: "Good, consistent research" },
  some:   { label: "Some evidence",   dot: "#F0A830",         note: "Promising but limited or mixed" },
  early:  { label: "Early / unclear", dot: "var(--text-secondary)", note: "Not enough research yet" },
};

// Cards per spoke id. For the mock-up, Food & Eating carries the first full
// example (from the build brief). The rest are drafted and can be dropped in
// the same way, one at a time, each confirmed with Les and reviewed by the
// doctor.
export const TOPIC_CARDS: Record<string, TopicCard[]> = {
  food: [
    {
      id: "protein",
      title: "Protein",
      shortVersion:
        "Protein helps your body repair and keep muscle. Most people don't need huge amounts, but needs go up if you're training hard, older, or recovering from injury.",
      science:
        "General guidelines (NHMRC in Australia, USDA in the US, NHS in the UK) set a baseline per kilo of body weight, and research suggests a bit more can help people who do regular strength training. Exact figures are placeholders for the doctor to confirm against a named guideline.",
      evidence: "strong",
      goodPoints: [
        "Supports muscle and recovery",
        "Helps you feel full",
        "Plenty of food options: meat, fish, eggs, dairy, beans, tofu, nuts",
      ],
      watchOuts: [
        "More is not always better",
        "Very high intakes can be a concern for people with kidney problems",
        "Protein powders vary in quality",
      ],
      whoItMaySuit: "Anyone wanting to stay strong, especially if training or getting older.",
      quickTip: "Spread protein across the day instead of one big meal.",
      talkToDoctorIf: "You have kidney issues or are on a special diet.",
      sources: [
        { label: "NHMRC Nutrient Reference Values (protein)", href: "https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients/protein" },
        { label: "USDA Dietary Guidelines" },
        { label: "NHS Eatwell Guide" },
      ],
    },
  ],

  movement: [
    {
      id: "walking",
      title: "Walking and small steps",
      shortVersion:
        "A regular walk is one of the simplest things you can do for body and mind. It doesn't need to be intense to help.",
      science:
        "Research links regular physical activity with better mood, sleep and stress. Public health guidelines (WHO, NHS, US, Australia) recommend regular moderate activity.",
      evidence: "strong",
      goodPoints: [
        "Free and easy to start",
        "Can be done alone or with a mate",
        "Time outside helps many people",
      ],
      watchOuts: [
        "Build up slowly if you're stiff or sore",
        "Old injuries may need a different approach",
      ],
      whoItMaySuit: "Nearly everyone, at any fitness level.",
      quickTip: "Start with 10 minutes and add a little each week.",
      talkToDoctorIf: "You have chest pain, dizziness, or an injury that gets worse.",
      sources: [
        { label: "WHO physical activity guidelines" },
        { label: "Australian Department of Health" },
        { label: "NHS" },
        { label: "US HHS" },
      ],
    },
  ],

  sleep: [
    {
      id: "morning-light",
      title: "Morning light and your body clock",
      shortVersion:
        "Your body runs on a daily clock, and daylight is one of its main cues. Getting outside early can help the clock keep time.",
      science:
        "Research shows light exposure influences sleep-wake timing. Exact amounts vary, so we avoid fixed claims here. Doctor to confirm wording.",
      evidence: "some",
      goodPoints: [
        "Free and easy",
        "Pairs well with a morning walk",
      ],
      watchOuts: [
        "Shift workers may need different timing",
        "Bright light late at night can make sleep harder",
      ],
      whoItMaySuit: "Most people, especially with irregular sleep.",
      quickTip: "Step outside soon after waking, even on a cloudy day.",
      talkToDoctorIf: "Poor sleep lasts for weeks or affects your day.",
      sources: [
        { label: "Sleep Health Foundation (AU)" },
        { label: "NHS" },
        { label: "National Sleep Foundation (US)" },
      ],
      linkBackToCrux: { text: "Winding down tonight? Try the breathing or noise tools.", href: "/breathe" },
    },
  ],

  mind: [
    {
      id: "what-stress-does",
      title: "What stress does to the body",
      shortVersion:
        "Stress is the body's alarm system. It's useful in short bursts, but when it stays switched on, it can affect sleep, mood, pain and energy. Many people find this explains a lot.",
      science:
        "The physiology of the stress response is well established, and calming practices such as slow breathing are studied for helping the body settle. The badge here is for the basics, not for any one tool.",
      evidence: "strong",
      goodPoints: [
        "Understanding it can take away some of the worry",
        "Simple tools exist",
      ],
      watchOuts: [
        "No single tool works for everyone",
        "Take it at your own pace",
      ],
      whoItMaySuit: "Anyone who feels “wired” or worn down.",
      quickTip: "Try a few rounds of box breathing in CRUX.",
      talkToDoctorIf: "It's getting in the way of work, sleep or relationships.",
      sources: [
        { label: "Beyond Blue / Open Arms (AU)" },
        { label: "US VA National Center for PTSD" },
        { label: "NHS" },
      ],
      linkBackToCrux: { text: "See what the stress loop looks like in the brain.", href: "/brain" },
    },
  ],

  body: [
    {
      id: "pain-and-stress",
      title: "Pain and stress feed each other",
      shortVersion:
        "Stress can turn up the volume on pain, and pain can add to stress. Breaking the loop in small ways can help.",
      science:
        "Pain research supports a link between the nervous system, stress and pain. Gentle movement and relaxation are commonly recommended alongside medical care.",
      evidence: "some",
      goodPoints: [
        "Small steps can ease the cycle",
        "Works alongside other care",
      ],
      watchOuts: [
        "Pain that is new, severe or changing should be checked, not just managed",
      ],
      whoItMaySuit: "People living with ongoing aches and pains.",
      quickTip: "Pair a slow breathing session with gentle stretching.",
      talkToDoctorIf: "Pain is new, getting worse, or limiting what you can do.",
      sources: [
        { label: "Pain Australia" },
        { label: "NHS" },
        { label: "US NIH" },
      ],
      linkBackToCrux: { text: "Settle the alarm first with a slow breathing session.", href: "/breathe" },
    },
  ],

  supplements: [
    {
      id: "magnesium",
      title: "Magnesium",
      shortVersion:
        "Magnesium is a mineral that many people ask about for sleep, muscles and stress. Most get some from food, and supplements suit some people but not everyone.",
      science:
        "Magnesium is essential, but evidence that supplements improve sleep or stress in people who aren't low is mixed. Doctor to confirm.",
      evidence: "some",
      goodPoints: [
        "Found in nuts, seeds, leafy greens and wholegrains",
        "Generally well tolerated at normal doses",
      ],
      watchOuts: [
        "Too much can upset the stomach",
        "People with kidney problems need care",
        "Can interact with some medicines",
      ],
      whoItMaySuit: "People with low intake or a doctor's advice.",
      quickTip: "Look at food first, then ask a pharmacist before buying.",
      talkToDoctorIf: "You take regular medication or have kidney issues.",
      safetyNote:
        "Check before you mix — tell your doctor or pharmacist what you take, including herbal and natural products.",
      sources: [
        { label: "NIH Office of Dietary Supplements" },
        { label: "NHMRC" },
        { label: "NHS" },
      ],
    },
  ],

  treatments: [
    {
      id: "start-the-conversation",
      title: "How to start the conversation",
      shortVersion:
        "Talking to a doctor can feel like a big step. A few simple lines can make it easier.",
      science:
        "Early, honest conversations help people get the right support sooner. This is a general principle rather than a specific treatment.",
      evidence: "strong",
      goodPoints: [
        "You stay in control",
        "You can bring a mate or partner",
        "You can say as little or as much as you like",
      ],
      watchOuts: [
        "The first person you see may not be the right fit — it's okay to try someone else",
      ],
      whoItMaySuit: "Anyone who has been putting it off.",
      quickTip: "Try: “I've been feeling worn down and I'd like some advice.”",
      talkToDoctorIf: "You're not sure where to start — that's exactly the reason.",
      sources: [
        { label: "Open Arms (AU)" },
        { label: "VA (US)" },
        { label: "NHS and Combat Stress (UK)" },
      ],
    },
  ],

  connection: [
    {
      id: "why-mates-matter",
      title: "Why mates matter",
      shortVersion:
        "Staying connected with people who get you is good for body and mind. It doesn't have to be a big conversation.",
      science:
        "Research consistently links social connection with better health and wellbeing.",
      evidence: "strong",
      goodPoints: [
        "Small contact counts",
        "Can be shared activities, not just talking",
      ],
      watchOuts: [
        "Pushing yourself into big gatherings can backfire — start small",
      ],
      whoItMaySuit: "Anyone who has drifted from friends or family.",
      quickTip: "Send one message to someone this week.",
      talkToDoctorIf: "You feel very isolated for a long time.",
      sources: [
        { label: "WHO" },
        { label: "Open Arms peer programs" },
        { label: "Mind (UK)" },
      ],
    },
  ],
};

export function cardsForSpoke(spokeId: string): TopicCard[] {
  return TOPIC_CARDS[spokeId] ?? [];
}
