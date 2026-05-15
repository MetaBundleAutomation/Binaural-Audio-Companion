import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-20 px-5 pt-10 pb-8 text-[var(--text-secondary)]">

      {/* ── Two-column block: Contact | Legal ── */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 gap-8 mb-8 text-[13px]">

        {/* Contact */}
        <div>
          <p className="font-semibold text-[var(--text-primary)] mb-1 text-[12px] uppercase tracking-widest opacity-60">
            Contact
          </p>
          <p className="text-[13px] opacity-80 mb-3">
            This website and application is funded and powered by{" "}
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
          <div className="space-y-1.5 opacity-80">
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
        </div>

        {/* Legal */}
        <div>
          <p className="font-semibold text-[var(--text-primary)] mb-3 text-[12px] uppercase tracking-widest opacity-60">
            Legal
          </p>
          <div className="space-y-1.5 opacity-80">
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
      <div className="text-center text-[12px] opacity-60 space-y-1">
        <p>For educational and wellness purposes only. Not a substitute for professional medical care.</p>
        <p>&copy; {new Date().getFullYear()} CRUX. All rights reserved.</p>
      </div>

    </footer>
  );
}
