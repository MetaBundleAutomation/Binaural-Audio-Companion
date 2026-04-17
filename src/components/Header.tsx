"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteName } from "@/config";

const LIBRARY_LINKS = [
  { name: "Audio Library",  href: "/#library" },
  { name: "Noise Therapy",  href: "/#noise" },
  { name: "Box Breathing",  href: "/#box-breathing" },
];

const FLAT_LINKS = [
  { name: "Home",         href: "/" },
  { name: "Benefits",     href: "/#features" },
  { name: "Instructions", href: "/instructions" },
  { name: "About",        href: "/about" },
  { name: "Settings",     href: "/settings" },
];

const Header = () => {
  const [isMenuOpen,        setIsMenuOpen]        = useState(false);
  const [libraryOpen,       setLibraryOpen]       = useState(false);
  const [mobileLibraryOpen, setMobileLibraryOpen] = useState(false);
  const pathname      = usePathname();
  const dropdownRef   = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLibraryOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <header className="bg-[var(--background)] border-b border-[var(--border-color)]">
      <nav className="mx-auto max-w-[1400px] px-5" aria-label="Top">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link
            href="/"
            className="text-4xl md:text-5xl font-bold text-[var(--primary)] tracking-tight"
          >
            {siteName}
          </Link>

          {/* ── Desktop Navigation ─────────────────────────────────────────────── */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {FLAT_LINKS.map((item) => (
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

            {/* Library dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setLibraryOpen((v) => !v)}
                className="flex items-center gap-1.5 text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-haspopup="true"
                aria-expanded={libraryOpen}
              >
                Library
                <svg
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 transition-transform duration-200 ${libraryOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {libraryOpen && (
                <div
                  className="absolute right-0 top-full mt-3 w-52 rounded-2xl border border-[var(--border-color)] bg-[var(--background-card)] py-2 z-50"
                  style={{ boxShadow: "var(--shadow-lg)" }}
                >
                  {LIBRARY_LINKS.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setLibraryOpen(false)}
                      className="block px-5 py-3 text-[15px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-light)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Mobile menu button ─────────────────────────────────────────────── */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
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
              {FLAT_LINKS.map((item) => (
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

              {/* Mobile Library accordion */}
              <div>
                <button
                  onClick={() => setMobileLibraryOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-md px-3 py-2 text-base font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Library
                  <svg
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 transition-transform duration-200 ${mobileLibraryOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileLibraryOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--border-color)] pl-3">
                    {LIBRARY_LINKS.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block rounded-md px-3 py-2 text-[14px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileLibraryOpen(false);
                        }}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
