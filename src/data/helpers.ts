import { DSA_PATTERNS } from "./dsa-patterns";
import type { DsaPatternId, ProjectId, TrackId } from "./ids";
import { R } from "./resources";
import type { DsaPlan, Resource, Task, Week } from "./types";

/**
 * Tiny builders so week files read like content, not boilerplate.
 *
 *   ai("w01-llm-basics", "How LLMs work", { weight: 1.25, resources: [R.claudeContextWindows] })
 */

interface TaskOptions {
  detail?: string;
  weight?: number;
  resources: Resource[];
  projectId?: ProjectId;
}

const taskFor =
  (track: TrackId) =>
  (id: string, title: string, options: TaskOptions): Task => ({ id, track, title, ...options });

export const ai = taskFor("ai");
export const assisted = taskFor("assisted");
export const design = taskFor("design");
export const fundamentals = taskFor("fundamentals");

/** A DSA week on one pattern: list the problems (exact names from dsa-patterns.ts) for each session. */
export function patternWeek(patternId: DsaPatternId, sessions: string[][]): DsaPlan {
  return { kind: "pattern", patternId, sessions };
}

/** A timed mock-interview week over earlier patterns. */
export function mockWeek(coversPatternIds: DsaPatternId[]): DsaPlan {
  return { kind: "mock", coversPatternIds };
}

export type WeekInput = Omit<Week, "tasks"> & {
  /** Everything except DSA: the DSA session tasks are generated from `dsa`. */
  tasks: Task[];
};

/** Builds a week; appends the DSA session tasks generated from `input.dsa`. */
export function defineWeek(input: WeekInput): Week {
  return { ...input, tasks: [...input.tasks, ...dsaSessionTasks(input.number, input.dsa)] };
}

const pad = (week: number) => String(week).padStart(2, "0");

function patternName(id: DsaPatternId): string {
  const pattern = DSA_PATTERNS.find((candidate) => candidate.id === id);
  if (!pattern) throw new Error(`Unknown DSA pattern "${id}" - add it to dsa-patterns.ts`);
  return pattern.name;
}

const DSA_RESOURCES: Resource[] = [R.neetcodeRoadmap, R.leetcodeProblemset];

function dsaSessionTasks(week: number, plan: DsaPlan): Task[] {
  const id = (session: number) => `w${pad(week)}-dsa-${session}`;

  if (plan.kind === "mock") {
    const covered = plan.coversPatternIds.map(patternName).join(", ");
    const mockDetail =
      `Pick two problems you have not seen from: ${covered}. About 20-25 minutes each: restate the problem, ` +
      "state the approach and its time/space complexity out loud before coding, then code and test aloud. " +
      "Log every problem, including where you got stuck.";
    return [
      {
        id: id(1),
        track: "dsa",
        title: "DSA mock interview A (timed, 45 min)",
        detail: mockDetail,
        weight: 1,
        resources: DSA_RESOURCES,
      },
      {
        id: id(2),
        track: "dsa",
        title: "DSA mock interview B (timed, 45 min)",
        detail: `${mockDetail} Use a different pair of problems; ideally ask a colleague to play interviewer.`,
        weight: 1,
        resources: DSA_RESOURCES,
      },
      {
        id: id(3),
        track: "dsa",
        title: "DSA review: redo what you missed",
        detail:
          "Redo the problems you failed or needed hints for in the mocks. For each, write the pattern cue and the " +
          "complexity in your DSA log notes.",
        weight: 1,
        resources: DSA_RESOURCES,
      },
    ];
  }

  const name = patternName(plan.patternId);
  const review =
    week === 1
      ? "At the end, re-solve one problem from this session from memory."
      : "Then 1-2 spaced reviews: redo problems from earlier weeks that you failed or needed hints for (check your DSA log).";
  return plan.sessions.map((problems, index) => ({
    id: id(index + 1),
    track: "dsa" as const,
    title: `DSA session ${index + 1}/${plan.sessions.length}: ${name}`,
    detail: `New: ${problems.join(", ")}. ${review}`,
    weight: 1,
    resources: DSA_RESOURCES,
  }));
}
