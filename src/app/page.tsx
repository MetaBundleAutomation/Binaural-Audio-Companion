import LaunchRedirect from "@/components/LaunchRedirect";
import LibraryHome from "@/components/LibraryHome";

// The home screen is the library: every tool, page and partner site in one
// place, with the guide's ask bar on top. See `src/lib/library.ts`.
export default function Home() {
  return (
    <main className="min-h-screen">
      <LaunchRedirect />
      <LibraryHome />
    </main>
  );
}
