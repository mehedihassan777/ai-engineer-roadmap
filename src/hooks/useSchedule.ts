"use client";

import { useMemo } from "react";
import { PLAN, roadmap } from "@/lib/content";
import { getSchedule, type ScheduleInfo } from "@/lib/schedule";
import type { ResolvedWeek } from "@/lib/roadmap";
import { useAppState } from "./useAppState";
import { useToday } from "./useToday";

export interface ScheduleState {
  /** False until the client knows today's date and the saved start date. */
  ready: boolean;
  today: string;
  startDate: string;
  info: ScheduleInfo | null;
  /** The content for the current week, if it has been written yet. */
  currentWeek: ResolvedWeek | null;
}

/** Where "today" falls in the plan: not started, in progress (which week) or finished. */
export function useSchedule(): ScheduleState {
  const { startDate } = useAppState();
  const today = useToday();

  return useMemo(() => {
    if (today === "") return { ready: false, today, startDate, info: null, currentWeek: null };
    const info = getSchedule(startDate, today, PLAN.totalWeeks);
    return { ready: true, today, startDate, info, currentWeek: roadmap.weeksByNumber.get(info.week) ?? null };
  }, [today, startDate]);
}
