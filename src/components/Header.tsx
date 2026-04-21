"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteName } from "@/config";

const NAV_LINKS = [
  { name: "Home",         href: "/"             },
  { name: "Instructions", href: "/instructions" },
  { name: "About",        href: "/about"        },
  { name: "Settings",     href: "/settings"     },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-[var(--background)] border-b border-[var(--border-color)]">
      <nav className="mx-auto max-w-[1400px] px-5" aria-label="Top">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex flex-col md:flex-row md:items-baseline md:gap-3">
            <span className="text-4xl md:text-5xl font-bold text-[var(--primary)] tracking-tight leading-none">
              {siteName}
            </span>
            <span className="text-[11px] md:text-[13px] font-medium text-[var(--text-secondary)] tracking-widest uppercase opacity-70 leading-none">
              The Core of Calm
            </span>
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────────── */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-semibold transition-colors relative ${
                  pathname === item.href
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[var(--primary)] rounded" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Mobile menu button ─────────────────────────────────────────────── */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile Navigation ──────────────────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1 px-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-base font-semibold ${
                    pathname === item.href
                      ? "text-[var(--text-primary)] bg-[var(--background-light)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
