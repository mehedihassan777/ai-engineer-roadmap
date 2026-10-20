"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { PHASES } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { ProgressBar } from "../ui/ProgressBar";

export function PhaseProgressCard({ currentWeek }: { currentWeek: number }) {
  const { byPhase } = useProgress();

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">Progress by phase</h2>
        <Link href="/timeline" className="text-sm text-accent hover:underline">
          Timeline
        </Link>
      </div>
      <ul className="mt-4 space-y-4">
        {PHASES.map((phase) => {
          const stat = byPhase[phase.id];
          const current = currentWeek >= phase.weeks[0] && currentWeek <= phase.weeks[1];
          return (
            <li key={phase.id}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">
                  <span className={cn(current && "marker")}>
                    Phase {phase.number}: {phase.title}
                  </span>
                  {current && <span className="sr-only"> (current phase)</span>}
                </span>
                <span className="shrink-0 text-muted tabular-nums">{stat ? formatPercent(stat.percent) : "0%"}</span>
              </div>
              <ProgressBar value={stat?.percent ?? 0} label={`Phase ${phase.number} progress`} />
              <p className="mt-1 text-xs text-muted">
                Weeks {phase.weeks[0]}–{phase.weeks[1]}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
