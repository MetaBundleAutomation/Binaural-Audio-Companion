import {
  CONDITION_EVIDENCE_META,
  type ConditionEvidence,
} from "@/lib/conditions";

// The condition evidence badge. Same calm pill as the wheel's own EvidenceBadge,
// but on the Community Treatment Platform's richer four-level scale (strong /
// promising / traditional / anecdotal). The coloured dot shows the level; the
// words say what it means, so it never relies on colour alone.
export default function ConditionEvidenceBadge({
  level,
}: {
  level: ConditionEvidence;
}) {
  const meta = CONDITION_EVIDENCE_META[level];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--background-light)",
        color: "var(--text-primary)",
      }}
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
