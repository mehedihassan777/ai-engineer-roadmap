import { DSA_PATTERNS } from "@/data/dsa-patterns";
import { describe, expect, it } from "vitest";
import { computeDsaStats, normalizeProblemName, patternCoverage, sessionDates, solvedNames } from "./dsa-stats";
import type { DsaLogEntry } from "./state/types";

const entry = (id: string, overrides: Partial<DsaLogEntry> = {}): DsaLogEntry => ({
  id,
  date: "2026-10-06",
  name: "Two Sum",
  difficulty: "easy",
  patternId: "arrays-hashing",
  ...overrides,
});

const LOG: DsaLogEntry[] = [
  entry("1"),
  entry("2", { name: "Group Anagrams", difficulty: "medium" }),
  entry("3", { name: "3Sum", difficulty: "medium", patternId: "two-pointers", date: "2026-10-08" }),
  entry("4", { name: "  two   SUM ", date: "2026-10-08" }), // a re-solve of Two Sum
  entry("5", { name: "Trapping Rain Water", difficulty: "hard", patternId: "two-pointers", date: "2026-10-09" }),
];

describe("computeDsaStats", () => {
  const stats = computeDsaStats(LOG);

  it("counts entries by pattern and difficulty", () => {
    expect(stats.byPattern["arrays-hashing"]).toEqual({ easy: 2, medium: 1, hard: 0, total: 3 });
    expect(stats.byPattern["two-pointers"]).toEqual({ easy: 0, medium: 1, hard: 1, total: 2 });
  });

  it("counts entries by difficulty overall", () => {
    expect(stats.byDifficulty).toEqual({ easy: 2, medium: 2, hard: 1, total: 5 });
    expect(stats.total).toBe(5);
  });

  it("counts a re-solve as an entry but not as a new problem", () => {
    expect(stats.distinctProblems).toBe(4);
  });

  it("handles an empty log", () => {
    expect(computeDsaStats([])).toEqual({
      byPattern: {},
      byDifficulty: { easy: 0, medium: 0, hard: 0, total: 0 },
      total: 0,
      distinctProblems: 0,
    });
  });
});

describe("sessionDates", () => {
  it("returns distinct, sorted days", () => {
    expect(sessionDates(LOG)).toEqual(["2026-10-06", "2026-10-08", "2026-10-09"]);
  });
});

describe("normalizeProblemName / solvedNames", () => {
  it("ignores case and extra whitespace", () => {
    expect(normalizeProblemName("  Two   Sum ")).toBe("two sum");
    expect(solvedNames(LOG).has("two sum")).toBe(true);
  });
});

describe("patternCoverage", () => {
  it("compares the log with the pattern's suggested problems", () => {
    const arrays = DSA_PATTERNS.find((pattern) => pattern.id === "arrays-hashing");
    expect(arrays).toBeDefined();
    if (!arrays) return;
    expect(patternCoverage(arrays, solvedNames(LOG))).toEqual({ solved: 2, total: arrays.problems.length });
  });
});
