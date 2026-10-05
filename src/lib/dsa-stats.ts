import type { Difficulty, DsaPattern } from "@/data/types";
import type { DsaLogEntry } from "./state/types";

export interface DifficultyCounts {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface DsaStats {
  /** Log entries per pattern id (re-solves count as separate entries). */
  byPattern: Record<string, DifficultyCounts>;
  byDifficulty: DifficultyCounts;
  /** Number of log entries. */
  total: number;
  /** Number of different problems (by name). */
  distinctProblems: number;
}

const emptyCounts = (): DifficultyCounts => ({ easy: 0, medium: 0, hard: 0, total: 0 });

const bump = (counts: DifficultyCounts, difficulty: Difficulty) => {
  counts[difficulty] += 1;
  counts.total += 1;
};

export function normalizeProblemName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function computeDsaStats(log: DsaLogEntry[]): DsaStats {
  const byPattern: Record<string, DifficultyCounts> = {};
  const byDifficulty = emptyCounts();
  const names = new Set<string>();

  for (const entry of log) {
    bump((byPattern[entry.patternId] ??= emptyCounts()), entry.difficulty);
    bump(byDifficulty, entry.difficulty);
    names.add(normalizeProblemName(entry.name));
  }
  return { byPattern, byDifficulty, total: log.length, distinctProblems: names.size };
}

/** Distinct session days (dates with at least one logged problem), ascending. */
export function sessionDates(log: DsaLogEntry[]): string[] {
  return [...new Set(log.map((entry) => entry.date))].sort();
}

export function solvedNames(log: DsaLogEntry[]): Set<string> {
  return new Set(log.map((entry) => normalizeProblemName(entry.name)));
}

/** How many of a pattern's suggested problems appear in the log. */
export function patternCoverage(pattern: DsaPattern, solved: Set<string>): { solved: number; total: number } {
  const done = pattern.problems.filter((problem) => solved.has(normalizeProblemName(problem.name))).length;
  return { solved: done, total: pattern.problems.length };
}
