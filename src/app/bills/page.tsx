import type { Metadata } from "next";
import BillToolkit from "@/components/bills/BillToolkit";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Bill Toolkit | ${siteName}`,
  description: "A large-print list of household bills with a calendar, paid history, calculator and converter. Everything stays on your device.",
};

export default function BillsPage() {
  return (
    <main className="min-h-screen">
      <BillToolkit />
    </main>
  );
}
