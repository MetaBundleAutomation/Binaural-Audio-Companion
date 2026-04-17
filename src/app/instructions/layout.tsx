import type { Metadata } from "next";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Instructions | ${siteName}`,
};

export default function InstructionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
