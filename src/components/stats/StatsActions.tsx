"use client";

import { useRef, useState } from "react";

/** "Copy these findings": puts the key findings on the clipboard as plain text, ready for a proposal. */
export function CopyFindings({ text }: { text: string }) {
  const [notice, setNotice] = useState("");
  const timer = useRef<number | null>(null);

  const say = (message: string) => {
    setNotice(message);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(""), 4000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      say("Copied.");
    } catch {
      // Older browsers: a hidden text box.
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      const done = document.execCommand("copy");
      box.remove();
      say(done ? "Copied." : "Couldn't copy. Select the text and copy it instead.");
    }
  };

  return (
    <span className="no-print inline-flex items-center gap-3">
      <button type="button" onClick={copy} className="btn-secondary min-h-11 px-4 py-2 text-[14px]">
        Copy these findings
      </button>
      <span role="status" aria-live="polite" className="text-[14px] font-semibold text-[var(--text-primary)]">
        {notice}
      </span>
    </span>
  );
}

/** "Save as PDF": the browser's print dialog, where "Save as PDF" is one of the printers. */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="no-print btn-ghost min-h-11">
      Save as PDF or print
    </button>
  );
}
