import type { Metadata } from "next";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Settings | ${siteName}`,
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
