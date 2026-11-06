/**
 * The question bank for Doctor Questions.
 *
 * These are prompts for a person to ask their own doctor. They are deliberately
 * general: none of them says what the answer should be, and none is specific to
 * a condition. Condition-specific questions belong with that condition's guide
 * and need a clinician's review before they are added.
 *
 * Ids are saved on people's devices. Do not rename or reuse one; retire it.
 */

export interface QuestionGroup {
  id: string;
  title: string;
  questions: { id: string; text: string }[];
}

export const QUESTION_GROUPS: QuestionGroup[] = [
  {
    id: "understanding",
    title: "Understanding what is going on",
    questions: [
      { id: "cause", text: "What do you think is causing this?" },
      { id: "name", text: "Is there a name for it, and can you write it down for me?" },
      { id: "tests", text: "Do I need any tests, and what will they tell us?" },
      { id: "outlook", text: "Is this likely to get better, stay the same or get worse?" },
    ],
  },
  {
    id: "options",
    title: "My options",
    questions: [
      { id: "options", text: "What are my options, including waiting and watching?" },
      { id: "benefits-risks", text: "What are the benefits and the risks of each option?" },
      { id: "do-nothing", text: "What happens if I do nothing for now?" },
      { id: "self-help", text: "Is there anything I can do myself that would help?" },
      { id: "how-long", text: "How long before I should notice a difference?" },
    ],
  },
  {
    id: "medicines",
    title: "Medicines",
    questions: [
      { id: "med-purpose", text: "What is this medicine for, and how do I take it?" },
      { id: "med-side-effects", text: "What side effects should I watch for, and what do I do if I get one?" },
      { id: "med-mixing", text: "Is it safe with my other medicines, alcohol and supplements?" },
      { id: "med-duration", text: "How long will I be on it, and how do I stop?" },
    ],
  },
  {
    id: "costs",
    title: "Costs and cover",
    questions: [
      { id: "cover", text: "Is this covered by my DVA card, Medicare or private cover?" },
      { id: "out-of-pocket", text: "Will there be any cost to me?" },
      { id: "referral", text: "Do I need a referral, and how long is the wait?" },
    ],
  },
  {
    id: "after",
    title: "After today",
    questions: [
      { id: "worse", text: "What should I do if things get worse before I see you again?" },
      { id: "follow-up", text: "When should I come back?" },
      { id: "contact", text: "Who do I call if I have a question after I leave?" },
      { id: "written", text: "Can I have a written summary to take home?" },
      { id: "who-else", text: "Is there someone else I should see as well?" },
    ],
  },
];
