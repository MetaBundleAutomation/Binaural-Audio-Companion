import type { Metadata } from "next";
import Link from "next/link";
import NavIcon from "@/components/NavIcons";
import { siteName } from "@/config";
import { EMERGENCY_LINE, HELP_LINES, type HelpLine } from "@/lib/help";

export const metadata: Metadata = {
  title: `Help Now | ${siteName}`,
  description: "Phone numbers for immediate help in Australia, each one a single tap to call.",
};

function CallCard({ line, primary = false }: { line: HelpLine; primary?: boolean }) {
  return (
    <a
      href={`tel:${line.tel}`}
      className="card card-hover flex items-center gap-4 p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:p-5"
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
        style={
          primary
            ? { background: "var(--btn-primary-bg)", color: "var(--on-accent)" }
            : { background: "var(--surface-solid)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }
        }
        aria-hidden="true"
      >
        <NavIcon name="phone" className="h-6 w-6" />
      </span>
      <span className="min-w-0 grow">
        <span className="block text-[16px] font-semibold leading-snug text-[var(--text-primary)]">
          {line.name}
        </span>
        <span className="block text-[22px] font-bold leading-tight tracking-tight text-[var(--text-primary)]">
          {line.number}
        </span>
        <span className="mt-0.5 block text-[14px] leading-snug text-[var(--text-secondary)]">
          {line.blurb}
        </span>
      </span>
    </a>
  );
}

export default function HelpPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-16 pt-10 sm:px-5 md:pt-14">
      <div className="text-center">
        <span className="eyebrow">Help now</span>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
          Need help now?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-[var(--text-secondary)]">
          You do not have to be in crisis to call. Tap a number and a person will answer.
        </p>
      </div>

      <section aria-label="Emergency" className="mt-8">
        <CallCard line={EMERGENCY_LINE} primary />
      </section>

      <section aria-labelledby="help-lines" className="mt-8">
        <h2 id="help-lines" className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
          Someone to talk to
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {HELP_LINES.map((line) => (
            <CallCard key={line.tel} line={line} />
          ))}
        </div>
      </section>

      <section aria-labelledby="help-meanwhile" className="card mt-8 p-5 sm:p-6">
        <h2 id="help-meanwhile" className="text-[22px] font-bold leading-none text-[var(--text-primary)]">
          While you decide
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          If you are not ready to talk yet, a few minutes of slow breathing can steady your body.
          The numbers will still be here.
        </p>
        <Link href="/breathe" className="btn-secondary mt-4">
          <NavIcon name="wind" className="h-4 w-4" />
          Open Breathing
        </Link>
      </section>
    </main>
  );
}
