"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NavIcon from "@/components/NavIcons";
import Wordmark from "@/components/Wordmark";
import { useHash } from "@/components/Sidebar";
import { ASK_ITEM, CRISIS_LINES, DONATE_URL, HELP_ITEM, HOME_ITEM, NAV_GROUPS, isNavActive } from "@/lib/nav";

/**
 * Phone and tablet navigation: a floating glass bar with the wordmark and a
 * round hamburger button, which opens a glass drawer of links — Metabundle's
 * mobile menu. Hidden from `lg` up, where the Sidebar takes over.
 */
export default function TopBar() {
  const pathname = usePathname();
  const hash = useHash();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close on navigation (including hash jumps) and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = [HOME_ITEM, ASK_ITEM, HELP_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)];

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 lg:hidden">
      <div className="relative">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-3 py-2 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
          <Wordmark compact />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border-color)] bg-white/[0.04] text-[var(--text-primary)] transition-colors hover:bg-white/[0.08]"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <NavIcon name={open ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <>
            {/* Backdrop: a tap outside closes the drawer */}
            <button
              type="button"
              className="fixed inset-0 z-[-1] cursor-default bg-black/40"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div
              id="mobile-menu"
              className="glass-strong absolute left-0 right-0 top-full mt-2 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl p-3 shadow-2xl"
            >
              <nav className="flex flex-col" aria-label="Mobile">
                {items.map((item) => {
                  const active = isNavActive(item.href, pathname, hash);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[16px] font-medium transition-colors ${
                        active
                          ? "bg-white/[0.06] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-white/[0.04] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <NavIcon
                        name={item.icon}
                        className={`h-5 w-5 ${active ? "text-[var(--accent-2)]" : ""}`}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <Link
                href="/binaural"
                onClick={() => setOpen(false)}
                className="btn-primary mt-3 w-full"
              >
                Start listening
                <NavIcon name="arrow" className="h-4 w-4" />
              </Link>

              {DONATE_URL && (
                <a
                  href={DONATE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary mt-2 w-full"
                >
                  <NavIcon name="heart" className="h-4 w-4" />
                  Support the platform
                </a>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 pb-1 text-[12px] text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">If things are bad right now:</span>
                {CRISIS_LINES.map((line) => (
                  <a key={line.tel} href={`tel:${line.tel}`} className="hover:text-[var(--text-primary)]">
                    {line.name} <span className="font-semibold">{line.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
