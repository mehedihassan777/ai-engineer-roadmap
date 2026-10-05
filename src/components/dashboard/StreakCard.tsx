"use client";

import { Flame } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { PLAN } from "@/lib/content";
import { plural } from "@/lib/format";
import { computeDayStreak, computeWeekStreak } from "@/lib/streak";
import { sessionDates } from "@/lib/dsa-stats";
import { cn } from "@/lib/cn";
import { Card } from "../ui/Card";

interface StreakCardProps {
  today: string;
  startDate: string;
}

/** LeetCode streak: consecutive days with a logged problem, plus progress towards the weekly session target. */
export function StreakCard({ today, startDate }: StreakCardProps) {
  const { dsaLog } = useAppState();
  const target = PLAN.dsa.minSessionsPerWeek;

  const dates = sessionDates(dsaLog);
  const day = computeDayStreak(dates, today);
  const week = computeWeekStreak(dates, today, startDate, target);
  const sessions = Math.min(week.sessionsThisWeek, target);

  return (
    <Card className="p-5">
      <h2 className="text-sm font-medium text-muted">LeetCode streak</h2>
      <div className="mt-2 flex items-center gap-3">
        <Flame
          className={cn("size-9", day.current > 0 ? "text-orange-500" : "text-muted/50")}
          aria-hidden="true"
        />
        <p className="text-4xl font-semibold tabular-nums">
          {day.current}
          <span className="ml-1.5 text-base font-normal text-muted">{plural(day.current, "day")}</span>
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        Best: {day.best} {plural(day.best, "day")}
      </p>

      <div className="mt-4">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">This week&apos;s sessions</p>
        <div className="mt-2 flex items-center gap-2">
          {Array.from({ length: target }, (_, index) => (
            <span
              key={index}
              className={cn("size-3.5 rounded-full border", index < sessions ? "border-emerald-500 bg-emerald-500" : "border-line bg-surface-muted")}
              aria-hidden="true"
            />
          ))}
          <span className="ml-1 text-sm tabular-nums">
            {week.sessionsThisWeek} / {target}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">
          Weeks on target in a row: <span className="font-medium text-foreground tabular-nums">{week.current}</span> (best {week.best})
        </p>
      </div>

      {dsaLog.length === 0 && <p className="mt-3 text-sm text-muted">Log your first problem in the DSA tracker to start a streak.</p>}
    </Card>
  );
}
