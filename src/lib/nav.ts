import type { NavIconName } from "@/components/NavIcons";
import { feature } from "@/lib/library";

/**
 * The app's navigation, used by the desktop sidebar and the phone drawer.
 * Every tool has its own page; the four audio tools are rendered by ToolStage
 * so they keep playing across navigation. Labels, icons and taglines come from
 * the library (`library.ts`), which also feeds the home screen and the guide.
 */

export interface NavItem {
  label: string;
  href: string;
  icon: NavIconName;
  /** Short line under the label in the drawer and on the home grid. */
  tagline?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/** A navigation entry for a library feature, so labels and icons never drift. */
function item(id: string): NavItem {
  const f = feature(id);
  return { label: f.label, href: f.href, icon: f.icon, tagline: f.tagline };
}

export const NAV_GROUPS: NavGroup[] = [
  { title: "Tools",     items: ["binaural", "noise", "breathe", "body-scan"].map(item) },
  { title: "Learn",     items: ["brain", "instructions"].map(item) },
  { title: "Community", items: ["room"].map(item) },
  { title: "More",      items: ["about", "settings"].map(item) },
];

export const HOME_ITEM: NavItem = { label: "Home", href: "/", icon: "home" };

/** The guide sits straight under Home in the sidebar and the drawer. */
export const ASK_ITEM: NavItem = item("ask");

export const CRISIS_LINES = [
  { name: "Open Arms", number: "1800 011 046", tel: "1800011046" },
  { name: "Lifeline",  number: "13 11 14",     tel: "131114" },
];

export const DONATE_URL = process.env.NEXT_PUBLIC_DONATE_URL || null;

/** True when `href` is the page (and, for section links, the section) being shown. */
export function isNavActive(href: string, pathname: string, hash: string): boolean {
  if (href === "/") return pathname === "/" && hash === "";
  if (href.startsWith("/#")) return pathname === "/" && `/${hash}` === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
