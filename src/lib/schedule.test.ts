import { describe, expect, it } from "vitest";
import { getSchedule, weekDateRange } from "./schedule";

const START = "2026-10-05";

describe("getSchedule", () => {
  it("is not started before the start date", () => {
    expect(getSchedule(START, "2026-10-04", 24)).toEqual({ status: "not-started", week: 1, daysUntilStart: 1 });
    expect(getSchedule(START, "2026-09-05", 24)).toMatchObject({ status: "not-started", daysUntilStart: 30 });
  });

  it("starts week 1 on the start date and rolls over every seven days", () => {
    expect(getSchedule(START, "2026-10-05", 24)).toEqual({ status: "in-progress", week: 1, daysUntilStart: 0 });
    expect(getSchedule(START, "2026-10-11", 24).week).toBe(1);
    expect(getSchedule(START, "2026-10-12", 24).week).toBe(2);
    expect(getSchedule(START, "2026-10-19", 24).week).toBe(3);
  });

  it("is on week 24 until the 24th week has fully passed, then finished", () => {
    expect(getSchedule(START, "2027-03-21", 24)).toMatchObject({ status: "in-progress", week: 24 });
    expect(getSchedule(START, "2027-03-22", 24)).toMatchObject({ status: "finished", week: 24 });
    expect(getSchedule(START, "2030-01-01", 24)).toMatchObject({ status: "finished", week: 24 });
  });
});

describe("weekDateRange", () => {
  it("returns seven inclusive days", () => {
    expect(weekDateRange(START, 1)).toEqual({ start: "2026-10-05", end: "2026-10-11" });
    expect(weekDateRange(START, 2)).toEqual({ start: "2026-10-12", end: "2026-10-18" });
    expect(weekDateRange(START, 24)).toEqual({ start: "2027-03-15", end: "2027-03-21" });
  });
});
