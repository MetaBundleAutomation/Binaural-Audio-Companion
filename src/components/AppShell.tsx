import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/**
 * Page chrome: a fixed sidebar from `lg` up, a floating top bar with a drawer
 * below that, and the content column beside / under them. The footer is passed
 * in as part of `children` so it scrolls with the page inside the column.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-60">
        <TopBar />
        {children}
      </div>
    </div>
  );
}
