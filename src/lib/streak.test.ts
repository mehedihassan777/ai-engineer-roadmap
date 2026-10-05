import { describe, expect, it } from "vitest";
import { computeDayStreak, computeWeekStreak } from "./streak";

describe("computeDayStreak", () => {
  const log = ["2026-10-01", "2026-10-02", "2026-10-03"];

  it("counts consecutive days ending today", () => {
    expect(computeDayStreak(log, "2026-10-03")).toEqual({ current: 3, best: 3 });
  });

  it("does not break the streak until a whole day passes without a log", () => {
    expect(computeDayStreak(log, "2026-10-04")).toEqual({ current: 3, best: 3 });
    expect(computeDayStreak(log, "2026-10-05")).toEqual({ current: 0, best: 3 });
  });

  it("separates runs and remembers the best one", () => {
    const gappy = ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-05", "2026-10-06"];
    expect(computeDayStreak(gappy, "2026-10-06")).toEqual({ current: 2, best: 3 });
  });

  it("counts a day once however many problems were logged", () => {
    expect(computeDayStreak(["2026-10-03", "2026-10-03", "2026-10-03"], "2026-10-03")).toEqual({ current: 1, best: 1 });
  });

  it("ignores dates in the future", () => {
    expect(computeDayStreak(["2026-10-03", "2026-10-04", "2026-10-05"], "2026-10-03")).toEqual({ current: 1, best: 1 });
  });

  it("handles an empty log", () => {
    expect(computeDayStreak([], "2026-10-03")).toEqual({ current: 0, best: 0 });
  });

  it("works across month and year boundaries", () => {
    expect(computeDayStreak(["2026-12-30", "2026-12-31", "2027-01-01"], "2027-01-01")).toEqual({ current: 3, best: 3 });
  });
});

describe("computeWeekStreak", () => {
  const START = "2026-10-05"; // week 1 = Oct 5-11, week 2 = Oct 12-18, week 3 = Oct 19-25, week 4 = Oct 26-Nov 1
  const week1 = ["2026-10-05", "2026-10-07", "2026-10-09"];
  const week2 = ["2026-10-12", "2026-10-14", "2026-10-16"];

  it("counts consecutive plan weeks that reach the session target", () => {
    const result = computeWeekStreak([...week1, ...week2], "2026-10-18", START, 3);
    expect(result).toEqual({ current: 2, best: 2, sessionsThisWeek: 3 });
  });

  it("does not break the streak while the current week is still in progress", () => {
    const result = computeWeekStreak([...week1, ...week2, "2026-10-19", "2026-10-21"], "2026-10-21", START, 3);
    expect(result).toEqual({ current: 2, best: 2, sessionsThisWeek: 2 });
  });

  it("includes the current week once it reaches the target", () => {
    const result = computeWeekStreak([...week1, ...week2, "2026-10-19", "2026-10-21", "2026-10-22"], "2026-10-22", START, 3);
    expect(result).toEqual({ current: 3, best: 3, sessionsThisWeek: 3 });
  });

  it("resets after a week that missed the target but remembers the best run", () => {
    const result = computeWeekStreak([...week1, ...week2, "2026-10-19", "2026-10-21"], "2026-10-27", START, 3);
    expect(result).toEqual({ current: 0, best: 2, sessionsThisWeek: 0 });
  });

  it("counts distinct days, not problems", () => {
    const sameDay = ["2026-10-05", "2026-10-05", "2026-10-05", "2026-10-05"];
    expect(computeWeekStreak(sameDay, "2026-10-06", START, 3).sessionsThisWeek).toBe(1);
  });

  it("treats a target below 1 as 1 instead of looping forever", () => {
    expect(computeWeekStreak([], "2026-10-06", START, 0)).toEqual({ current: 0, best: 0, sessionsThisWeek: 0 });
  });

  it("works before the plan starts", () => {
    expect(computeWeekStreak(["2026-09-30"], "2026-10-01", START, 1)).toMatchObject({ current: 1, sessionsThisWeek: 1 });
  });
});
