"use client";

import Link from "next/link";
import { PLAN } from "@/data/constants";
import { SyncIndicator } from "../sync/SyncIndicator";
import { SidebarNav } from "./SidebarNav";
import { SidebarProgress } from "./SidebarProgress";
import { ThemeToggle } from "./ThemeToggle";

/** Brand, navigation and footer controls. Used by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="block px-6 pt-7 pb-3">
        <span className="block font-display text-xl leading-tight font-bold tracking-tight">
          AI Engineer
          <br />
          Roadmap
        </span>
        <span className="mt-1 block text-sm text-muted">
          {PLAN.totalWeeks} weeks, {PLAN.weeklyHours} hours a week
        </span>
      </Link>
      <SidebarNav onNavigate={onNavigate} />
      <div className="space-y-4 border-t border-line p-4">
        <SidebarProgress />
        <SyncIndicator />
        <ThemeToggle />
      </div>
    </div>
  );
}
