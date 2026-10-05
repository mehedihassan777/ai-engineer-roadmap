import { describe, expect, it } from "vitest";
import { roadmap } from "./content";
import {
  DEFAULT_FILTERS,
  countMatches,
  filtersToQuery,
  matchesFilters,
  matchesStatus,
  parseFilters,
  stateOf,
  type TaskFilters,
} from "./task-filters";

const task = (id: string) => {
  const found = roadmap.tasksById.get(id);
  if (!found) throw new Error(`missing task ${id}`);
  return found;
};

const dsaWeek1 = task("w01-dsa-1"); // dsa, week 1
const aiWeek2 = task("w02-order-summary-endpoint"); // ai, week 2

describe("stateOf / matchesStatus", () => {
  it("treats a missing status as to do", () => {
    expect(stateOf({}, "a")).toBe("todo");
    expect(stateOf({ a: "done" }, "a")).toBe("done");
  });

  it("matches each status filter", () => {
    expect(matchesStatus("todo", "all")).toBe(true);
    expect(matchesStatus("todo", "todo")).toBe(true);
    expect(matchesStatus("in-progress", "todo")).toBe(false);
    expect(matchesStatus("in-progress", "open")).toBe(true);
    expect(matchesStatus("todo", "open")).toBe(true);
    expect(matchesStatus("done", "open")).toBe(false);
    expect(matchesStatus("done", "done")).toBe(true);
  });
});

describe("matchesFilters", () => {
  const filters = (overrides: Partial<TaskFilters>): TaskFilters => ({ ...DEFAULT_FILTERS, ...overrides });

  it("matches everything by default", () => {
    expect(matchesFilters(dsaWeek1, "todo", DEFAULT_FILTERS, 1)).toBe(true);
  });

  it("filters by track", () => {
    expect(matchesFilters(dsaWeek1, "todo", filters({ track: "dsa" }), 1)).toBe(true);
    expect(matchesFilters(aiWeek2, "todo", filters({ track: "dsa" }), 1)).toBe(false);
  });

  it("filters by status", () => {
    expect(matchesFilters(dsaWeek1, "done", filters({ status: "open" }), 1)).toBe(false);
    expect(matchesFilters(dsaWeek1, "in-progress", filters({ status: "in-progress" }), 1)).toBe(true);
  });

  it("filters by week scope relative to the current week", () => {
    expect(matchesFilters(dsaWeek1, "todo", filters({ scope: "past" }), 2)).toBe(true);
    expect(matchesFilters(aiWeek2, "todo", filters({ scope: "past" }), 2)).toBe(false);
    expect(matchesFilters(aiWeek2, "todo", filters({ scope: "upcoming" }), 2)).toBe(true);
    expect(matchesFilters(dsaWeek1, "todo", filters({ scope: "upcoming" }), 2)).toBe(false);
  });

  it("combines the filters with AND", () => {
    const combined = filters({ track: "dsa", status: "open", scope: "past" });
    expect(matchesFilters(dsaWeek1, "todo", combined, 2)).toBe(true);
    expect(matchesFilters(dsaWeek1, "done", combined, 2)).toBe(false);
    expect(matchesFilters(aiWeek2, "todo", combined, 3)).toBe(false);
  });
});

describe("countMatches", () => {
  const week1 = roadmap.weeksByNumber.get(1);
  if (!week1) throw new Error("week 1 must exist");
  const tasks = week1.tasks;
  const dsaTasks = tasks.filter((candidate) => candidate.track === "dsa");

  it("counts tasks per track and per status", () => {
    const counts = countMatches(tasks, {}, DEFAULT_FILTERS, 1);
    expect(counts.byTrack.all).toBe(tasks.length);
    expect(counts.byTrack.dsa).toBe(dsaTasks.length);
    expect(counts.byStatus.all).toBe(tasks.length);
    expect(counts.byStatus.todo).toBe(tasks.length);
    expect(counts.byStatus.done).toBe(0);
  });

  it("applies the other dimension when counting a chip", () => {
    const statuses = { [dsaTasks[0].id]: "done" as const, [dsaTasks[1].id]: "in-progress" as const };
    const counts = countMatches(tasks, statuses, { ...DEFAULT_FILTERS, track: "dsa" }, 1);
    expect(counts.byStatus.all).toBe(dsaTasks.length); // status counts respect the track filter
    expect(counts.byStatus.done).toBe(1);
    expect(counts.byStatus.open).toBe(dsaTasks.length - 1);
    expect(counts.byTrack.all).toBe(tasks.length); // track counts ignore the track filter itself
  });

  it("counts track chips under the status filter", () => {
    const statuses = { [dsaTasks[0].id]: "done" as const };
    const counts = countMatches(tasks, statuses, { ...DEFAULT_FILTERS, status: "done" }, 1);
    expect(counts.byTrack.all).toBe(1);
    expect(counts.byTrack.dsa).toBe(1);
    expect(counts.byTrack.ai).toBe(0);
  });
});

describe("query string round trip", () => {
  it("omits defaults", () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toBe("");
    expect(filtersToQuery({ track: "dsa", status: "all", scope: "all" })).toBe("track=dsa");
  });

  it("parses what it writes", () => {
    const original: TaskFilters = { track: "design", status: "open", scope: "past" };
    expect(parseFilters(new URLSearchParams(filtersToQuery(original)))).toEqual(original);
  });

  it("falls back to defaults for unknown or missing values", () => {
    expect(parseFilters(new URLSearchParams("track=nope&status=maybe&scope=sometimes"))).toEqual(DEFAULT_FILTERS);
    expect(parseFilters(new URLSearchParams(""))).toEqual(DEFAULT_FILTERS);
  });
});
