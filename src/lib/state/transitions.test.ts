import { describe, expect, it } from "vitest";
import { createDefaultState } from "./defaults";
import * as t from "./transitions";
import type { DsaLogEntry, PersistedState } from "./types";

/** Freezes recursively so any accidental mutation throws. */
function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const base = (): PersistedState => deepFreeze(createDefaultState("2026-10-05"));
const entry = (id: string, overrides: Partial<DsaLogEntry> = {}): DsaLogEntry => ({
  id,
  date: "2026-10-06",
  name: "Two Sum",
  difficulty: "easy",
  patternId: "arrays-hashing",
  ...overrides,
});

describe("task status", () => {
  it("sets and clears a status", () => {
    const done = t.setTaskStatus(base(), "a", "done");
    expect(done.tasks).toEqual({ a: "done" });
    expect(t.setTaskStatus(done, "a", "in-progress").tasks).toEqual({ a: "in-progress" });
    expect(t.setTaskStatus(done, "a", "todo").tasks).toEqual({});
  });

  it("returns the same state when nothing changes", () => {
    const state = base();
    expect(t.setTaskStatus(state, "a", "todo")).toBe(state);
    const done = t.setTaskStatus(state, "a", "done");
    expect(t.setTaskStatus(done, "a", "done")).toBe(done);
  });

  it("toggles the checkbox: anything -> done, done -> to do", () => {
    const state = base();
    const done = t.toggleTaskDone(state, "a");
    expect(done.tasks.a).toBe("done");
    expect(t.toggleTaskDone(done, "a").tasks).toEqual({});
    const inProgress = t.setTaskStatus(state, "a", "in-progress");
    expect(t.toggleTaskDone(inProgress, "a").tasks.a).toBe("done");
  });
});

describe("checklists", () => {
  it("toggles topics and definition-of-done items independently", () => {
    const withTopic = t.toggleChecked(base(), "topics", "dotnet-async");
    expect(withTopic.topics).toEqual({ "dotnet-async": true });
    expect(withTopic.dod).toEqual({});
    const both = t.toggleChecked(withTopic, "dod", "order-assistant:seed");
    expect(both.dod).toEqual({ "order-assistant:seed": true });
    expect(t.toggleChecked(both, "topics", "dotnet-async").topics).toEqual({});
  });
});

describe("DSA log", () => {
  it("adds, updates and removes entries", () => {
    const added = t.addDsaEntry(base(), entry("1"));
    expect(added.dsaLog).toHaveLength(1);

    const updated = t.updateDsaEntry(added, "1", { notes: "complement map", difficulty: "medium" });
    expect(updated.dsaLog[0]).toMatchObject({ id: "1", notes: "complement map", difficulty: "medium", name: "Two Sum" });

    const removed = t.removeDsaEntry(updated, "1");
    expect(removed.dsaLog).toEqual([]);
  });

  it("ignores unknown ids without changing the state", () => {
    const state = t.addDsaEntry(base(), entry("1"));
    expect(t.updateDsaEntry(state, "nope", { notes: "x" })).toBe(state);
    expect(t.removeDsaEntry(state, "nope")).toBe(state);
  });
});

describe("week notes", () => {
  it("stores text by week and removes empty notes", () => {
    const withNote = t.setWeekNote(base(), 3, "learned about SSE");
    expect(withNote.notes).toEqual({ "3": "learned about SSE" });
    expect(t.setWeekNote(withNote, 3, "").notes).toEqual({});
    expect(t.setWeekNote(withNote, 3, "   \n").notes).toEqual({});
  });

  it("returns the same state for no-ops", () => {
    const state = base();
    expect(t.setWeekNote(state, 3, "")).toBe(state);
    const withNote = t.setWeekNote(state, 3, "same");
    expect(t.setWeekNote(withNote, 3, "same")).toBe(withNote);
  });
});

describe("start date and export stamp", () => {
  it("accepts a valid date and ignores invalid or unchanged ones", () => {
    const state = base();
    expect(t.setStartDate(state, "2026-11-02").startDate).toBe("2026-11-02");
    expect(t.setStartDate(state, "2026-02-30")).toBe(state);
    expect(t.setStartDate(state, "2026-10-05")).toBe(state);
  });

  it("records the export time", () => {
    expect(t.markExported(base(), "2026-10-06T10:00:00.000Z").lastExportedAt).toBe("2026-10-06T10:00:00.000Z");
  });
});
