import { EVIDENCE_META, type EvidenceLevel } from "@/lib/topics";

// A small, calm evidence badge. The coloured dot shows the level; the words say
// what it means, so it reads correctly without relying on colour. Same idea as
// the Community Treatment Platform's EvidenceBadge, in CRUX's own tokens.
export default function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const meta = EVIDENCE_META[level];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold"
      style={{ borderColor: "var(--border-color)", background: "var(--background-light)", color: "var(--text-primary)" }}
      title={meta.note}
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: meta.dot }}
        aria-hidden="true"
      />
      {meta.label}
    </span>
  );
}
