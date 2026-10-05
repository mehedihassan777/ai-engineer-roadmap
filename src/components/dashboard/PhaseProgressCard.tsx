"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { PHASES } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatPercent } from "@/lib/format";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function PhaseProgressCard({ currentWeek }: { currentWeek: number }) {
  const { byPhase } = useProgress();

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">Progress by phase</h2>
        <Link href="/timeline" className="text-sm text-accent hover:underline">
          Timeline
        </Link>
      </div>
      <ul className="mt-4 space-y-4">
        {PHASES.map((phase) => {
          const stat = byPhase[phase.id];
          const current = currentWeek >= phase.weeks[0] && currentWeek <= phase.weeks[1];
          return (
            <li key={phase.id} className={cn("rounded-lg", current && "bg-accent-soft/60 p-3 -m-3")}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">
                  Phase {phase.number}: {phase.title}
                  {current && (
                    <Badge tone="accent" className="ml-2 align-middle">
                      current
                    </Badge>
                  )}
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
    </Card>
  );
}
