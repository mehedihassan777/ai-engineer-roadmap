import { CalendarCheck, ChartGantt, LayoutDashboard, ListChecks, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Sidebar navigation. Add an entry here when you add a top-level page. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Plan",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/week", label: "This week", icon: CalendarCheck },
      { href: "/timeline", label: "Timeline", icon: ChartGantt },
      { href: "/tasks", label: "All tasks", icon: ListChecks },
    ],
  },
  {
    label: "App",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

/** "/week" is active for "/week" and "/week/3"; "/" only for the dashboard itself. */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
