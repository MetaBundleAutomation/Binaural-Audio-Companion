"use client";

import { useState } from "react";
import Link from "next/link";
import ConditionEvidenceBadge from "@/components/ConditionEvidenceBadge";
import { SPOKES } from "@/lib/wheel";
import {
  type Condition,
  type ConditionAudience,
  type ConditionSection,
  type ContentBlock,
  getCondition,
} from "@/lib/conditions";

// The interactive part of a condition page: the audience toggle (Veteran /
// First responder / Clinician) and everything that changes with it. Veteran is
// the default, so a stressed reader isn't met with a wall of clinical detail;
// the doctor can switch to the clinician view in one tap.
//
// The whole condition is passed in as plain data, so this stays a thin renderer
// and the doctor edits content in src/lib/conditions.ts, not here.

const AUDIENCES: { id: ConditionAudience; label: string }[] = [
  { id: "veteran", label: "Veteran" },
  { id: "firstResponder", label: "First responder" },
  { id: "clinician", label: "Clinician" },
];

function Block({ block }: { block: ContentBlock }) {
  if ("p" in block) {
    return (
      <p className="mt-3 leading-relaxed text-[var(--text-primary)]">{block.p}</p>
    );
  }
  if ("list" in block) {
    return (
      <ul className="mt-3 flex flex-col gap-2">
        {block.list.map((item, i) => (
          <li key={i} className="flex gap-2.5 leading-relaxed text-[var(--text-primary)]">
            <span aria-hidden="true" className="select-none text-[var(--primary)]">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  // Labelled groups (referral pathways: Veterans / First responders).
  return (
    <div className="mt-3 flex flex-col gap-3">
      {block.defs.map((def, i) => (
        <p key={i} className="leading-relaxed text-[var(--text-primary)]">
          <span className="font-semibold">{def.term}:</span> {def.text}
        </p>
      ))}
    </div>
  );
}

function Section({ section }: { section: ConditionSection }) {
  const calloutColor =
    section.callout === "brick"
      ? "#C0564B"
      : section.callout === "amber"
        ? "#F0A830"
        : undefined;

  return (
    <section
      className={section.callout ? "rounded-xl border-l-4 pl-4 py-1" : undefined}
      style={calloutColor ? { borderColor: calloutColor } : undefined}
    >
      <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        {section.heading}
      </h3>
      {section.evidence && (
        <div className="mt-2">
          <ConditionEvidenceBadge level={section.evidence} />
        </div>
      )}
      {section.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </section>
  );
}

export default function ConditionView({ condition }: { condition: Condition }) {
  const [audience, setAudience] = useState<ConditionAudience>("veteran");
  const content = condition[audience];
  const keyPoints = condition.keyPoints[audience];

  return (
    <div className="mt-8">
      {/* Audience toggle. Selected tab is bold + underlined, never colour alone. */}
      <div
        role="tablist"
        aria-label="Who is this for?"
        className="flex flex-wrap gap-2"
      >
        {AUDIENCES.map((a) => {
          const selected = a.id === audience;
          return (
            <button
              key={a.id}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setAudience(a.id)}
              className="rounded-full border px-4 py-2 text-sm transition-colors"
              style={{
                borderColor: selected ? "var(--primary)" : "var(--border-color)",
                background: selected ? "var(--background-light)" : "transparent",
                color: selected ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: selected ? 700 : 500,
                textDecoration: selected ? "underline" : "none",
                textUnderlineOffset: "4px",
              }}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {audience === "clinician" && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Clinical detail written for treating clinicians. Plain-language versions
          are under the Veteran and First responder tabs.
        </p>
      )}

      {/* Key points for the chosen audience. */}
      {keyPoints.length > 0 && (
        <section
          aria-label="Key points"
          className="card mt-6 border-l-4 p-5 sm:p-6"
          style={{ borderLeftColor: "var(--primary)" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Key points
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex gap-2.5 leading-relaxed text-[var(--text-primary)]">
                <span aria-hidden="true" className="select-none text-[var(--primary)]">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The content for the chosen audience. */}
      <div className="mt-8 flex flex-col gap-7">
        {content.intro && (
          <p className="text-lg leading-relaxed text-[var(--text-primary)]">
            {content.intro}
          </p>
        )}
        {content.sections.map((section, i) => (
          <Section key={i} section={section} />
        ))}
      </div>

      {/* Related conditions. */}
      {condition.related && condition.related.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Related
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {condition.related.map((slug) => {
              const other = getCondition(slug);
              if (!other) return null;
              return (
                <Link
                  key={slug}
                  href={`/explore/conditions/${slug}`}
                  className="rounded-full border px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  {other.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Gentle links into the wheel's self-help spokes. */}
      {condition.relatedSpokes && condition.relatedSpokes.length > 0 && (
        <div className="mt-8 flex flex-col gap-3">
          {condition.relatedSpokes.map((link, i) => {
            const spoke = SPOKES.find((s) => s.id === link.id);
            if (!spoke) return null;
            return (
              <div
                key={i}
                className="rounded-xl border px-4 py-3 text-sm text-[var(--text-secondary)]"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--background-light)",
                }}
              >
                {link.text}{" "}
                <Link
                  href={`/explore/${spoke.id}`}
                  className="font-semibold text-[var(--primary)] underline underline-offset-2"
                >
                  {spoke.label}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Sources, collapsed by default — same pattern as the topic cards. */}
      {condition.sources.length > 0 && (
        <details className="mt-8 group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
            <span className="inline-flex items-center gap-1.5">
              Sources &amp; references
              <span aria-hidden="true" className="transition-transform group-open:rotate-90">
                ›
              </span>
            </span>
          </summary>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
            {condition.sources.map((source, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">·</span>
                {source.href ? (
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-[var(--text-primary)]"
                  >
                    {source.label}
                  </a>
                ) : (
                  <span>
                    {source.label}{" "}
                    <span className="italic opacity-70">(link to be added)</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
