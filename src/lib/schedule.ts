import { addDays, diffInDays } from "./dates";

export type ScheduleStatus = "not-started" | "in-progress" | "finished";

export interface ScheduleInfo {
  status: ScheduleStatus;
  /** The week to show: the current week, clamped to 1..totalWeeks. */
  week: number;
  /** Days until week 1 starts (0 once it has started). */
  daysUntilStart: number;
}

/** Week 1 starts on `startDate`; each week is seven calendar days. */
export function getSchedule(startDate: string, today: string, totalWeeks: number): ScheduleInfo {
  const elapsed = diffInDays(today, startDate);
  if (elapsed < 0) return { status: "not-started", week: 1, daysUntilStart: -elapsed };
  const week = Math.floor(elapsed / 7) + 1;
  if (week > totalWeeks) return { status: "finished", week: totalWeeks, daysUntilStart: 0 };
  return { status: "in-progress", week, daysUntilStart: 0 };
}

/** First and last calendar day (inclusive) of a plan week. */
export function weekDateRange(startDate: string, week: number): { start: string; end: string } {
  const start = addDays(startDate, (week - 1) * 7);
  return { start, end: addDays(start, 6) };
}
