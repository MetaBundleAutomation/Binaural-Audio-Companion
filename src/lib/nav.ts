import type { NavIconName } from "@/components/NavIcons";

/**
 * The app's navigation, used by the desktop sidebar and the phone drawer.
 * Tool links point at sections of the home page for now; when each tool gets
 * its own page these become routes and nothing else has to change.
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

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Tools",
    items: [
      { label: "Binaural Beats", href: "/#player",        icon: "headphones", tagline: "Sessions for focus, calm and sleep" },
      { label: "Noise Therapy",  href: "/#noise",         icon: "waves",      tagline: "Steady sound to settle the alarm" },
      { label: "Breathing",      href: "/#box-breathing", icon: "wind",       tagline: "Box breathing and coherence" },
      { label: "Body Scan",      href: "/#body-scan",     icon: "body",       tagline: "Guided, head to toe" },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Your Brain",   href: "/#brain-science", icon: "brain", tagline: "What the loop is and why it feels this way" },
      { label: "Instructions", href: "/instructions",   icon: "book",  tagline: "How to use each tool" },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "The Room", href: "/#room", icon: "chat", tagline: "Say hello to whoever is up" },
    ],
  },
  {
    title: "More",
    items: [
      { label: "About",    href: "/about",    icon: "info" },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export const HOME_ITEM: NavItem = { label: "Home", href: "/", icon: "home" };

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
