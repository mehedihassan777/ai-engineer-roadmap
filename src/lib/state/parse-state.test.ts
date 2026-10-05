import { describe, expect, it } from "vitest";
import { parseState } from "./parse-state";
import { StateError } from "./types";

const FALLBACK = "2026-10-06";
const minimal = { schemaVersion: 1, startDate: "2026-10-05" };

describe("parseState: envelope", () => {
  it("accepts a minimal state and fills defaults", () => {
    const { state, warnings } = parseState(minimal, FALLBACK);
    expect(state).toEqual({
      schemaVersion: 1,
      startDate: "2026-10-05",
      tasks: {},
      topics: {},
      dod: {},
      dsaLog: [],
      notes: {},
    });
    expect(warnings).toEqual([]);
  });

  it.each([null, "text", 42, [], undefined])("rejects non-objects (%s)", (raw) => {
    expect(() => parseState(raw, FALLBACK)).toThrow(StateError);
  });

  it("requires a valid schema version", () => {
    expect(() => parseState({ startDate: "2026-10-05" }, FALLBACK)).toThrow(/schemaVersion/);
    expect(() => parseState({ schemaVersion: 0 }, FALLBACK)).toThrow(/schemaVersion/);
    expect(() => parseState({ schemaVersion: "1" }, FALLBACK)).toThrow(/schemaVersion/);
  });

  it("refuses data from a newer schema", () => {
    expect(() => parseState({ schemaVersion: 99 }, FALLBACK)).toThrow(/newer version/);
  });

  it("falls back when the start date is missing or invalid", () => {
    const missing = parseState({ schemaVersion: 1 }, FALLBACK);
    expect(missing.state.startDate).toBe(FALLBACK);
    expect(missing.warnings[0]).toMatch(/start date/);
    expect(parseState({ schemaVersion: 1, startDate: "2026-02-30" }, FALLBACK).state.startDate).toBe(FALLBACK);
  });

  it("keeps a valid lastExportedAt and drops an invalid one", () => {
    expect(parseState({ ...minimal, lastExportedAt: "2026-10-06T10:00:00.000Z" }, FALLBACK).state.lastExportedAt).toBe(
      "2026-10-06T10:00:00.000Z",
    );
    expect(parseState({ ...minimal, lastExportedAt: "yesterday" }, FALLBACK).state.lastExportedAt).toBeUndefined();
  });
});

describe("parseState: sections", () => {
  it("keeps valid task statuses and reports the rest", () => {
    const { state, warnings } = parseState({ ...minimal, tasks: { a: "done", b: "nope", c: "in-progress", d: true } }, FALLBACK);
    expect(state.tasks).toEqual({ a: "done", c: "in-progress" });
    expect(warnings).toContain("Ignored 2 invalid task progress entries.");
  });

  it("keeps only true flags for topics and definition-of-done items", () => {
    const { state, warnings } = parseState(
      { ...minimal, topics: { x: true, y: false, z: "yes" }, dod: { "p1:seed": true, bad: 1 } },
      FALLBACK,
    );
    expect(state.topics).toEqual({ x: true });
    expect(state.dod).toEqual({ "p1:seed": true });
    expect(warnings).toContain("Ignored 2 invalid stack topic entries.");
    expect(warnings).toContain("Ignored 1 invalid definition-of-done entry.");
  });

  it("ignores a section of the wrong type instead of failing", () => {
    const { state, warnings } = parseState({ ...minimal, tasks: [], dsaLog: {}, notes: "x" }, FALLBACK);
    expect(state.tasks).toEqual({});
    expect(state.dsaLog).toEqual([]);
    expect(state.notes).toEqual({});
    expect(warnings).toHaveLength(3);
  });

  it("validates DSA log entries", () => {
    const good = { id: "a", date: "2026-10-06", name: "  Two Sum ", difficulty: "easy", patternId: "arrays-hashing", notes: "hash map" };
    const { state, warnings } = parseState(
      {
        ...minimal,
        dsaLog: [
          good,
          { ...good, id: "a" }, // duplicate id
          { ...good, id: "b", date: "2026-02-30" },
          { ...good, id: "c", difficulty: "impossible" },
          { ...good, id: "d", name: "   " },
          { id: "e", date: "2026-10-07", name: "Valid Anagram", difficulty: "easy" }, // no pattern, no notes
          { ...good, id: "f", notes: "   " },
          "not an object",
        ],
      },
      FALLBACK,
    );
    expect(state.dsaLog.map((entry) => entry.id)).toEqual(["a", "e", "f"]);
    expect(state.dsaLog[0]).toEqual({ ...good, name: "Two Sum" });
    expect(state.dsaLog[1].patternId).toBe("other");
    expect(state.dsaLog[1].notes).toBeUndefined();
    expect(state.dsaLog[2].notes).toBeUndefined();
    expect(warnings).toContain("Ignored 5 invalid DSA log entries.");
  });

  it("keeps week notes keyed by week number and drops the rest", () => {
    const { state, warnings } = parseState({ ...minimal, notes: { "1": "hello", "24": "bye", abc: "x", "2": 5, "3": "   " } }, FALLBACK);
    expect(state.notes).toEqual({ "1": "hello", "24": "bye" });
    expect(warnings).toContain("Ignored 2 invalid weekly notes.");
  });

  it("truncates absurdly long values", () => {
    const { state } = parseState(
      {
        ...minimal,
        dsaLog: [{ id: "a", date: "2026-10-06", name: "x".repeat(500), difficulty: "easy", patternId: "p", notes: "n".repeat(10_000) }],
      },
      FALLBACK,
    );
    expect(state.dsaLog[0].name).toHaveLength(200);
    expect(state.dsaLog[0].notes).toHaveLength(4_000);
  });
});
