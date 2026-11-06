import type { Metadata } from "next";
import Guide from "@/components/Guide";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Ask | ${siteName}`,
  description: "Say what you need in your own words and CRUX points you to the right tool or page.",
};

export default function AskPage() {
  return (
    <main className="min-h-screen">
      <Guide />
    </main>
  );
}
