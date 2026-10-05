import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { PROJECT_TITLES } from "@/data/ids";
import { patternById } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/dates";
import { formatPercent } from "@/lib/format";
import type { ProgressStat } from "@/lib/progress";
import type { ResolvedWeek } from "@/lib/roadmap";
import { weekDateRange } from "@/lib/schedule";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

interface WeekRowProps {
  /** The week number, even when its content has not been written yet. */
  number: number;
  week: ResolvedWeek | undefined;
  stat: ProgressStat | undefined;
  isCurrent: boolean;
  /** Start date of the plan, or null before hydration (dates are then omitted). */
  startDate: string | null;
}

export function WeekRow({ number, week, stat, isCurrent, startDate }: WeekRowProps) {
  const range = startDate ? weekDateRange(startDate, number) : null;
  const complete = stat !== undefined && stat.totalTasks > 0 && stat.doneTasks === stat.totalTasks;

  const badge = (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums",
        complete ? "bg-emerald-500 text-white" : isCurrent ? "bg-accent text-accent-foreground" : "bg-surface-muted text-muted",
      )}
    >
      {complete ? <CircleCheck className="size-5" aria-hidden="true" /> : number}
      {complete && <span className="sr-only">Week {number} complete</span>}
    </span>
  );

  if (!week) {
    return (
      <li className="flex items-center gap-3 px-4 py-3 opacity-60">
        {badge}
        <div>
          <p className="text-sm font-medium">Week {number}</p>
          <p className="text-xs text-muted">Not written yet{range && ` · ${formatDayMonth(range.start)} – ${formatDayMonth(range.end)}`}</p>
        </div>
      </li>
    );
  }

  const dsa = week.dsa.kind === "mock" ? "Mock interview" : (patternById.get(week.dsa.patternId)?.name ?? week.dsa.patternId);

  return (
    <li className={cn(isCurrent && "bg-accent-soft/50")}>
      <Link
        href={`/week/${number}`}
        aria-current={isCurrent ? "date" : undefined}
        className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 hover:bg-surface-muted/60"
      >
        {badge}
        <div className="min-w-0 flex-1 basis-60">
          <p className="font-medium">
            {week.title}
            {isCurrent && (
              <Badge tone="accent" className="ml-2 align-middle">
                current
              </Badge>
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
            {range && (
              <span>
                {formatDayMonth(range.start)} – {formatDayMonth(range.end)}
              </span>
            )}
            <span>DSA: {dsa}</span>
            {week.projectId && <span>Project: {PROJECT_TITLES[week.projectId]}</span>}
            {week.milestone && <span className="font-medium text-accent">{week.milestone}</span>}
          </p>
        </div>
        <div className="flex w-32 shrink-0 items-center gap-2">
          <ProgressBar value={stat?.percent ?? 0} label={`Week ${number} progress`} size="sm" className="flex-1" />
          <span className="w-9 text-right text-xs text-muted tabular-nums">{formatPercent(stat?.percent ?? 0)}</span>
        </div>
      </Link>
    </li>
  );
}
