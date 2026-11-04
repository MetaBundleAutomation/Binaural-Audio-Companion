import type { Metadata } from "next";
import { siteName } from "@/config";
import BrainScience from "@/components/BrainScience";

export const metadata: Metadata = {
  title: `Your Brain | ${siteName}`,
  description:
    "What trauma and long-term pain change in the brain, and why it feels the way it does. No jargon, no blame, just the mechanics.",
};

export default function BrainPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-5">
      <BrainScience />
    </main>
  );
}
