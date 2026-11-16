import Link from "next/link";
import EvidenceBadge from "@/components/EvidenceBadge";
import type { TopicCard as TopicCardData } from "@/lib/topics";

// The one reusable topic card. Every topic across the wheel uses this same
// layout, so a reader learns it once and then skims. Blocks follow the build
// and design briefs:
//   short version → science + evidence badge → good points → watch-outs →
//   who it may suit → quick tip → talk to your doctor → sources (collapsed).
// Readable in about 60–90 seconds.

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {heading}
      </h3>
      <div className="mt-2 leading-relaxed text-[var(--text-primary)]">{children}</div>
    </div>
  );
}

/** A bulleted list with a leading mark (✅ or ⚠️) on each line. */
function MarkedList({ items, mark, markLabel }: { items: string[]; mark: string; markLabel: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden="true" className="select-none">{mark}</span>
          <span className="sr-only">{markLabel}:</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TopicCard({ card }: { card: TopicCardData }) {
  return (
    <article className="card p-6 sm:p-7 text-left">
      <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
        {card.title}
      </h2>

      <p className="mt-3 text-lg leading-relaxed text-[var(--text-primary)]">
        {card.shortVersion}
      </p>

      <Section heading="What the science says">
        <div className="mb-3">
          <EvidenceBadge level={card.evidence} />
        </div>
        <p className="text-[var(--text-secondary)]">{card.science}</p>
      </Section>

      <Section heading="Good points">
        <MarkedList items={card.goodPoints} mark="✅" markLabel="Good point" />
      </Section>

      <Section heading="Watch-outs">
        <MarkedList items={card.watchOuts} mark="⚠️" markLabel="Watch-out" />
      </Section>

      <Section heading="Who it may suit">
        <p>{card.whoItMaySuit}</p>
      </Section>

      <Section heading="Quick tip">
        <p>{card.quickTip}</p>
      </Section>

      <Section heading="Talk to your doctor if">
        <p>{card.talkToDoctorIf}</p>
      </Section>

      {card.safetyNote && (
        <div
          className="mt-5 rounded-xl border-l-4 px-4 py-3 text-sm text-[var(--text-primary)]"
          style={{ borderColor: "var(--accent-2)", background: "var(--background-light)" }}
        >
          <span aria-hidden="true">⚠️ </span>
          {card.safetyNote}
        </div>
      )}

      {card.linkBackToCrux && (
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm text-[var(--text-secondary)]"
          style={{ borderColor: "var(--border-color)", background: "var(--background-light)" }}
        >
          {card.linkBackToCrux.text}{" "}
          <Link href={card.linkBackToCrux.href} className="font-semibold text-[var(--primary)] underline underline-offset-2">
            Open the tool
          </Link>
        </div>
      )}

      <details className="mt-6 group">
        <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
          <span className="inline-flex items-center gap-1.5">
            Sources
            <span aria-hidden="true" className="transition-transform group-open:rotate-90">›</span>
          </span>
        </summary>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
          {card.sources.map((source, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true">·</span>
              {source.href ? (
                <a href={source.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[var(--text-primary)]">
                  {source.label}
                </a>
              ) : (
                <span>
                  {source.label} <span className="italic opacity-70">(link to be added)</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
