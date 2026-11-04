import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-20 text-[var(--text-secondary)]">
      <div className="max-w-5xl mx-auto px-5 py-10">

        {/* ── Three columns: Brand | Contact | Legal ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-[13px]">

          {/* Brand */}
          <div>
            <p className="text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">
              CRUX
            </p>
            <p className="mt-1">The Core of Calm</p>
            <p className="mt-3 leading-relaxed">
              Funded and powered by{" "}
              <a
                href="https://metabundle.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
              >
                Metabundle
              </a>
              .
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-[var(--text-primary)] mb-3 text-[12px] uppercase tracking-widest opacity-60">
              Contact
            </p>
            <div className="space-y-1.5">
              <a
                href="mailto:Joshua@metabundle.ai"
                className="block hover:text-[var(--primary)] transition-colors"
              >
                Joshua@metabundle.ai
              </a>
              <a
                href="tel:+61402503653"
                className="block hover:text-[var(--primary)] transition-colors"
              >
                0402 503 653
              </a>
              <a
                href="https://metabundle.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-[var(--primary)] transition-colors"
              >
                metabundle.ai
              </a>
            </div>
            <p className="mt-3 text-[11px] opacity-60 italic leading-snug">
              Business enquiries only. For support and crisis resources, please visit our{" "}
              <Link href="/instructions" className="underline hover:opacity-80">Instructions page</Link>.
            </p>
          </div>

          {/* Legal */}
          <div>
            <p className="font-semibold text-[var(--text-primary)] mb-3 text-[12px] uppercase tracking-widest opacity-60">
              Legal
            </p>
            <div className="space-y-1.5">
              <Link
                href="/disclaimer"
                className="block hover:text-[var(--primary)] transition-colors"
              >
                Disclaimer
              </Link>
            </div>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-[12px] text-[var(--text-secondary)]">
          <p>For educational and wellness purposes only. Not a substitute for professional medical care.</p>
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} CRUX. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
