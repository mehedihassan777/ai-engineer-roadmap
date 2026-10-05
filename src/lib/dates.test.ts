import { describe, expect, it } from "vitest";
import { addDays, diffInDays, formatDate, formatDateTime, formatDayMonth, isValidDateString, toDateString } from "./dates";

describe("toDateString", () => {
  it("formats the local calendar date", () => {
    expect(toDateString(new Date(2026, 9, 6, 23, 59))).toBe("2026-10-06");
    expect(toDateString(new Date(2026, 0, 1, 0, 0))).toBe("2026-01-01");
  });
});

describe("isValidDateString", () => {
  it("accepts real calendar dates", () => {
    expect(isValidDateString("2026-02-28")).toBe(true);
    expect(isValidDateString("2028-02-29")).toBe(true);
  });

  it("rejects impossible dates and wrong formats", () => {
    expect(isValidDateString("2026-02-29")).toBe(false);
    expect(isValidDateString("2026-13-01")).toBe(false);
    expect(isValidDateString("2026-1-1")).toBe(false);
    expect(isValidDateString("26-01-01")).toBe(false);
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString(20261006)).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });
});

describe("diffInDays", () => {
  it("counts whole calendar days", () => {
    expect(diffInDays("2026-10-13", "2026-10-06")).toBe(7);
    expect(diffInDays("2026-10-06", "2026-10-06")).toBe(0);
    expect(diffInDays("2026-10-01", "2026-10-06")).toBe(-5);
  });

  it("is not affected by daylight-saving changes", () => {
    expect(diffInDays("2026-03-29", "2026-03-28")).toBe(1);
    expect(diffInDays("2026-10-26", "2026-10-24")).toBe(2);
    expect(diffInDays("2026-11-02", "2026-10-31")).toBe(2);
  });

  it("throws on an invalid date", () => {
    expect(() => diffInDays("nope", "2026-10-06")).toThrow(/Invalid date/);
  });
});

describe("addDays", () => {
  it("crosses month, year and leap-day boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-10-06", 168)).toBe("2027-03-23");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO timestamp in local time", () => {
    const local = new Date(2026, 9, 6, 14, 5);
    expect(formatDateTime(local.toISOString())).toBe("6 Oct 2026, 14:05");
    expect(formatDateTime("not a date")).toBe("not a date");
  });
});

describe("formatting", () => {
  it("is locale independent", () => {
    expect(formatDate("2026-10-06")).toBe("6 Oct 2026");
    expect(formatDayMonth("2026-10-06")).toBe("6 Oct");
    expect(formatDate("garbage")).toBe("garbage");
  });
});
