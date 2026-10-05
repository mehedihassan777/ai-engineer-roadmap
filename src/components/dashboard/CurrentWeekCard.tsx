"use client";

import { ArrowRight } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { PLAN, phaseById, trackById } from "@/lib/content";
import { formatDayMonth } from "@/lib/dates";
import { formatHours, formatPercent } from "@/lib/format";
import { weekProgress } from "@/lib/progress";
import type { ResolvedWeek } from "@/lib/roadmap";
import { weekDateRange, type ScheduleInfo } from "@/lib/schedule";
import { Badge } from "../ui/Badge";
import { LinkButton } from "../ui/Button";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { TRACK_STYLES } from "../ui/track-styles";
import { cn } from "@/lib/cn";

const NEXT_UP_COUNT = 4;

interface CurrentWeekCardProps {
  info: ScheduleInfo;
  /** The week's content, or null when it has not been written yet. */
  week: ResolvedWeek | null;
  startDate: string;
}

export function CurrentWeekCard({ info, week, startDate }: CurrentWeekCardProps) {
  const { tasks: statuses } = useAppState();
  const range = weekDateRange(startDate, info.week);
  const label = info.status === "finished" ? "Final week" : info.status === "not-started" ? "Starts soon" : "Current week";

  if (!week) {
    return (
      <Card className="p-5 lg:col-span-2">
        <h2 className="text-sm font-medium text-muted">{label}</h2>
        <p className="mt-2 text-lg font-semibold">Week {info.week} is not in the roadmap content yet</p>
        <p className="mt-1 text-sm text-muted">Add it under src/data/weeks and register it in weeks/index.ts.</p>
      </Card>
    );
  }

  const stat = weekProgress(week, statuses);
  const nextUp = week.tasks
    .filter((task) => statuses[task.id] !== "done")
    .sort((a, b) => Number(statuses[b.id] === "in-progress") - Number(statuses[a.id] === "in-progress"))
    .slice(0, NEXT_UP_COUNT);
  const phase = phaseById.get(week.phaseId);

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-muted">
            {label} · Week {week.number} of {PLAN.totalWeeks}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {formatDayMonth(range.start)} – {formatDayMonth(range.end)}
            {phase && ` · Phase ${phase.number}: ${phase.title}`}
          </p>
        </div>
        {week.milestone && <Badge tone="accent">{week.milestone}</Badge>}
      </div>

      <p className="mt-3 text-lg font-semibold">{week.title}</p>
      <div className="mt-3 flex items-center gap-3">
        <ProgressBar value={stat.percent} label={`Week ${week.number} progress`} className="flex-1" />
        <span className="w-10 text-right text-sm font-medium tabular-nums">{formatPercent(stat.percent)}</span>
      </div>
      <p className="mt-2 text-sm text-muted">
        {stat.doneTasks} of {stat.totalTasks} tasks · {formatHours(stat.doneHours)} of {formatHours(stat.totalHours)}
      </p>

      {nextUp.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Next up</h3>
          <ul className="mt-2 space-y-1.5">
            {nextUp.map((task) => {
              const track = trackById.get(task.track);
              return (
                <li key={task.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", track ? TRACK_STYLES[track.color].dot : "bg-muted")}
                    title={track?.name}
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    {task.title}
                    <span className="sr-only"> ({track?.name})</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted tabular-nums">{formatHours(task.hours)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300">Everything planned for this week is done.</p>
      )}

      <LinkButton href={`/week/${week.number}`} variant="secondary" size="sm" className="mt-4">
        Open this week
        <ArrowRight className="size-4" aria-hidden="true" />
      </LinkButton>
    </Card>
  );
}
