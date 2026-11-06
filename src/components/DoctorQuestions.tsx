"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import NavIcon from "@/components/NavIcons";
import { trackEvent } from "@/lib/analytics";
import { QUESTION_GROUPS } from "@/data/doctorQuestions";

/**
 * Doctor Questions: build a list of questions to take to an appointment.
 *
 * Tick questions from the bank, add your own, then copy or print the list.
 * The list is kept on this device only (`crux:doctorQuestions`) and is never
 * sent anywhere. Usage events record that a list was copied or printed and how
 * long it was, never what was on it.
 */

const STORAGE_KEY = "crux:doctorQuestions";
const OWN_MAX = 200;
const LIST_MAX = 40;

interface Saved {
  /** Ids in the order they were added: a bank id, or "own-<n>". */
  list: string[];
  /** The text of the person's own questions, by id. */
  own: Record<string, string>;
}

const EMPTY: Saved = { list: [], own: {} };

const BANK = new Map(QUESTION_GROUPS.flatMap((g) => g.questions).map((q) => [q.id, q.text]));

function load(): Saved {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return EMPTY;
    const { list, own } = data as Record<string, unknown>;
    if (!Array.isArray(list) || typeof own !== "object" || own === null) return EMPTY;
    const ownText: Record<string, string> = {};
    for (const [id, text] of Object.entries(own as Record<string, unknown>)) {
      if (typeof text === "string" && text.trim()) ownText[id] = text.slice(0, OWN_MAX);
    }
    const ids = list
      .filter((id): id is string => typeof id === "string")
      .filter((id) => BANK.has(id) || id in ownText)
      .slice(0, LIST_MAX);
    return { list: [...new Set(ids)], own: ownText };
  } catch {
    return EMPTY;
  }
}

export default function DoctorQuestions() {
  const [saved, setSaved] = useState<Saved>(EMPTY);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    setSaved(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Not saved (private window or full storage). The list still works for this visit.
    }
  }, [saved, ready]);

  const say = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 4000);
  };

  const textOf = (id: string) => BANK.get(id) ?? saved.own[id] ?? "";
  const picked = useMemo(() => new Set(saved.list), [saved.list]);
  const full = saved.list.length >= LIST_MAX;

  const toggle = (id: string) => {
    setSaved((s) => {
      if (s.list.includes(id)) return { ...s, list: s.list.filter((x) => x !== id) };
      if (s.list.length >= LIST_MAX) return s;
      return { ...s, list: [...s.list, id] };
    });
  };

  const remove = (id: string) => {
    setSaved((s) => {
      const own = { ...s.own };
      delete own[id];
      return { list: s.list.filter((x) => x !== id), own };
    });
  };

  const addOwn = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim().slice(0, OWN_MAX);
    if (!text || full) return;
    const id = `own-${Date.now().toString(36)}`;
    setSaved((s) => ({ list: [...s.list, id], own: { ...s.own, [id]: text } }));
    setDraft("");
  };

  const clear = () => {
    setSaved(EMPTY);
    say("List cleared.");
  };

  const asText = () =>
    ["Questions for my appointment", "", ...saved.list.map((id, i) => `${i + 1}. ${textOf(id)}`)].join("\n");

  const copy = async () => {
    if (saved.list.length === 0) {
      say("Add a question first.");
      return;
    }
    const text = asText();
    try {
      await navigator.clipboard.writeText(text);
      say("Copied. Paste it into your notes or a message.");
    } catch {
      // Older browsers: fall back to a hidden text box.
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      const ok = document.execCommand("copy");
      box.remove();
      say(ok ? "Copied. Paste it into your notes or a message." : "Could not copy. Try Print instead.");
    }
    trackEvent("questions_copy", { count: saved.list.length });
  };

  const print = () => {
    if (saved.list.length === 0) {
      say("Add a question first.");
      return;
    }
    trackEvent("questions_print", { count: saved.list.length });
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="no-print text-center">
        <span className="eyebrow">Doctor questions</span>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          Questions for your doctor
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-[var(--text-secondary)]">
          Appointments go fast. Tick the questions you want answered, add your own, and take the
          list with you. It stays on this device.
        </p>
      </div>

      {/* My list */}
      <section aria-labelledby="my-questions" className="print-area card mt-8 p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="my-questions" className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
            My list
          </h2>
          <p className="no-print text-[14px] font-semibold text-[var(--text-secondary)]">
            {saved.list.length} {saved.list.length === 1 ? "question" : "questions"}
          </p>
        </div>

        {saved.list.length === 0 ? (
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
            Nothing on your list yet. Tick a question below, or write your own.
          </p>
        ) : (
          <ol className="mt-4 flex flex-col gap-2">
            {saved.list.map((id, index) => (
              <li
                key={id}
                className="flex items-start gap-3 rounded-xl border border-[var(--border-color)] px-3 py-2"
              >
                <span className="mt-1.5 w-6 shrink-0 text-right text-[15px] font-semibold text-[var(--text-secondary)]">
                  {index + 1}.
                </span>
                <span className="min-w-0 grow break-words py-1.5 text-[16px] leading-snug text-[var(--text-primary)]">
                  {textOf(id)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="no-print grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--primary)]"
                  aria-label={`Remove question ${index + 1}`}
                >
                  <NavIcon name="close" className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <div className="no-print mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={copy} className="btn-primary">
            Copy my list
          </button>
          <button type="button" onClick={print} className="btn-secondary">
            Print
          </button>
          {saved.list.length > 0 && (
            <button type="button" onClick={clear} className="btn-ghost min-h-12">
              Clear the list
            </button>
          )}
        </div>
        <p className="no-print mt-3 min-h-6 text-[14px] font-semibold text-[var(--text-primary)]" role="status" aria-live="polite">
          {notice}
        </p>
      </section>

      {/* Write your own */}
      <form onSubmit={addOwn} className="no-print card mt-6 p-4 sm:p-6">
        <label htmlFor="own-question" className="text-[22px] font-bold uppercase leading-none text-[var(--text-primary)] display">
          Write your own
        </label>
        <div className="mt-4 flex items-end gap-2">
          <input
            id="own-question"
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={OWN_MAX}
            autoComplete="off"
            placeholder="What do you most want to know?"
            className="min-h-12 min-w-0 grow rounded-2xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-4 text-[16px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)]"
          />
          <button type="submit" className="btn-secondary shrink-0">
            Add
          </button>
        </div>
        {full && (
          <p className="mt-3 text-[14px] text-[var(--text-secondary)]">
            Your list is full. Remove a question to add another.
          </p>
        )}
      </form>

      {/* The bank */}
      <div className="no-print mt-8 flex flex-col gap-8">
        {QUESTION_GROUPS.map((group) => (
          <section key={group.id} aria-labelledby={`questions-${group.id}`}>
            <h2 id={`questions-${group.id}`} className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
              {group.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {group.questions.map((question) => {
                const on = picked.has(question.id);
                return (
                  <li key={question.id}>
                    <label
                      className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-2.5 transition-colors ${
                        on
                          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]"
                          : "border-[var(--border-color)] bg-[var(--background-light)] hover:border-[var(--primary)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(question.id)}
                        disabled={!on && full}
                        className="h-6 w-6 shrink-0 accent-[var(--accent-2)]"
                      />
                      <span className="text-[16px] leading-snug text-[var(--text-primary)]">{question.text}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="no-print mt-8 text-center text-[14px] leading-relaxed text-[var(--text-secondary)]">
        These are questions to ask, not answers. Your doctor knows your situation and this app does not.
      </p>
    </div>
  );
}
