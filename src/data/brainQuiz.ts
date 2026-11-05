// The "Quick check" at the end of the Your Brain section. Every question is
// multi-select and every option carries its own response.
//
// `feedback` shows under a status label ("Spot on", "Not quite", "One you missed"),
// so it shouldn't open with its own verdict: a correct option's line has to read
// properly under both "Spot on" and "One you missed".
export interface QuizOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

export type QuizPartId = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08";

export interface QuizQuestion {
  id: string;
  /** The part of the page to point back to if this one wasn't fully right. */
  partId: QuizPartId;
  question: string;
  options: QuizOption[];
}

export const BRAIN_QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    partId: "01",
    question: "Why is it often worst at 3am, or the minute you stop being busy?",
    options: [
      {
        id: "q1a",
        text: "Because you've got too much time on your hands and should keep busier.",
        correct: false,
        feedback:
          "That's the common guess, and the page says the opposite. It isn't too much time to think — the brain's idle setting itself has changed. Staying busy forever isn't the fix.",
      },
      {
        id: "q1b",
        text: "Because the brain's background “idle hum” has been taken over, so it scans for threat and replays the worst of it.",
        correct: true,
        feedback:
          "Researchers think that resting network is disrupted after trauma, tipped towards rumination and replaying.",
      },
      {
        id: "q1c",
        text: "Because you're weaker when you're tired.",
        correct: false,
        feedback:
          "Nothing on this page is about weakness or willpower. It's a working system that took damage and adapted — the way a knee adapts after an injury.",
      },
    ],
  },
  {
    id: "q2",
    partId: "02",
    question: "The smoke alarm. Which of these are true?",
    options: [
      {
        id: "q2a",
        text: "It thinks carefully about whether something is dangerous before reacting.",
        correct: false,
        feedback:
          "It doesn't think — it just goes off. That's the design: faster than thought, so you move before your mind has caught up.",
      },
      {
        id: "q2b",
        text: "It spots danger fast and sets your body off before your mind catches up.",
        correct: true,
        feedback:
          "Heart going, shoulders up, eyes scanning — the alarm doing its job faster than thought.",
      },
      {
        id: "q2c",
        text: "After trauma it gets turned up to maximum and the dial jams.",
        correct: true,
        feedback:
          "That's the change. It fires more readily and more strongly, so burnt toast brings the fire brigade. And “jammed” isn't forever — see the good news.",
      },
      {
        id: "q2d",
        text: "With enough willpower you can switch it off.",
        correct: false,
        feedback:
          "It was never under your control, and it isn't now. That's not a failing — it's the wiring.",
      },
    ],
  },
  {
    id: "q3",
    partId: "03",
    question: "The filing clerk. Which of these are true?",
    options: [
      {
        id: "q3a",
        text: "It stamps every memory with a date and a place, so your body knows “that was then”.",
        correct: true,
        feedback: "The stamp is what tells your body “then, not now”.",
      },
      {
        id: "q3b",
        text: "Trauma and long-term pain both knock it about, and on average scans find it a little smaller.",
        correct: true,
        feedback:
          "In scans of groups of people, this area is on average a little smaller in PTSD and in some long-term pain conditions. Some of that difference may have been there before the trauma.",
      },
      {
        id: "q3c",
        text: "A flashback feels like happening, not remembering, because the stamp is missing.",
        correct: true,
        feedback:
          "The memory doesn't arrive labelled “four years ago”. It arrives as now.",
      },
      {
        id: "q3d",
        text: "Walking into a room and forgetting why means early dementia.",
        correct: false,
        feedback:
          "Same clerk, same overload. The page is clear: it isn't early dementia and it isn't you going soft.",
      },
    ],
  },
  {
    id: "q4",
    partId: "04",
    question: "The calm supervisor. When the alarm is screaming hardest…",
    options: [
      {
        id: "q4a",
        text: "…the supervisor works harder to make up for it.",
        correct: false,
        feedback:
          "Here's the cruel part: they move in opposite directions. Alarm up, supervisor down — study after study.",
      },
      {
        id: "q4b",
        text: "…the supervisor goes quiet. Offline — not weak, not absent.",
        correct: true,
        feedback:
          "The one part that could talk you down is less active at the exact moment you need it.",
      },
      {
        id: "q4c",
        text: "…“just think about it logically” is the most useful thing someone can say.",
        correct: false,
        feedback:
          "That advice asks a part of your brain that isn't currently taking calls. Worth telling the people around you.",
      },
      {
        id: "q4d",
        text: "…calming the body first can help the supervisor get back in the room.",
        correct: true,
        feedback: "That's exactly where the audio and breathing tools fit.",
      },
    ],
  },
  {
    id: "q5",
    partId: "05",
    question: "The phone line. Which of these are true?",
    options: [
      {
        id: "q5a",
        text: "It's the wiring that lets the alarm, the clerk and the supervisor talk to each other.",
        correct: true,
        feedback: "None of the parts work alone.",
      },
      {
        id: "q5b",
        text: "After trauma it's destroyed beyond repair.",
        correct: false,
        feedback:
          "The honest word is “changed”, not “damaged”. Some studies find it weaker, some oddly stronger. What they agree on is that it's different.",
      },
      {
        id: "q5c",
        text: "Even if the supervisor came back online, a poor line means the message might not land clean.",
        correct: true,
        feedback: "That's why the loop is so stubborn.",
      },
      {
        id: "q5d",
        text: "It only shows up in veterans, not civilians.",
        correct: false,
        feedback:
          "Studies keep finding this in veterans and civilians alike. It's one of the most consistent findings in the field.",
      },
    ],
  },
  {
    id: "q6",
    partId: "06",
    question: "Put the loop together. Which of these are steps in the loop?",
    options: [
      {
        id: "q6a",
        text: "The alarm fires.",
        correct: true,
        feedback: "Step one — and the step the audio aims to interrupt.",
      },
      {
        id: "q6b",
        text: "The clerk can't stamp it “years ago”.",
        correct: true,
        feedback: "Without the stamp, it arrives as now.",
      },
      {
        id: "q6c",
        text: "The supervisor is offline and the phone line is poor.",
        correct: true,
        feedback: "Even if a message were sent, it wouldn't land clean.",
      },
      {
        id: "q6d",
        text: "The body floods with stress chemicals — pounding heart, tight chest, ready to run.",
        correct: true,
        feedback:
          "Adrenaline-type chemicals. And this is what the alarm reads next.",
      },
      {
        id: "q6e",
        text: "You choose to stay upset because you haven't tried hard enough.",
        correct: false,
        feedback:
          "The loop isn't you failing to get over it. It's a circuit that's wired itself to keep going.",
      },
    ],
  },
  {
    id: "q7",
    partId: "06",
    question: "Why does the loop keep going?",
    options: [
      {
        id: "q7a",
        text: "Because the alarm reads the body's stress reaction as proof it was right to fire — so it fires harder next time.",
        correct: true,
        feedback: "That's the feedback that turns a line into a circle.",
      },
      {
        id: "q7b",
        text: "Because you keep bringing it up on purpose.",
        correct: false,
        feedback:
          "Nothing in the loop is a choice. The alarm fires faster than thought and reads your body's reaction as evidence.",
      },
      {
        id: "q7c",
        text: "Because the supervisor tells it to.",
        correct: false,
        feedback:
          "The supervisor is the one trying to turn it down — and it's offline at the worst moment.",
      },
    ],
  },
  {
    id: "q8",
    partId: "07",
    question: "The good news. Which of these are true?",
    options: [
      {
        id: "q8a",
        text: "Circuits can change — trauma-focused therapy reliably reduces symptoms.",
        correct: true,
        feedback:
          "This is the solid finding, not the hopeful one. Therapy reliably reduces symptoms, and early scan studies suggest the brain's activity can shift alongside that.",
      },
      {
        id: "q8b",
        text: "Once the wiring changes it's permanent.",
        correct: false,
        feedback: "Everything above describes a circuit, and circuits can change.",
      },
      {
        id: "q8c",
        text: "The brain that learned this can learn something else.",
        correct: true,
        feedback: "That's the line to keep.",
      },
      {
        id: "q8d",
        text: "Best to wait for it to fix itself.",
        correct: false,
        feedback:
          "The page points to real help — trauma-focused therapy — with the audio as a steadying tool alongside it.",
      },
    ],
  },
  {
    id: "q9",
    partId: "08",
    question: "Where does the audio fit? Which of these are true?",
    options: [
      {
        id: "q9a",
        text: "It fixes your amygdala and can replace therapy.",
        correct: false,
        feedback:
          "The page is blunt: it does not fix your amygdala, it isn't treatment, and anyone saying a soundtrack cures PTSD is selling something.",
      },
      {
        id: "q9b",
        text: "It can calm the body enough that the supervisor can get back in the room.",
        correct: true,
        feedback: "That's the honest job description.",
      },
      {
        id: "q9c",
        text: "It's a steadying tool to break the loop at step one, before the body floods — used alongside real help.",
        correct: true,
        feedback: "Alongside, not instead of.",
      },
      {
        id: "q9d",
        text: "The evidence is settled and certain.",
        correct: false,
        feedback:
          "Promising, not settled. Studies are small and don't agree on everything — the page says so on purpose.",
      },
    ],
  },
];

/** Names for the "Worth a re-read" links on the results card. */
export const QUIZ_PART_TITLES: Record<QuizPartId, string> = {
  "01": "Why it's worst at 3am",
  "02": "The smoke alarm",
  "03": "The filing clerk",
  "04": "The calm supervisor",
  "05": "The phone line",
  "06": "The loop",
  "07": "The part that's actually good news",
  "08": "Where the audio fits — honestly",
};

export const QUIZ_INTRO =
  "Nine short questions. No clock, no score kept. Pick everything you think is true, then check.";

export function quizResultMessage(score: number, total: number) {
  if (score === total) {
    return "You've got the whole circuit. That understanding is the first thing the supervisor needs.";
  }
  if (score >= 6) {
    return "You've got the shape of it. The ones you missed are worth a re-read — tap a part below.";
  }
  return "This stuff is hard to hold on to — that's literally what this page is about. Nothing here is a test you can fail. Have another go whenever you like.";
}
