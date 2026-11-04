"use client";

import { useEffect, useRef, useState } from "react";
import {
  BRAIN_QUIZ,
  QUIZ_INTRO,
  QUIZ_PART_TITLES,
  quizResultMessage,
  type QuizOption,
  type QuizPartId,
  type QuizQuestion,
} from "@/data/brainQuiz";

// Same two hexes as the supervisor and the alarm, so they read in every theme.
// Colour is never the only cue — every status also has an icon and a word.
const RIGHT_COLOR = "#4FA98C";
const WRONG_COLOR = "#C97B5A";

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-full text-[15px] font-bold text-white bg-[var(--primary-dark)] hover:bg-[var(--primary)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--primary-dark)]";
const SECONDARY_BUTTON =
  "inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-full text-[15px] font-semibold text-center text-[var(--text-primary)] bg-[var(--background-card)] border border-[var(--border-color)] hover:border-[var(--primary)] transition-all cursor-pointer";

type OptionStatus = "right" | "wrong" | "missed" | "neutral";

const STATUS_LABEL = {
  right: "Spot on",
  wrong: "Not quite",
  missed: "One you missed",
};

function statusOf(option: QuizOption, isSelected: boolean): OptionStatus {
  if (option.correct) return isSelected ? "right" : "missed";
  return isSelected ? "wrong" : "neutral";
}

function tally(question: QuizQuestion, selected: ReadonlySet<string>) {
  const statuses = question.options.map((o) => statusOf(o, selected.has(o.id)));
  const count = (s: OptionStatus) => statuses.filter((x) => x === s).length;
  return { right: count("right"), wrong: count("wrong"), missed: count("missed") };
}

function isFullyRight(question: QuizQuestion, selected: ReadonlySet<string>) {
  const { wrong, missed } = tally(question, selected);
  return wrong === 0 && missed === 0;
}

function resultLine(question: QuizQuestion, selected: ReadonlySet<string>) {
  const { right, wrong, missed } = tally(question, selected);
  if (wrong === 0 && missed === 0) {
    return right === 1 ? "That's the one" : `All ${right} right`;
  }
  return [
    right > 0 && `${right} right`,
    wrong > 0 && `${wrong} not quite`,
    missed > 0 && `${missed} missed`,
  ]
    .filter(Boolean)
    .join(", ");
}

function StatusIcon({ status }: { status: Exclude<OptionStatus, "neutral"> }) {
  const color = status === "wrong" ? WRONG_COLOR : RIGHT_COLOR;
  const hollow = status === "missed";
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 shrink-0"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill={hollow ? "none" : color}
        stroke={color}
        strokeWidth="2"
      />
      <path
        d={status === "wrong" ? "M8.5 8.5l7 7M15.5 8.5l-7 7" : "M7.5 12.5l3 3 6-6.5"}
        stroke={hollow ? color : "var(--background)"}
        strokeWidth="2.5"
      />
    </svg>
  );
}

// One answer row. The real checkbox is visually hidden; the label is the tap
// target and the status sits outside it, so feedback isn't read as part of the
// checkbox's name.
function OptionRow({
  option,
  isSelected,
  isChecked,
  onToggle,
}: {
  option: QuizOption;
  isSelected: boolean;
  isChecked: boolean;
  onToggle: () => void;
}) {
  const status = isChecked ? statusOf(option, isSelected) : null;

  const frame =
    status === "right"
      ? { borderColor: RIGHT_COLOR }
      : status === "wrong"
        ? { borderColor: WRONG_COLOR }
        : status === "missed"
          ? { borderColor: RIGHT_COLOR, borderStyle: "dashed" as const }
          : undefined;

  const boxColor =
    status === "right"
      ? RIGHT_COLOR
      : status === "wrong"
        ? WRONG_COLOR
        : "var(--primary)";

  return (
    <div
      className={`rounded-xl border-2 transition-all ${
        !isChecked && isSelected
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_16%,var(--background-card))]"
          : `border-[var(--border-color)] bg-[var(--background-card)]${isChecked ? "" : " hover:border-[var(--primary-light)]"}`
      } ${status === "neutral" ? "opacity-60" : ""}`}
      style={frame}
    >
      <label
        className={`relative flex items-start gap-3 min-h-12 px-4 py-3 rounded-[10px] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-[var(--primary)] ${
          isChecked ? "" : "cursor-pointer"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={isSelected}
          disabled={isChecked}
          onChange={onToggle}
        />
        <span
          className="mt-px w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all"
          style={
            isSelected
              ? { backgroundColor: boxColor, borderColor: boxColor }
              : { borderColor: "var(--text-secondary)" }
          }
          aria-hidden="true"
        >
          {isSelected && (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={isChecked ? "var(--background)" : "white"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          )}
        </span>
        <span className="min-w-0 text-[15px] md:text-[16px] leading-snug text-[var(--text-primary)]">
          {option.text}
        </span>
      </label>

      {status && status !== "neutral" && (
        <div className="mx-4 pt-2.5 pb-3.5 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-1 text-[15px] font-bold text-[var(--text-primary)]">
            <StatusIcon status={status} />
            {STATUS_LABEL[status]}
          </div>
          <p className="text-[14px] md:text-[15px] leading-relaxed text-[var(--text-secondary)]">
            {option.feedback}
          </p>
        </div>
      )}
    </div>
  );
}

export default function BrainQuiz() {
  const [phase, setPhase] = useState<"intro" | "question" | "results">("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [isChecked, setIsChecked] = useState(false);
  const [notFullyRight, setNotFullyRight] = useState<QuizQuestion[]>([]);

  // Moves focus to the new heading after a step forward, so keyboard and
  // screen-reader users land on it. Left alone on first render so the page
  // doesn't jump down to the quiz on load.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldMoveFocus = useRef(false);

  useEffect(() => {
    if (!shouldMoveFocus.current) return;
    shouldMoveFocus.current = false;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [phase, index]);

  const total = BRAIN_QUIZ.length;
  const question = BRAIN_QUIZ[index];

  function startFromTheTop() {
    shouldMoveFocus.current = true;
    setIndex(0);
    setSelected(new Set());
    setIsChecked(false);
    setNotFullyRight([]);
    setPhase("question");
  }

  function toggle(optionId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(optionId)) next.delete(optionId);
      else next.add(optionId);
      return next;
    });
  }

  function checkAnswers() {
    setIsChecked(true);
    if (!isFullyRight(question, selected)) {
      setNotFullyRight((current) => [...current, question]);
    }
  }

  function goForward() {
    shouldMoveFocus.current = true;
    if (index === total - 1) {
      setPhase("results");
      return;
    }
    setIndex(index + 1);
    setSelected(new Set());
    setIsChecked(false);
  }

  if (phase === "intro") {
    return (
      <div>
        <p className="mb-5 text-[16px] leading-relaxed text-[var(--text-primary)]">
          {QUIZ_INTRO}
        </p>
        <button type="button" onClick={startFromTheTop} className={PRIMARY_BUTTON}>
          Start the quick check
        </button>
      </div>
    );
  }

  if (phase === "results") {
    const score = total - notFullyRight.length;
    const partsToReread = [...new Set(notFullyRight.map((q) => q.partId))] as QuizPartId[];

    return (
      <div>
        <h4
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-24 outline-none text-[18px] md:text-[19px] font-bold leading-snug text-[var(--text-primary)]"
        >
          You got {score} of {total} questions fully right
        </h4>
        <p className="mt-3 text-[16px] leading-relaxed text-[var(--text-primary)]">
          {quizResultMessage(score, total)}
        </p>

        {partsToReread.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
              Worth a re-read
            </div>
            <ul className="flex flex-col gap-2">
              {partsToReread.map((partId) => (
                <li key={partId}>
                  <a
                    href={`#brain-${partId}`}
                    className="flex items-baseline gap-3 min-h-12 px-4 py-3 rounded-xl border-2 border-[var(--border-color)] bg-[var(--background-card)] hover:border-[var(--primary-light)] transition-all"
                  >
                    <span className="text-[13px] font-bold tracking-widest text-[var(--text-secondary)]">
                      {partId}
                    </span>
                    <span className="text-[15px] font-semibold leading-snug text-[var(--text-primary)]">
                      {QUIZ_PART_TITLES[partId]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
          <button type="button" onClick={startFromTheTop} className={PRIMARY_BUTTON}>
            Go again
          </button>
          <a href="#brain-science" className={SECONDARY_BUTTON}>
            Back to the top of this page
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="mb-2 text-[13px] font-semibold text-[var(--text-secondary)]"
        aria-hidden="true"
      >
        Question {index + 1} of {total}
      </div>
      <div
        className="mb-5 h-1.5 rounded-full overflow-hidden bg-[var(--border-color)]"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-[var(--primary)] transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      <fieldset className="min-w-0">
        <legend className="w-full">
          <h4
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-24 outline-none text-[18px] md:text-[19px] font-bold leading-snug text-[var(--text-primary)]"
          >
            <span className="sr-only">
              Question {index + 1} of {total}.{" "}
            </span>
            {question.question}
          </h4>
        </legend>
        <p className="mt-1 mb-4 text-[14px] text-[var(--text-secondary)]">
          Pick everything you think is true.
        </p>

        {/* Only the new status rows and result line get announced after checking */}
        <div aria-live="polite" aria-relevant="additions" className="flex flex-col gap-2.5">
          {question.options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              isSelected={selected.has(option.id)}
              isChecked={isChecked}
              onToggle={() => toggle(option.id)}
            />
          ))}
          {isChecked && (
            <p className="mt-2 text-[15px] font-bold text-[var(--text-primary)]">
              {resultLine(question, selected)}
            </p>
          )}
        </div>
      </fieldset>

      <div className="mt-5">
        {isChecked ? (
          <button type="button" onClick={goForward} className={PRIMARY_BUTTON}>
            {index === total - 1 ? "See how you went" : "Next question"}
          </button>
        ) : (
          <button
            type="button"
            onClick={checkAnswers}
            disabled={selected.size === 0}
            className={PRIMARY_BUTTON}
          >
            Check my answers
          </button>
        )}
      </div>
    </div>
  );
}
