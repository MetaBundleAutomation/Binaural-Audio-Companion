import Link from "next/link";
import { siteName } from "@/config";
import NavIcon from "@/components/NavIcons";

/**
 * "CRUX · The Core of Calm" with a small white chip carrying a headphones mark,
 * the way Metabundle's logo sits on a white chip so it reads on a dark surface.
 */
export default function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3"
      aria-label={`${siteName} home`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--primary-dark)] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:-translate-y-0.5">
        <NavIcon name="headphones" className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
          {siteName}
        </span>
        {!compact && (
          <span className="mt-1 whitespace-nowrap text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
            The Core of Calm
          </span>
        )}
      </span>
    </Link>
  );
}
