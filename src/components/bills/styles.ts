/** Shared form styles for the Bill Toolkit: large, high-contrast, 48px tall. */

export const FIELD =
  "min-h-12 w-full rounded-2xl border border-[var(--border-color)] bg-[var(--surface-solid)] px-4 text-[16px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--primary)]";

export const LABEL = "mb-1.5 block text-[15px] font-semibold text-[var(--text-primary)]";

export const SECTION_TITLE = "text-[22px] font-bold leading-none text-[var(--text-primary)]";

/** A pill that is on or off: the tab switch, range presets and topic pickers. */
export function pill(on: boolean): string {
  return `inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-[15px] font-semibold transition-colors cursor-pointer ${
    on
      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--text-primary)]"
      : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--text-primary)]"
  }`;
}
