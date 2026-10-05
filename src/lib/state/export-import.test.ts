import { describe, expect, it } from "vitest";
import { createDefaultState } from "./defaults";
import {
  buildExportFile,
  exportFileName,
  parseExportFile,
  serializeExport,
  summarizeState,
} from "./export-import";
import { StateError, type PersistedState } from "./types";

const NOW = new Date(2026, 9, 6, 15, 30); // 6 Oct 2026, local time

const state: PersistedState = {
  ...createDefaultState("2026-10-05"),
  tasks: { "w01-claude-md": "done", "w01-dsa-1": "done", "w01-dsa-2": "in-progress" },
  topics: { "dotnet-async": true },
  dod: { "order-assistant:seed": true, "order-assistant:stream": true },
  dsaLog: [{ id: "1", date: "2026-10-06", name: "Two Sum", difficulty: "easy", patternId: "arrays-hashing", notes: "complement map" }],
  notes: { "1": "Week one notes" },
};

describe("export / import round trip", () => {
  it("restores exactly what was exported", () => {
    const text = serializeExport(buildExportFile(state, NOW));
    const { state: restored, warnings } = parseExportFile(text, "2000-01-01");
    expect(warnings).toEqual([]);
    expect(restored).toEqual({ ...state, lastExportedAt: NOW.toISOString() });
  });

  it("wraps the data in a labelled, versioned envelope", () => {
    const file = buildExportFile(state, NOW);
    expect(file.format).toBe("ai-engineer-roadmap");
    expect(file.schemaVersion).toBe(1);
    expect(file.exportedAt).toBe(NOW.toISOString());
  });

  it("does not mutate the live state when exporting", () => {
    buildExportFile(state, NOW);
    expect(state.lastExportedAt).toBeUndefined();
  });
});

describe("exportFileName", () => {
  it("uses the local date", () => {
    expect(exportFileName(NOW)).toBe("ai-roadmap-backup-2026-10-06.json");
  });
});

describe("parseExportFile errors", () => {
  it("rejects text that is not JSON", () => {
    expect(() => parseExportFile("{oops", "2026-10-06")).toThrow(new StateError("That file is not valid JSON."));
  });

  it("rejects JSON that is not an export file", () => {
    expect(() => parseExportFile("{}", "2026-10-06")).toThrow(/not an AI Engineer Roadmap export file/);
    expect(() => parseExportFile("[1,2]", "2026-10-06")).toThrow(/not an AI Engineer Roadmap export file/);
    expect(() => parseExportFile("null", "2026-10-06")).toThrow(/not an AI Engineer Roadmap export file/);
  });

  it("rejects an export whose data is unusable", () => {
    const bad = JSON.stringify({ format: "ai-engineer-roadmap", schemaVersion: 1, exportedAt: "x", data: "nope" });
    expect(() => parseExportFile(bad, "2026-10-06")).toThrow(StateError);
  });

  it("recovers what it can from a partly damaged export", () => {
    const damaged = JSON.stringify({
      format: "ai-engineer-roadmap",
      schemaVersion: 1,
      exportedAt: NOW.toISOString(),
      data: { schemaVersion: 1, startDate: "2026-10-05", tasks: { good: "done", bad: "??" } },
    });
    const { state: restored, warnings } = parseExportFile(damaged, "2026-10-06");
    expect(restored.tasks).toEqual({ good: "done" });
    expect(warnings).toHaveLength(1);
  });
});

describe("summarizeState", () => {
  it("counts what an import would bring in", () => {
    expect(summarizeState(state)).toEqual({
      startDate: "2026-10-05",
      tasksDone: 2,
      tasksInProgress: 1,
      topicsChecked: 1,
      dodChecked: 2,
      dsaEntries: 1,
      weeksWithNotes: 1,
    });
  });
});
