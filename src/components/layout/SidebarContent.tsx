"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import { PLAN } from "@/data/constants";
import { SidebarNav } from "./SidebarNav";
import { SidebarProgress } from "./SidebarProgress";
import { ThemeToggle } from "./ThemeToggle";

/** Brand, navigation and footer controls. Used by the desktop sidebar and the mobile drawer. */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <Link href="/" onClick={onNavigate} className="flex items-center gap-3 px-6 pt-6 pb-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Rocket className="size-5" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold">AI Engineer Roadmap</span>
          <span className="block text-xs text-muted">
            {PLAN.totalWeeks} weeks · {PLAN.weeklyHours} h/week
          </span>
        </span>
      </Link>
      <SidebarNav onNavigate={onNavigate} />
      <div className="space-y-4 border-t border-line p-4">
        <SidebarProgress />
        <ThemeToggle />
      </div>
    </div>
  );
}
