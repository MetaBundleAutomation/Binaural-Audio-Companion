/**
 * Collections: the in-app home for each set of guides written outside this app.
 *
 * A collection page lists what the guides cover and links to each one. For now
 * the articles themselves still live on their original sites and open there in
 * a new tab. When an article has been reviewed and brought into this app, its
 * `href` changes to an in-app path and nothing else needs to move.
 *
 * The one-line descriptions here say what a page is about. They are not
 * medical statements and must not become ones: anything clinical belongs in
 * the article itself, where a clinician reviews it.
 */

export interface CollectionSection {
  title: string;
  blurb: string;
  href: string;
}

export interface CollectionGroup {
  title: string;
  sections: CollectionSection[];
}

export interface Collection {
  /** The route: /guides/<id>. */
  id: string;
  /** The library feature this page belongs to. */
  featureId: string;
  title: string;
  /** Who it is written for. */
  audience: string;
  intro: string;
  /** The site the articles currently live on. */
  sourceName: string;
  /** Still waiting on a clinician's review. */
  status?: "in-review";
  groups: CollectionGroup[];
  /** Library features in this app that go with these guides. */
  related: string[];
}

const CTP = "https://community-treatment-platform.vercel.app";
const IBD = "https://ibd-compass.vercel.app";
const IBS = "https://ibs-compass-nine.vercel.app";
const SPC = "https://spectrum-compass.vercel.app";

export const COLLECTIONS: Collection[] = [
  {
    id: "treatment",
    featureId: "treatment-guides",
    title: "Treatment Guides",
    audience: "For veterans, first responders and the clinicians who look after them",
    intro:
      "Guides to seven conditions. Each one has a plain-language view and a clinician view, and says where to get help.",
    sourceName: "Community Treatment Platform",
    groups: [
      {
        title: "Conditions",
        sections: [
          { title: "Post-traumatic stress (PTSD)", blurb: "What it is, how it is treated and where to start.", href: `${CTP}/conditions/ptsd` },
          { title: "Alcohol and drug use", blurb: "When drinking or drug use has become a problem.", href: `${CTP}/conditions/alcohol-and-drug-use` },
          { title: "Depression", blurb: "Low mood that does not lift.", href: `${CTP}/conditions/mdd` },
          { title: "Moral injury", blurb: "The weight of things done, seen or not prevented.", href: `${CTP}/conditions/moral-injury` },
          { title: "Chronic pain", blurb: "Pain that has lasted months or years.", href: `${CTP}/conditions/chronic-pain` },
          { title: "Teeth grinding and sleep apnoea", blurb: "Grinding or clenching, and broken breathing during sleep.", href: `${CTP}/conditions/bruxism` },
          { title: "Sexual dysfunction", blurb: "A common problem that often goes unmentioned.", href: `${CTP}/conditions/sexual-dysfunction` },
        ],
      },
      {
        title: "About the guides",
        sections: [
          { title: "For veterans and first responders", blurb: "How to use the guides for yourself.", href: `${CTP}/for-veterans-first-responders` },
          { title: "For clinicians", blurb: "How the clinician view is laid out.", href: `${CTP}/for-clinicians` },
          { title: "References", blurb: "The published sources behind the guides.", href: `${CTP}/references` },
        ],
      },
    ],
    related: ["brain", "questions", "breathe"],
  },
  {
    id: "ibd",
    featureId: "ibd-compass",
    title: "IBD Compass",
    audience: "For people living with Crohn's disease or ulcerative colitis, and their families and carers",
    intro:
      "Treatments, diets and research on inflammatory bowel disease, each with a label showing how strong the evidence is.",
    sourceName: "IBD Compass",
    groups: [
      {
        title: "Sections",
        sections: [
          { title: "Treatments", blurb: "Medical, complementary and comfort measures, each with an evidence label.", href: `${IBD}/treatments` },
          { title: "Diet and nutrition", blurb: "Diets people try, and what the evidence says about each.", href: `${IBD}/diet` },
          { title: "Latest research", blurb: "Recent studies in plain language, with notes on availability in Australia.", href: `${IBD}/research` },
          { title: "Mental health and IBD", blurb: "The gut and brain connection, pain, mood and fatigue.", href: `${IBD}/mental-health` },
          { title: "AI assistant", blurb: "A chat assistant on the IBD Compass site. It is separate from the guide in this app.", href: `${IBD}/ask-the-assistant` },
        ],
      },
    ],
    related: ["questions", "breathe", "body-scan", "noise"],
  },
  {
    id: "ibs",
    featureId: "ibs-compass",
    title: "IBS Compass",
    audience: "For people living with irritable bowel syndrome",
    intro: "Treatments, diets and emerging options for irritable bowel syndrome.",
    sourceName: "IBS Compass",
    status: "in-review",
    groups: [
      {
        title: "Sections",
        sections: [
          { title: "Treatments", blurb: "First steps, next steps and options for specific symptoms.", href: `${IBS}/treatments` },
          { title: "Alternative and emerging treatments", blurb: "Other options, grouped by how much evidence there is.", href: `${IBS}/alternative-treatments` },
          { title: "Diet", blurb: "The FODMAP approach, other diets, supplements and common myths.", href: `${IBS}/diet` },
          { title: "Mental health and IBS", blurb: "How the gut and mind affect each other, and where to find support.", href: `${IBS}/mental-health` },
          { title: "AI assistant", blurb: "A chat assistant on the IBS Compass site. It is separate from the guide in this app.", href: `${IBS}/assistant` },
        ],
      },
    ],
    related: ["questions", "breathe", "body-scan", "noise"],
  },
  {
    id: "spectrum",
    featureId: "spectrum-compass",
    title: "Spectrum Compass",
    audience: "For parents and carers of children with autism or ADHD",
    intro: "What the research supports, what it does not, and where to find support in Australia.",
    sourceName: "Spectrum Compass",
    status: "in-review",
    groups: [
      {
        title: "Start here",
        sections: [
          { title: "How to use this guide", blurb: "How the pages and the evidence ratings work.", href: `${SPC}/how-to-use` },
          { title: "Understanding autism and ADHD", blurb: "The background, in plain language.", href: `${SPC}/understanding` },
        ],
      },
      {
        title: "By support level",
        sections: [
          { title: "Level 1", blurb: "For children who need some support.", href: `${SPC}/level-1` },
          { title: "Level 2", blurb: "For children who need substantial support.", href: `${SPC}/level-2` },
          { title: "Level 3", blurb: "For children who need very substantial support.", href: `${SPC}/level-3` },
        ],
      },
      {
        title: "Topics",
        sections: [
          { title: "Treatments and evidence", blurb: "Approaches sorted by how much evidence stands behind them.", href: `${SPC}/treatments` },
          { title: "Food triggers and helpers", blurb: "Diet, supplements and what to be careful with.", href: `${SPC}/diet` },
          { title: "Support in Australia", blurb: "Programs and official sources.", href: `${SPC}/support` },
        ],
      },
      {
        title: "For children",
        sections: [
          { title: "Calm corner", blurb: "A slow breathing companion and grounding ideas.", href: `${SPC}/calm` },
          { title: "Learning games", blurb: "Memory match and word search, with no timers and no scores.", href: `${SPC}/games` },
        ],
      },
    ],
    related: ["questions", "breathe", "body-scan", "noise"],
  },
];

export function findCollection(id: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.id === id);
}
