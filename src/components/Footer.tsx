export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-20 py-10 px-5 text-[var(--text-secondary)]">

      {/* Metabundle funding line */}
      <p className="text-center text-[13px] font-semibold mb-6 opacity-80">
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

      {/* Contact block */}
      <div className="flex flex-col items-center gap-1 text-[13px] mb-6 opacity-70">
        <p className="font-semibold text-[var(--text-primary)] opacity-100">Contact</p>
        <a
          href="mailto:Joshua@metabundle.ai"
          className="hover:text-[var(--primary)] transition-colors"
        >
          Joshua@metabundle.ai
        </a>
        <a
          href="tel:+61402503653"
          className="hover:text-[var(--primary)] transition-colors"
        >
          0402 503 653
        </a>
        <a
          href="https://metabundle.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--primary)] transition-colors"
        >
          metabundle.ai
        </a>
      </div>

      {/* Legal */}
      <div className="text-center text-[12px] opacity-50 space-y-1">
        <p>&copy; {new Date().getFullYear()} MindFlow. All rights reserved.</p>
        <p>For educational and wellness purposes only. Not intended to diagnose or treat medical conditions.</p>
      </div>

    </footer>
  );
}
