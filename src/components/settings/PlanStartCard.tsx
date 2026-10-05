"use client";

import { useId } from "react";
import { actions, useAppState } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { useSchedule } from "@/hooks/useSchedule";
import { PLAN } from "@/lib/content";
import { formatDate, formatDayMonth, todayString } from "@/lib/dates";
import { plural } from "@/lib/format";
import { weekDateRange } from "@/lib/schedule";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

function statusLine(schedule: ReturnType<typeof useSchedule>): string {
  const { info, startDate } = schedule;
  if (!info) return "";
  if (info.status === "not-started") {
    return `Your plan starts in ${info.daysUntilStart} ${plural(info.daysUntilStart, "day")}.`;
  }
  const range = weekDateRange(startDate, info.week);
  const span = `${formatDayMonth(range.start)} – ${formatDayMonth(range.end)}`;
  if (info.status === "finished") return `The ${PLAN.totalWeeks}-week window ended on ${formatDate(range.end)}.`;
  return `Today is in week ${info.week} of ${PLAN.totalWeeks} (${span}).`;
}

export function PlanStartCard() {
  const inputId = useId();
  const hydrated = useHydrated();
  const { startDate } = useAppState();
  const schedule = useSchedule();

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Plan start date</h2>
      <p className="mt-1 text-sm text-muted">
        Week 1 starts on this date and the current week follows the calendar. If you fall behind, move it, or use the Carry-over list
        on the dashboard.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
            Start date
          </label>
          {hydrated ? (
            <input
              id={inputId}
              type="date"
              value={startDate}
              onChange={(event) => actions.setStartDate(event.target.value)}
              className="h-10 rounded-lg border border-line bg-background px-3 text-sm"
            />
          ) : (
            <Skeleton className="h-10 w-44" />
          )}
        </div>
        <Button variant="secondary" onClick={() => actions.setStartDate(todayString())} disabled={!hydrated}>
          Start today
        </Button>
      </div>
      {schedule.ready && <p className="mt-3 text-sm text-muted">{statusLine(schedule)}</p>}
    </Card>
  );
}
