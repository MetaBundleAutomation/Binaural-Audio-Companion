import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NavIcon from "@/components/NavIcons";
import WheelIcon, { type WheelIconName } from "@/components/WheelIcons";
import TopicCard from "@/components/TopicCard";
import { SPOKES, WHEEL_LABEL, WHEEL_DRAFT_NOTICE } from "@/lib/wheel";
import { cardsForSpoke } from "@/lib/topics";

// One page per spoke. For now each is a placeholder so every spoke on the wheel
// opens to something real while the doctor reviews the shape. The reusable topic
// card and real content land in the next steps, one spoke at a time.

export function generateStaticParams() {
  return SPOKES.map(spoke => ({ spoke: spoke.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ spoke: string }> },
): Promise<Metadata> {
  const { spoke: id } = await params;
  const spoke = SPOKES.find(s => s.id === id);
  if (!spoke) return { title: `${WHEEL_LABEL} — CRUX` };
  return { title: `${spoke.label} — ${WHEEL_LABEL} — CRUX`, description: spoke.description };
}

export default async function SpokePage(
  { params }: { params: Promise<{ spoke: string }> },
) {
  const { spoke: id } = await params;
  const spoke = SPOKES.find(s => s.id === id);
  if (!spoke) notFound();

  const cards = cardsForSpoke(spoke.id);

  return (
    <main className="min-h-screen px-5 pt-12 pb-20 md:pt-16">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <NavIcon name="arrow" className="h-4 w-4 rotate-180" />
          Back to the wheel
        </Link>

        <div className="mt-8 text-center">
          <span className="eyebrow">{WHEEL_DRAFT_NOTICE}</span>
          <span
            className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full border text-[var(--primary)] shadow-lg"
            style={{ background: "var(--surface-solid)", borderColor: "var(--border-color)" }}
          >
            <WheelIcon name={spoke.id as WheelIconName} className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {spoke.label}
          </h1>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
            {spoke.description}.
          </p>
        </div>

        {cards.length > 0 ? (
          <div className="mt-10 flex flex-col gap-6">
            {cards.map(card => (
              <TopicCard key={card.id} card={card} />
            ))}
            <p className="text-center text-sm text-[var(--text-secondary)]">
              More topics for this section are being written and reviewed.
            </p>
          </div>
        ) : (
          /* Placeholder until this spoke's topic cards are written and reviewed. */
          <div className="card mt-10 p-6 sm:p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              Topic cards for this section are being written and will be reviewed by
              the doctor before anything is shown as advice.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <Link href="/crisis" className="btn-secondary">
            Need to talk to someone now?
          </Link>
        </div>
      </div>
    </main>
  );
}
