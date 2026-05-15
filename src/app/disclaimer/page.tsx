import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — CRUX",
  description: "Important information about CRUX, including wellness, safety, and limitation of liability notices.",
  robots: { index: false, follow: false },
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">

      <h1 className="text-[36px] font-bold tracking-tight text-[var(--text-primary)] mb-2">
        Disclaimer
      </h1>
      <p className="text-[15px] text-[var(--text-secondary)] mb-12 opacity-70">
        Last updated May 2026
      </p>

      {/* Not Medical Advice */}
      <section className="mb-10">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">
          Not medical advice
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          CRUX is a general wellness and relaxation tool. It is not a medical
          device, does not provide medical advice or diagnosis, and is not a
          substitute for professional medical, psychiatric, or psychological
          care. Nothing in CRUX should be interpreted as treatment for any
          physical or mental health condition.
        </p>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mt-3">
          If you are experiencing a mental health crisis, or have any concern
          about your physical or mental wellbeing, please speak with a qualified
          healthcare professional.
        </p>
      </section>

      {/* Safety */}
      <section className="mb-10">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">
          Safety
        </h2>
        <ul className="space-y-3 text-[15px] text-[var(--text-secondary)] leading-relaxed list-none">
          <li className="flex gap-3">
            <span className="mt-1 text-[var(--primary)] shrink-0">—</span>
            <span>
              <strong className="text-[var(--text-primary)]">Do not use while driving or operating machinery.</strong>{" "}
              Binaural beats and guided breathing exercises promote deep
              relaxation and may cause drowsiness or reduced alertness.
              Always use CRUX in a safe, stationary environment.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 text-[var(--primary)] shrink-0">—</span>
            <span>
              <strong className="text-[var(--text-primary)]">Use at a comfortable volume.</strong>{" "}
              Prolonged exposure to high-volume audio can cause permanent
              hearing damage. CRUX works best at low to moderate volumes,
              especially with headphones.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 text-[var(--primary)] shrink-0">—</span>
            <span>
              <strong className="text-[var(--text-primary)]">Epilepsy and neurological conditions.</strong>{" "}
              If you have epilepsy, a history of seizures, or any neurological
              condition, please consult your doctor before using binaural audio
              or guided breathing tools.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 text-[var(--primary)] shrink-0">—</span>
            <span>
              <strong className="text-[var(--text-primary)]">Headphones recommended.</strong>{" "}
              Binaural beats require separate audio in each ear to work as
              intended. Use stereo headphones or earphones, not speakers.
            </span>
          </li>
        </ul>
      </section>

      {/* Limitation of Liability */}
      <section className="mb-10">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">
          Limitation of liability
        </h2>
        <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
          CRUX and its developers, operators, and associated parties accept no
          liability for any loss, injury, or adverse outcome arising from use of
          this application. Use of CRUX is entirely at your own risk. By using
          the app you acknowledge that you have read and understood this
          disclaimer.
        </p>
      </section>

      {/* Crisis Support */}
      <section className="rounded-2xl p-6 border border-[var(--border-color)] bg-[var(--background-card)]">
        <h2 className="text-[20px] font-bold text-[var(--text-primary)] mb-3">
          If you need help right now
        </h2>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
          If you or someone you know is in crisis, please reach out to one of
          the services below. Help is available 24 hours a day, 7 days a week.
        </p>
        <ul className="space-y-3 text-[15px]">
          <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--text-primary)]">Lifeline</span>
            <a href="tel:131114" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
              13 11 14
            </a>
          </li>
          <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--text-primary)]">Open Arms Veterans &amp; Families Counselling</span>
            <a href="tel:1800011046" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
              1800 011 046
            </a>
          </li>
          <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="font-bold text-[var(--text-primary)]">Emergency services</span>
            <a href="tel:000" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
              000
            </a>
          </li>
        </ul>
      </section>

    </main>
  );
}
