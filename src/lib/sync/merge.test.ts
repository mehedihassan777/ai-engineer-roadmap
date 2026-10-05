import { describe, expect, it } from "vitest";
import { createDefaultState } from "@/lib/state/defaults";
import type { DsaLogEntry, PersistedState } from "@/lib/state/types";
import { NOTE_SEPARATOR, deepEqual, mergeStates } from "./merge";

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(deepFreeze);
  }
  return value;
}

const state = (overrides: Partial<PersistedState> = {}): PersistedState =>
  deepFreeze({ ...createDefaultState("2026-10-05"), ...overrides });

const entry = (id: string, overrides: Partial<DsaLogEntry> = {}): DsaLogEntry => ({
  id,
  date: "2026-10-06",
  name: `Problem ${id}`,
  difficulty: "easy",
  patternId: "arrays-hashing",
  ...overrides,
});

const merge = (base: PersistedState | null, local: PersistedState, remote: PersistedState) => mergeStates(base, local, remote);

describe("deepEqual", () => {
  it("compares structure, not identity or key order", () => {
    expect(deepEqual({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(deepEqual([1], { 0: 1 })).toBe(false);
    expect(deepEqual(undefined, undefined)).toBe(true);
    expect(deepEqual(undefined, null)).toBe(false);
  });
});

describe("mergeStates with a base (normal syncs)", () => {
  const base = state({ tasks: { shared: "done", toUntick: "done" } });

  it("combines changes made on different keys by each side", () => {
    const local = state({ tasks: { shared: "done", toUntick: "done", mine: "done" } });
    const remote = state({ tasks: { shared: "done", toUntick: "done", theirs: "in-progress" } });
    const { merged, summary } = merge(base, local, remote);
    expect(merged.tasks).toEqual({ shared: "done", toUntick: "done", mine: "done", theirs: "in-progress" });
    expect(summary).toEqual({ fromCloud: 1, fromThisDevice: 1, conflicts: 0 });
  });

  it("propagates an untick (deletion) when the other side did not touch it", () => {
    const local = state({ tasks: { shared: "done" } });
    const { merged } = merge(base, local, base);
    expect(merged.tasks).toEqual({ shared: "done" });
    const fromCloud = merge(base, base, state({ tasks: { shared: "done" } }));
    expect(fromCloud.merged.tasks).toEqual({ shared: "done" });
  });

  it("takes the cloud's change when this device did not touch the key", () => {
    const remote = state({ tasks: { shared: "done", toUntick: "done", extra: "done" } });
    expect(merge(base, base, remote).merged.tasks.extra).toBe("done");
  });

  it("lets this device win a real conflict on the same task", () => {
    const start = state({ tasks: { c: "in-progress" } });
    const local = state({ tasks: { c: "done" } }); // finished here
    const remote = state({ tasks: { c: "in-progress", d: "done" }, notes: {} });
    // Not a conflict yet: only this device changed c.
    expect(merge(start, local, remote).merged.tasks.c).toBe("done");

    const bothChanged = merge(state({ tasks: { c: "in-progress" } }), state({ tasks: { c: "done" } }), state({ tasks: {} }));
    expect(bothChanged.merged.tasks.c).toBe("done"); // remote unticked, this device finished: this device wins
    expect(bothChanged.summary.conflicts).toBe(1);

    const reversed = merge(state({ tasks: {} }), state({ tasks: { c: "in-progress" } }), state({ tasks: { c: "done" } }));
    expect(reversed.merged.tasks.c).toBe("in-progress"); // both added it differently: this device wins
    expect(reversed.summary.conflicts).toBe(1);
  });

  it("a deletion here beats an untouched value there, and a conflicting untick beats an edit there", () => {
    const local = state({ tasks: { shared: "done" } }); // unticked toUntick
    const remote = state({ tasks: { shared: "done", toUntick: "in-progress" } }); // edited the same task
    expect(merge(base, local, remote).merged.tasks).toEqual({ shared: "done" });
  });

  it("handles topics and definition-of-done as unions of changes", () => {
    const b = state({ topics: { a: true }, dod: { "p:x": true } });
    const local = state({ topics: { a: true, b: true }, dod: {} });
    const remote = state({ topics: {}, dod: { "p:x": true, "p:y": true } });
    const { merged } = merge(b, local, remote);
    expect(merged.topics).toEqual({ b: true });
    expect(merged.dod).toEqual({ "p:y": true });
  });

  it("takes whichever side changed the start date, and this device on a conflict", () => {
    expect(merge(base, base, state({ startDate: "2026-11-02" })).merged.startDate).toBe("2026-11-02");
    expect(merge(base, state({ startDate: "2026-09-01" }), base).merged.startDate).toBe("2026-09-01");
    expect(merge(base, state({ startDate: "2026-09-01" }), state({ startDate: "2026-11-02" })).merged.startDate).toBe("2026-09-01");
  });

  it("keeps this device's last-export time", () => {
    const local = state({ lastExportedAt: "2026-10-06T10:00:00.000Z" });
    expect(merge(base, local, base).merged.lastExportedAt).toBe("2026-10-06T10:00:00.000Z");
    expect(merge(base, base, base).merged.lastExportedAt).toBeUndefined();
  });

  it("does not report anything when nothing changed", () => {
    const { merged, summary } = merge(base, base, base);
    expect(merged).toEqual(base);
    expect(summary).toEqual({ fromCloud: 0, fromThisDevice: 0, conflicts: 0 });
  });

  it("does not mutate its inputs (they are frozen)", () => {
    expect(() => merge(base, state({ tasks: { x: "done" } }), state({ tasks: { y: "done" } }))).not.toThrow();
  });
});

describe("mergeStates: notes are never silently lost", () => {
  const base = state({ notes: { "1": "base note" } });

  it("keeps whichever side edited when only one did", () => {
    expect(merge(base, state({ notes: { "1": "mine" } }), base).merged.notes["1"]).toBe("mine");
    expect(merge(base, base, state({ notes: { "1": "theirs" } })).merged.notes["1"]).toBe("theirs");
  });

  it("combines both texts when both edited the same week", () => {
    const { merged, summary } = merge(base, state({ notes: { "1": "from home" } }), state({ notes: { "1": "from office" } }));
    expect(merged.notes["1"]).toBe(`from home${NOTE_SEPARATOR}from office`);
    expect(summary.conflicts).toBe(1);
  });

  it("does not duplicate when one edit already contains the other", () => {
    const { merged } = merge(base, state({ notes: { "1": "base note, extended" } }), state({ notes: { "1": "base note" } }));
    expect(merged.notes["1"]).toBe("base note, extended");
  });

  it("keeps the text when one side cleared the note and the other edited it", () => {
    expect(merge(base, state({ notes: {} }), state({ notes: { "1": "edited" } })).merged.notes["1"]).toBe("edited");
  });

  it("lets a clear win when the other side did not touch the note", () => {
    expect(merge(base, state({ notes: {} }), base).merged.notes).toEqual({});
  });
});

describe("mergeStates: DSA log", () => {
  const base = state({ dsaLog: [entry("a"), entry("b")] });

  it("adds entries from both sides, this device's order first", () => {
    const local = state({ dsaLog: [entry("a"), entry("b"), entry("mine")] });
    const remote = state({ dsaLog: [entry("a"), entry("b"), entry("theirs")] });
    expect(merge(base, local, remote).merged.dsaLog.map((e) => e.id)).toEqual(["a", "b", "mine", "theirs"]);
  });

  it("propagates a deletion the other side did not touch", () => {
    const remote = state({ dsaLog: [entry("a")] });
    expect(merge(base, base, remote).merged.dsaLog.map((e) => e.id)).toEqual(["a"]);
  });

  it("keeps an edit when the other side deleted the entry", () => {
    const local = state({ dsaLog: [entry("a", { notes: "edited here" }), entry("b")] });
    const remote = state({ dsaLog: [entry("b")] });
    const { merged } = merge(base, local, remote);
    expect(merged.dsaLog.find((e) => e.id === "a")?.notes).toBe("edited here");
  });

  it("lets this device win when both edited the same entry", () => {
    const local = state({ dsaLog: [entry("a", { notes: "mine" }), entry("b")] });
    const remote = state({ dsaLog: [entry("a", { notes: "theirs" }), entry("b")] });
    expect(merge(base, local, remote).merged.dsaLog[0].notes).toBe("mine");
  });
});

describe("mergeStates on first connect (no base)", () => {
  it("uploads what only this device has and downloads what only the cloud has", () => {
    const local = state({ tasks: { a: "done" }, topics: { t1: true }, dsaLog: [entry("l1")] });
    const remote = state({ tasks: { b: "done" }, topics: { t2: true }, dsaLog: [entry("r1")] });
    const { merged, summary } = merge(null, local, remote);
    expect(merged.tasks).toEqual({ a: "done", b: "done" });
    expect(merged.topics).toEqual({ t1: true, t2: true });
    expect(merged.dsaLog.map((e) => e.id)).toEqual(["l1", "r1"]);
    expect(summary).toMatchObject({ fromCloud: 3, fromThisDevice: 3, conflicts: 0 });
  });

  it("never loses completed work: the more advanced status wins", () => {
    const local = state({ tasks: { x: "in-progress", y: "done" } });
    const remote = state({ tasks: { x: "done", y: "in-progress" } });
    const { merged, summary } = merge(null, local, remote);
    expect(merged.tasks).toEqual({ x: "done", y: "done" });
    expect(summary.conflicts).toBe(2);
  });

  it("takes the cloud's start date, because this device's is usually just 'the day I first opened the app'", () => {
    expect(merge(null, state({ startDate: "2026-10-06" }), state({ startDate: "2026-09-14" })).merged.startDate).toBe("2026-09-14");
  });

  it("combines differing notes and prefers the cloud's version of a differing log entry", () => {
    const local = state({ notes: { "1": "local note" }, dsaLog: [entry("a", { notes: "local" })] });
    const remote = state({ notes: { "1": "cloud note" }, dsaLog: [entry("a", { notes: "cloud" })] });
    const { merged } = merge(null, local, remote);
    expect(merged.notes["1"]).toBe(`local note${NOTE_SEPARATOR}cloud note`);
    expect(merged.dsaLog[0].notes).toBe("cloud");
  });

  it("is a no-op when both sides already agree", () => {
    const same = state({ tasks: { a: "done" } });
    const { merged, summary } = merge(null, same, same);
    expect(merged).toEqual(same);
    expect(summary).toEqual({ fromCloud: 0, fromThisDevice: 0, conflicts: 0 });
  });
});
