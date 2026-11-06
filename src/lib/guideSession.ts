import type { GuideAnswer } from "@/lib/guide";

/**
 * The Ask CRUX conversation, held in memory for this visit only.
 *
 * It lives outside the page component so a person can tap a suggested tool,
 * come back, and find the conversation still there. It is never written to
 * storage and is gone when the tab closes or reloads.
 *
 * It also carries a question typed on the home screen across to the Ask page,
 * so the question never has to travel in the address bar.
 */

export interface GuideMessage {
  id: number;
  role: "user" | "guide";
  text: string;
  /** Present on the guide's messages: what to show under the words. */
  answer?: GuideAnswer;
}

let pending: string | null = null;
let conversation: GuideMessage[] = [];
let nextId = 1;

export const guideSession = {
  /** Hand a question from another page to the Ask page. */
  ask(question: string) {
    pending = question;
  },
  /** Take the handed-over question, once. */
  takeQuestion(): string | null {
    const question = pending;
    pending = null;
    return question;
  },
  load(): GuideMessage[] {
    return conversation;
  },
  save(messages: GuideMessage[]) {
    conversation = messages;
  },
  newId(): number {
    return nextId++;
  },
};
