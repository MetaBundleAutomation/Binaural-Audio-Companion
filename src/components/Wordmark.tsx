import Link from "next/link";
import { siteName } from "@/config";
import NavIcon from "@/components/NavIcons";

/**
 * The site name beside a small white chip carrying a headphones mark, the way
 * Metabundle's logo sits on a white chip so it reads on a dark surface.
 *
 * The name is long, so it is set small in the condensed display face and
 * allowed to wrap over two or three balanced lines. `compact` is the phone
 * top bar, where it has to fit beside the menu button.
 */
export default function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex min-w-0 items-center gap-3"
      aria-label={`${siteName} home`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--primary-dark)] shadow-[0_8px_24px_-10px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:-translate-y-0.5">
        <NavIcon name="headphones" className="h-5 w-5" />
      </span>
      <span
        className={`display min-w-0 text-balance font-bold leading-[1.1] text-[var(--text-primary)] ${
          compact ? "max-w-[13.5rem] text-[14px]" : "text-[15px]"
        }`}
      >
        {siteName}
      </span>
    </Link>
  );
}
