"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useProgress } from "@/hooks/useProgress";
import { formatPercent } from "@/lib/format";
import { ProgressBar } from "../ui/ProgressBar";
import { Skeleton } from "../ui/Skeleton";

/** Overall completion at a glance, at the bottom of the sidebar. */
export function SidebarProgress() {
  const hydrated = useHydrated();
  const { overall } = useProgress();

  if (!hydrated) return <Skeleton className="h-10 w-full" />;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-xs text-muted">
        <span>Overall progress</span>
        <span className="font-medium text-foreground tabular-nums">{formatPercent(overall.percent)}</span>
      </div>
      <ProgressBar value={overall.percent} label="Overall progress" size="sm" />
    </div>
  );
}
