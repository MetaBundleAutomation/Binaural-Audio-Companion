"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { FeatureRow } from "@/components/FeatureTile";
import NavIcon from "@/components/NavIcons";
import { trackEvent } from "@/lib/analytics";
import {
  GUIDE_LIMITS,
  GUIDE_STARTERS,
  guideFeatures,
  localAnswer,
  safetyAnswer,
  type GuideAnswer,
} from "@/lib/guide";
import { guideSession, type GuideMessage } from "@/lib/guideSession";
import type { Feature } from "@/lib/library";
import { CRISIS_LINES } from "@/lib/nav";

/**
 * Ask the Guide: a short chat that points a person to the right tool or page.
 *
 * Every message is checked on the device first for signs of danger; if there
 * are any, the crisis numbers are shown at once and nothing is sent anywhere.
 * Otherwise the answer comes from the AI service when the deploy has one
 * configured and the phone is online, and from the on-device matcher when it
 * does not. A failed AI call falls back to the matcher without an error.
 *
 * Nothing typed here is saved. Usage events record only that a question was
 * asked and how it was answered, never the words.
 */

/** Ask the server. Null on any failure, so the caller can answer on the device. */
async function askServer(history: GuideMessage[]): Promise<GuideAnswer | null> {
  const turns = history.slice(-GUIDE_LIMITS.turns).map((m) => ({ role: m.role, text: m.text }));
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch("/api/guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ turns }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null) return null;
    const { reply, featureIds, crisis } = data as Record<string, unknown>;
    if (typeof reply !== "string" || !reply.trim() || !Array.isArray(featureIds)) return null;
    return {
      reply: reply.slice(0, GUIDE_LIMITS.replyChars),
      featureIds: featureIds.filter((id): id is string => typeof id === "string").slice(0, GUIDE_LIMITS.picks),
      crisis: crisis === true,
      source: "ai",
    };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export default function Guide() {
  const [messages, setMessages] = useState<GuideMessage[]>(() => guideSession.load());
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  // null until the deploy has said whether it has an AI service.
  const [ai, setAi] = useState<boolean | null>(null);

  const messagesRef = useRef(messages);
  const busyRef = useRef(false);
  const aiCheck = useRef<Promise<boolean> | null>(null);
  const endRef = useRef<HTMLLIElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const commit = useCallback((next: GuideMessage[]) => {
    messagesRef.current = next;
    guideSession.save(next);
    setMessages(next);
  }, []);

  useEffect(() => {
    const check = fetch("/api/guide")
      .then((response) => (response.ok ? response.json() : { ai: false }))
      .then((data: { ai?: unknown }) => data.ai === true)
      .catch(() => false);
    aiCheck.current = check;
    void check.then(setAi);
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, GUIDE_LIMITS.messageChars);
      if (!text || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setDraft("");

      const history = [...messagesRef.current, { id: guideSession.newId(), role: "user" as const, text }];
      commit(history);

      // Safety first, on the device: nothing is sent anywhere for these.
      let answer = safetyAnswer(text, "device");
      if (!answer) {
        const useAi = (await (aiCheck.current ?? Promise.resolve(false))) && navigator.onLine;
        answer = (useAi ? await askServer(history) : null) ?? localAnswer(text);
      }

      trackEvent("guide_ask", { mode: answer.source, picks: answer.featureIds.length });
      if (answer.crisis) trackEvent("guide_crisis");

      commit([...history, { id: guideSession.newId(), role: "guide", text: answer.reply, answer }]);
      busyRef.current = false;
      setBusy(false);
    },
    [commit],
  );

  // A question typed on the home screen arrives here and is asked straight away.
  useEffect(() => {
    const question = guideSession.takeQuestion();
    if (question) void send(question);
  }, [send]);

  // Keep the newest message in view.
  useEffect(() => {
    if (messages.length > 0) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
    inputRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  };

  const startOver = () => {
    commit([]);
    setDraft("");
    inputRef.current?.focus();
  };

  const available = new Map(guideFeatures().map((f) => [f.id, f]));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="text-center">
        <span className="eyebrow">Ask the Guide</span>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          What do you need?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-[var(--text-secondary)]">
          Say what is going on in your own words and I will point you to the right tool or page.
          I am a guide to what is on this platform. I am not a doctor and I can&apos;t give medical advice.
        </p>
      </div>

      <section className="card mt-8 p-4 sm:p-6" aria-label="Ask the guide">
        {messages.length === 0 ? (
          <div>
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">Try one of these, or type your own.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GUIDE_STARTERS.map((starter) => (
                <button key={starter} type="button" onClick={() => void send(starter)} className="btn-ghost min-h-11">
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div role="log" aria-live="polite" aria-label="Conversation">
            <ul className="flex flex-col gap-4">
              {messages.map((message) =>
                message.role === "user" ? (
                  <li
                    key={message.id}
                    className="ml-auto max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-4 py-3 text-[16px] leading-relaxed text-[var(--text-primary)]"
                  >
                    <span className="sr-only">You said: </span>
                    {message.text}
                  </li>
                ) : (
                  <li key={message.id} className="mr-auto w-full">
                    <p className="max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md border border-[var(--border-color)] bg-[var(--background-light)] px-4 py-3 text-[16px] leading-relaxed text-[var(--text-primary)]">
                      <span className="sr-only">The guide said: </span>
                      {message.text}
                    </p>
                    {message.answer?.crisis && <CrisisBlock emergency={message.answer.emergency === true} />}
                    <Picks
                      features={(message.answer?.featureIds ?? [])
                        .map((id) => available.get(id))
                        .filter((f): f is Feature => f !== undefined)}
                    />
                  </li>
                ),
              )}
              {busy && (
                <li className="text-[15px] font-semibold text-[var(--text-secondary)]">Looking…</li>
              )}
              <li ref={endRef} aria-hidden="true" />
            </ul>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-5 flex items-end gap-2">
          <label htmlFor="guide-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="guide-message"
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            maxLength={GUIDE_LIMITS.messageChars}
            enterKeyHint="send"
            placeholder="Say it in your own words"
            className="min-h-[3.25rem] min-w-0 grow resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-4 py-3 text-[16px] leading-snug text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)]"
          />
          {/* Never greyed out: faded text is hard to read. An empty or repeated
              send is simply ignored. */}
          <button type="submit" aria-disabled={busy} className="btn-primary shrink-0 px-5">
            <NavIcon name="send" className="h-4 w-4" />
            Send
          </button>
        </form>

        {messages.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={startOver} className="btn-ghost min-h-11">
              Start over
            </button>
          </div>
        )}
      </section>

      <p className="mt-4 text-center text-[13px] leading-relaxed text-[var(--text-secondary)]">
        {ai === true &&
          "This guide uses an AI service (Claude, made by Anthropic) to find a match. What you type is sent to it to get an answer, and this app does not keep it. Leave out your name and anything that identifies you."}
        {ai === false && "This guide runs on your device. What you type is not sent anywhere and is not kept."}
        {ai === null && "Nothing you type here is kept."}
      </p>

      <div className="mt-6 flex flex-col items-center gap-2">
        <span className="text-[14px] font-semibold text-[var(--text-primary)]">If things are bad right now:</span>
        <div className="flex flex-wrap justify-center gap-2">
          {CRISIS_LINES.map((line) => (
            <a
              key={line.tel}
              href={`tel:${line.tel}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border-color)] px-4 text-[14px] text-[var(--text-secondary)] hover:border-[var(--primary)]"
            >
              <NavIcon name="phone" className="h-4 w-4" />
              {line.name} <span className="font-semibold text-[var(--text-primary)]">{line.number}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The features an answer points to, as tappable rows. */
function Picks({ features }: { features: Feature[] }) {
  if (features.length === 0) return null;
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {features.map((f) => (
        <FeatureRow key={f.id} feature={f} from="ask" />
      ))}
    </div>
  );
}

/** Tap-to-call numbers, shown with any answer where someone may be in danger. */
function CrisisBlock({ emergency }: { emergency: boolean }) {
  const triple = (
    <a key="000" href="tel:000" className={emergency ? "btn-primary" : "btn-secondary"}>
      <NavIcon name="phone" className="h-4 w-4" />
      {emergency ? "Call 000" : "Emergency 000"}
    </a>
  );
  const lines = CRISIS_LINES.map((line) => (
    <a key={line.tel} href={`tel:${line.tel}`} className={emergency ? "btn-secondary" : "btn-primary"}>
      <NavIcon name="phone" className="h-4 w-4" />
      {line.name} {line.number}
    </a>
  ));
  return (
    <div className="mt-3 rounded-2xl border border-[var(--primary)] p-4">
      <p className="text-[16px] font-semibold text-[var(--text-primary)]">
        {emergency ? "Get help now" : "Talk to someone now"}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {emergency ? [triple, ...lines] : [...lines, triple]}
      </div>
    </div>
  );
}
