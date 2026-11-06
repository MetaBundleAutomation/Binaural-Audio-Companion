"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavIcon from "@/components/NavIcons";
import Wordmark from "@/components/Wordmark";
import { ASK_ITEM, CRISIS_LINES, DONATE_URL, HOME_ITEM, NAV_GROUPS, isNavActive } from "@/lib/nav";

/** The browser's current `#hash`, kept fresh so section links can show as active. */
export function useHash(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

/**
 * Desktop navigation: a fixed left rail in the style of Metabundle's dashboard
 * sidebar. Hidden below `lg`, where TopBar's drawer takes over.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const hash = useHash();

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors ${
      active
        ? "bg-white/[0.06] text-[var(--text-primary)]"
        : "text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-[var(--text-primary)]"
    }`;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-[var(--border-color)] px-4 py-6 lg:flex"
      style={{ background: "color-mix(in srgb, var(--surface-solid) 55%, transparent)" }}
      aria-label="Sidebar"
    >
      <div className="mb-6 px-2">
        <Wordmark />
      </div>

      <nav className="flex flex-col gap-5" aria-label="Primary">
        <div className="flex flex-col gap-0.5">
          {[HOME_ITEM, ASK_ITEM].map((item) => {
            const active = isNavActive(item.href, pathname, hash);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={linkClass(active)}
              >
                <NavIcon name={item.icon} className={`h-5 w-5 ${active ? "text-[var(--accent-2)]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="mb-1.5 px-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              {group.title}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isNavActive(item.href, pathname, hash);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={linkClass(active)}
                  >
                    <NavIcon
                      name={item.icon}
                      className={`h-5 w-5 ${active ? "text-[var(--accent-2)]" : ""}`}
                    />
                    {item.label}
                    {active && (
                      <span
                        className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent-2)]"
                        style={{ boxShadow: "0 0 8px var(--accent-2)" }}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4 pt-8">
        {DONATE_URL && (
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-[14px]"
          >
            <NavIcon name="heart" className="h-4 w-4" />
            Support the platform
          </a>
        )}
        <div className="rounded-xl border border-[var(--border-color)] bg-white/[0.02] px-3 py-3 text-[12px] leading-relaxed text-[var(--text-secondary)]">
          <div className="mb-1 font-semibold text-[var(--text-primary)]">If things are bad right now</div>
          {CRISIS_LINES.map((line) => (
            <a
              key={line.tel}
              href={`tel:${line.tel}`}
              className="block hover:text-[var(--text-primary)]"
            >
              {line.name} <span className="font-semibold">{line.number}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
