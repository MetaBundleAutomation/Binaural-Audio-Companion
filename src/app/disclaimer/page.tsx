import type { Metadata } from "next";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Disclaimer | ${siteName}`,
  description: "Important information about the platform, including wellness, safety, and limitation of liability notices.",
  robots: { index: false, follow: false },
};

export default function DisclaimerPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16">

      <span className="eyebrow">Disclaimer</span>
      <h1 className="mt-5 text-balance text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
        Disclaimer
      </h1>
      <p className="mt-4 text-[15px] text-[var(--text-secondary)]">
        Last updated November 2026
      </p>

      <div className="mt-12 space-y-10">

        {/* Not Medical Advice */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
            Not medical advice
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            The {siteName} (&ldquo;the platform&rdquo;) is a general wellness and relaxation tool. It is not a medical
            device, does not provide medical advice or diagnosis, and is not a
            substitute for professional medical, psychiatric, or psychological
            care. Nothing in the platform should be interpreted as treatment for any
            physical or mental health condition.
          </p>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed mt-3">
            If you are experiencing a mental health crisis, or have any concern
            about your physical or mental wellbeing, please speak with a qualified
            healthcare professional.
          </p>
        </section>

        {/* Safety */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
            Safety
          </h2>
          <ul className="space-y-3 text-[15px] text-[var(--text-secondary)] leading-relaxed list-none">
            <li>
              <span className="text-[var(--primary)]">—</span>{" "}
              <strong className="text-[var(--text-primary)]">Do not use while driving or operating machinery.</strong>{" "}
              Binaural beats and guided breathing exercises promote deep
              relaxation and may cause drowsiness or reduced alertness.
              Always use the platform in a safe, stationary environment.
            </li>
            <li>
              <span className="text-[var(--primary)]">—</span>{" "}
              <strong className="text-[var(--text-primary)]">Use at a comfortable volume.</strong>{" "}
              Prolonged exposure to high-volume audio can cause permanent
              hearing damage. The platform works best at low to moderate volumes,
              especially with headphones.
            </li>
            <li>
              <span className="text-[var(--primary)]">—</span>{" "}
              <strong className="text-[var(--text-primary)]">Epilepsy and neurological conditions.</strong>{" "}
              If you have epilepsy, a history of seizures, or any neurological
              condition, please consult your doctor before using binaural audio
              or guided breathing tools.
            </li>
            <li>
              <span className="text-[var(--primary)]">—</span>{" "}
              <strong className="text-[var(--text-primary)]">Headphones recommended.</strong>{" "}
              Binaural beats require separate audio in each ear to work as
              intended. Use stereo headphones or earphones, not speakers.
            </li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
            Limitation of liability
          </h2>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
            The platform and its developers, operators, and associated parties accept no
            liability for any loss, injury, or adverse outcome arising from use of
            this application. Use of the platform is entirely at your own risk. By using
            the app you acknowledge that you have read and understood this
            disclaimer.
          </p>
        </section>

        {/* Crisis Support */}
        <section className="card p-6">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
            If you need help right now
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-4">
            If you or someone you know is in crisis, please reach out to one of
            the services below. Help is available 24 hours a day, 7 days a week.
          </p>
          <ul className="space-y-3 text-[15px]">
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-semibold text-[var(--text-primary)]">Lifeline</span>
              <a href="tel:131114" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
                13 11 14
              </a>
            </li>
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-semibold text-[var(--text-primary)]">Open Arms Veterans &amp; Families Counselling</span>
              <a href="tel:1800011046" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
                1800 011 046
              </a>
            </li>
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-semibold text-[var(--text-primary)]">Beyond Blue</span>
              <a href="tel:1300224636" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
                1300 22 4636
              </a>
            </li>
            <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-semibold text-[var(--text-primary)]">Emergency services</span>
              <a href="tel:000" className="text-[var(--primary)] hover:underline font-semibold whitespace-nowrap">
                000
              </a>
            </li>
          </ul>
        </section>

      </div>

    </main>
  );
}
