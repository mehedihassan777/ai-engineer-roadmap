import { addDays, diffInDays } from "./dates";

/**
 * A DSA "session" is a day on which at least one problem was logged. Dates after `today` are ignored
 * (a typo or a clock change must not inflate a streak).
 */

const uniquePastDates = (dates: string[], today: string): string[] =>
  [...new Set(dates.filter((date) => date <= today))].sort();

export interface DayStreak {
  current: number;
  best: number;
}

/**
 * Consecutive days with a logged problem. The current streak is not broken until a whole day has passed
 * without a log, so a streak that ended yesterday still counts today.
 */
export function computeDayStreak(dates: string[], today: string): DayStreak {
  const days = uniquePastDates(dates, today);
  const set = new Set(days);

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of days) {
    run = previous !== null && diffInDays(day, previous) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  let cursor = set.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}

export interface WeekStreak {
  /** Consecutive plan weeks that reached the session target. */
  current: number;
  best: number;
  /** Distinct session days in the current plan week. */
  sessionsThisWeek: number;
}

/**
 * Consecutive plan weeks (7 days each, anchored on `startDate`) with at least `minSessions` session days.
 * The current week does not break the streak while it is still in progress.
 */
export function computeWeekStreak(
  dates: string[],
  today: string,
  startDate: string,
  minSessions: number,
): WeekStreak {
  const target = Math.max(1, minSessions);
  const sessionsByWeek = new Map<number, number>();
  for (const day of uniquePastDates(dates, today)) {
    const week = Math.floor(diffInDays(day, startDate) / 7);
    sessionsByWeek.set(week, (sessionsByWeek.get(week) ?? 0) + 1);
  }

  const meets = (week: number) => (sessionsByWeek.get(week) ?? 0) >= target;
  const thisWeek = Math.floor(diffInDays(today, startDate) / 7);

  const qualifying = [...sessionsByWeek.keys()].filter(meets).sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const week of qualifying) {
    run = previous !== null && week === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = week;
  }

  let cursor = meets(thisWeek) ? thisWeek : thisWeek - 1;
  let current = 0;
  while (meets(cursor)) {
    current += 1;
    cursor -= 1;
  }
  return { current, best, sessionsThisWeek: sessionsByWeek.get(thisWeek) ?? 0 };
}
