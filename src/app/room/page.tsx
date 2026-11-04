import type { Metadata } from "next";
import { siteName } from "@/config";
import LiveChat from "@/components/LiveChat";

export const metadata: Metadata = {
  title: `The Room | ${siteName}`,
  description: "Say hello to whoever is up. No accounts, nothing kept past 24 hours.",
};

export default function RoomPage() {
  return (
    <main className="max-w-[1400px] mx-auto px-5">
      <LiveChat />
    </main>
  );
}
