import { PLAN } from "@/data";
import { TRACK_IDS } from "@/data/ids";
import { describe, expect, it } from "vitest";
import { allocateHours, roundToStep, trackWeeklyHours } from "./time-budget";

describe("trackWeeklyHours (default plan)", () => {
  it("splits 15 h into the configured track budgets", () => {
    expect(trackWeeklyHours(PLAN, "ai")).toBe(6.75);
    expect(trackWeeklyHours(PLAN, "assisted")).toBe(1.5);
    expect(trackWeeklyHours(PLAN, "design")).toBe(3);
    expect(trackWeeklyHours(PLAN, "fundamentals")).toBe(1.5);
    expect(trackWeeklyHours(PLAN, "dsa")).toBe(2.25);
  });

  it("adds up to the weekly hours", () => {
    const total = TRACK_IDS.reduce((sum, track) => sum + trackWeeklyHours(PLAN, track), 0);
    expect(total).toBeCloseTo(PLAN.weeklyHours, 9);
  });

  it("rescales when the constants change", () => {
    expect(trackWeeklyHours({ ...PLAN, weeklyHours: 12 }, "ai")).toBe(5.5); // 5.4 rounded to a quarter hour
    expect(trackWeeklyHours({ ...PLAN, weeklyHours: 20 }, "dsa")).toBe(3);
  });
});

describe("roundToStep", () => {
  it("rounds to the nearest step without floating-point noise", () => {
    expect(roundToStep(0.3, 0.25)).toBe(0.25);
    expect(roundToStep(0.4, 0.25)).toBe(0.5);
    expect(roundToStep(6.3, 0.25)).toBe(6.25);
    expect(roundToStep(0.3, 0.1)).toBe(0.3);
  });
});

describe("allocateHours", () => {
  it("maps weights that equal the hours straight through", () => {
    const weights = [1.25, 1.5, 1.75, 1, 0.75, 0.5];
    expect(allocateHours(weights, 6.75, 0.25)).toEqual(weights);
  });

  it("splits evenly when weights are equal", () => {
    expect(allocateHours([1, 1, 1], 2.25, 0.25)).toEqual([0.75, 0.75, 0.75]);
  });

  it("hands leftover quarter hours to the largest remainders, earlier tasks first on ties", () => {
    expect(allocateHours([1, 1, 1], 1, 0.25)).toEqual([0.5, 0.25, 0.25]);
    expect(allocateHours([3, 1], 1, 0.25)).toEqual([0.75, 0.25]);
  });

  it("treats missing or invalid weights as 1", () => {
    expect(allocateHours([0, -2, Number.NaN], 0.75, 0.25)).toEqual([0.25, 0.25, 0.25]);
  });

  it("returns nothing for no tasks", () => {
    expect(allocateHours([], 3, 0.25)).toEqual([]);
  });

  it("always adds up exactly to the budget, for arbitrary weights", () => {
    let seed = 12345;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let run = 0; run < 300; run += 1) {
      const count = 1 + Math.floor(random() * 8);
      const weights = Array.from({ length: count }, () => 0.1 + random() * 5);
      const hours = allocateHours(weights, 6.75, 0.25);
      expect(hours).toHaveLength(count);
      expect(hours.reduce((sum, value) => sum + value, 0)).toBeCloseTo(6.75, 9);
      for (const value of hours) expect(value * 4).toBeCloseTo(Math.round(value * 4), 9); // whole quarter hours
    }
  });
});
