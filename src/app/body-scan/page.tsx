import type { Metadata } from "next";
import { siteName } from "@/config";

export const metadata: Metadata = {
  title: `Body Scan | ${siteName}`,
};

// The tool itself is rendered by ToolStage in the root layout, so it keeps
// playing when you move to another page. This file is the route and its title.
export default function Page() {
  return <h1 className="sr-only">Body Scan</h1>;
}
