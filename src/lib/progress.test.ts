import { describe, expect, it } from "vitest";
import { roadmap } from "./content";
import { carryOver, checklistProgress, computeProgress, weekProgress } from "./progress";
import type { ResolvedWeek } from "./roadmap";
import type { TaskStatus } from "./state/types";

const week1 = roadmap.weeksByNumber.get(1);
if (!week1) throw new Error("week 1 must exist for these tests");
const allDone = (week: ResolvedWeek): Record<string, TaskStatus> =>
  Object.fromEntries(week.tasks.map((task) => [task.id, "done" as const]));

describe("computeProgress", () => {
  it("is zero when nothing is done", () => {
    const progress = computeProgress(roadmap, {});
    expect(progress.overall.percent).toBe(0);
    expect(progress.overall.doneTasks).toBe(0);
    expect(progress.overall.totalTasks).toBe(roadmap.tasksById.size);
    expect(progress.overall.totalHours).toBeCloseTo(roadmap.totalHours, 9);
  });

  it("weights progress by hours", () => {
    const progress = computeProgress(roadmap, allDone(week1));
    expect(progress.byWeek[1].percent).toBe(100);
    expect(progress.byWeek[1].doneTasks).toBe(week1.tasks.length);
    expect(progress.overall.percent).toBeCloseTo((week1.totalHours / roadmap.totalHours) * 100, 9);
  });

  it("splits progress by track", () => {
    const aiOnly = Object.fromEntries(week1.tasks.filter((task) => task.track === "ai").map((task) => [task.id, "done" as const]));
    const progress = computeProgress(roadmap, aiOnly);
    expect(progress.byTrack.ai.doneHours).toBeCloseTo(6.75, 9);
    expect(progress.byTrack.dsa.doneHours).toBe(0);
    expect(progress.byTrack.ai.percent).toBeCloseTo((6.75 / roadmap.hoursByTrack.ai) * 100, 9);
  });

  it("rolls weeks up into phases", () => {
    const progress = computeProgress(roadmap, allDone(week1));
    expect(progress.byPhase["llm-foundations"].doneHours).toBeCloseTo(week1.totalHours, 9);
    expect(progress.byPhase["rag"]?.doneHours ?? 0).toBe(0);
  });

  it("counts in-progress tasks separately and gives them no hours", () => {
    const first = week1.tasks[0];
    const progress = computeProgress(roadmap, { [first.id]: "in-progress" });
    expect(progress.overall.inProgressTasks).toBe(1);
    expect(progress.overall.doneTasks).toBe(0);
    expect(progress.overall.doneHours).toBe(0);
  });

  it("ignores ids that no longer exist in the content", () => {
    const progress = computeProgress(roadmap, { "deleted-task": "done" });
    expect(progress.overall.doneTasks).toBe(0);
  });
});

describe("weekProgress", () => {
  it("matches the per-week entry of computeProgress", () => {
    const statuses = { [week1.tasks[0].id]: "done" as const };
    expect(weekProgress(week1, statuses)).toEqual(computeProgress(roadmap, statuses).byWeek[1]);
  });
});

describe("carryOver", () => {
  it("lists unfinished tasks from earlier weeks only", () => {
    const result = carryOver(roadmap, {}, 2);
    expect(result.tasks).toHaveLength(week1.tasks.length);
    expect(result.hours).toBeCloseTo(week1.totalHours, 9);
    expect(result.tasks.every((task) => task.weekNumber === 1)).toBe(true);
  });

  it("drops tasks that are done and is empty in week 1", () => {
    expect(carryOver(roadmap, allDone(week1), 2).tasks).toHaveLength(0);
    expect(carryOver(roadmap, {}, 1).tasks).toHaveLength(0);
  });
});

describe("checklistProgress", () => {
  it("counts checked ids", () => {
    expect(checklistProgress(["a", "b", "c", "d"], { a: true, c: true, zzz: true })).toEqual({ done: 2, total: 4, percent: 50 });
  });

  it("handles an empty checklist", () => {
    expect(checklistProgress([], {})).toEqual({ done: 0, total: 0, percent: 0 });
  });
});
