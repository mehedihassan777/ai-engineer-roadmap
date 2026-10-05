import { describe, expect, it } from "vitest";
import { cn } from "./cn";
import { formatHours, formatPercent, plural } from "./format";

describe("formatHours", () => {
  it("drops trailing zeros and caps at two decimals", () => {
    expect(formatHours(6.75)).toBe("6.75 h");
    expect(formatHours(1.5)).toBe("1.5 h");
    expect(formatHours(15)).toBe("15 h");
    expect(formatHours(0.25)).toBe("0.25 h");
    expect(formatHours(0.1 + 0.2)).toBe("0.3 h");
  });
});

describe("formatPercent", () => {
  it("rounds to a whole number", () => {
    expect(formatPercent(41.6)).toBe("42%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(100)).toBe("100%");
  });
});

describe("plural", () => {
  it("picks singular or plural", () => {
    expect(plural(1, "task")).toBe("task");
    expect(plural(2, "task")).toBe("tasks");
    expect(plural(0, "entry", "entries")).toBe("entries");
  });
});

describe("cn", () => {
  it("joins truthy parts only", () => {
    expect(cn("a", false, null, undefined, "b", "")).toBe("a b");
  });
});
