import type { PlanConfig } from "./types";

/**
 * The one file to tweak for the time budget.
 *
 * Estimated hours for every task are derived from this (see src/lib/time-budget.ts):
 * a track's weekly hours = weeklyHours x its share in `split`, divided between that week's tasks by `weight`.
 * Change a number here and every week rescales - no task needs editing.
 *
 * Default budget: AI 6.75 h, AI-assisted 1.5 h, system design 3 h, fundamentals 1.5 h, DSA 2.25 h = 15 h/week.
 */
export const PLAN: PlanConfig = {
  totalWeeks: 24,
  weeklyHours: 15,
  split: {
    ai: 0.45,
    assisted: 0.1,
    design: 0.2,
    fundamentals: 0.1,
    dsa: 0.15,
  },
  dsa: {
    /** Every week must contain at least this many DSA session tasks. */
    minSessionsPerWeek: 3,
    /** Weeks 6, 12, 18, 24 are timed mock-interview weeks. */
    mockWeekEvery: 6,
  },
  /** Per-task estimates are rounded to quarter hours and always add up exactly to the track budget. */
  hourStep: 0.25,
};
