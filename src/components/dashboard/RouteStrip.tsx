"use client";

import Link from "next/link";
import { useProgress } from "@/hooks/useProgress";
import { PHASES, PLAN } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatHours, formatPercent } from "@/lib/format";
import type { ScheduleInfo } from "@/lib/schedule";
import type { CSSProperties } from "react";

const weeksOf = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index);

function headline(info: ScheduleInfo): string {
  if (info.status === "not-started") return "Your plan starts soon";
  if (info.status === "finished") return `All ${PLAN.totalWeeks} weeks are behind you`;
  return `You are in week ${info.week} of ${PLAN.totalWeeks}`;
}

/** The whole plan as one numbered route: every week under its phase, filled as it gets done, the current week highlighted. */
export function RouteStrip({ info }: { info: ScheduleInfo }) {
  const { overall, byWeek } = useProgress();

  return (
    <section aria-labelledby="route-heading">
      <h1 id="route-heading" className="text-3xl leading-[1.08] font-bold tracking-tight sm:text-[2.75rem]">
        {headline(info)}
      </h1>
      <p className="mt-1 text-muted">
        <span className="font-semibold text-foreground tabular-nums">{formatPercent(overall.percent)}</span> of the plan is done:{" "}
        <span className="tabular-nums">
          {overall.doneTasks} of {overall.totalTasks} tasks, {formatHours(overall.doneHours)} of {formatHours(overall.totalHours)}
        </span>
        {overall.inProgressTasks > 0 && `, ${overall.inProgressTasks} in progress`}.
      </p>

      <ol className="mt-6 flex flex-col gap-5 sm:flex-row sm:gap-4" aria-label="Weeks by phase">
        {PHASES.map((phase) => {
          const weeks = weeksOf(phase.weeks[0], phase.weeks[1]);
          const style = { flexGrow: weeks.length, flexBasis: 0, "--n": weeks.length } as CSSProperties;
          return (
            <li key={phase.id} style={style} className="min-w-0">
              <p className="mb-2 truncate text-sm" title={phase.title}>
                <span className="font-semibold">Phase {phase.number}</span> <span className="text-muted">{phase.title}</span>
              </p>
              <ol className="grid grid-cols-8 gap-1 sm:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]">
                {weeks.map((number) => {
                  const percent = byWeek[number]?.percent ?? 0;
                  const current = info.status === "in-progress" && number === info.week;
                  const complete = percent >= 100;
                  return (
                    <li key={number}>
                      <Link
                        href={`/week/${number}`}
                        aria-current={current ? "date" : undefined}
                        aria-label={`Week ${number}, ${formatPercent(percent)} done${current ? ", this week" : ""}`}
                        className={cn(
                          "relative flex h-12 items-end justify-center overflow-hidden rounded-[4px] border pb-1 font-display text-sm font-bold tabular-nums transition-colors sm:h-16",
                          current
                            ? "border-foreground bg-highlight text-highlight-foreground"
                            : complete
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-line bg-surface text-muted hover:border-accent hover:text-foreground",
                        )}
                      >
                        {percent > 0 && (current || !complete) && (
                          <span
                            aria-hidden="true"
                            className={cn("absolute inset-x-0 bottom-0", current ? "bg-foreground/15" : "bg-accent/25")}
                            style={{ height: `${percent}%` }}
                          />
                        )}
                        <span className="relative">{number}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
