import { describe, expect, it } from "vitest";
import { MIGRATIONS, migrateToCurrent, type Migration } from "./migrate";
import { StateError } from "./types";

describe("migrateToCurrent", () => {
  it("is a no-op when the data is already current", () => {
    const raw = { schemaVersion: 1, tasks: {} };
    expect(migrateToCurrent(raw, 1)).toEqual(raw);
  });

  it("has no migrations registered while the schema is at version 1", () => {
    expect(Object.keys(MIGRATIONS)).toHaveLength(0);
  });

  it("applies each step in order and stamps the new version", () => {
    const migrations: Record<number, Migration> = {
      1: (state) => ({ ...state, tasks: { ...(state.tasks as object), migratedFrom1: true } }),
      2: (state) => ({ ...state, topics: {} }),
    };
    const result = migrateToCurrent({ schemaVersion: 1, tasks: { a: "done" } }, 1, migrations, 3);
    expect(result).toEqual({ schemaVersion: 3, tasks: { a: "done", migratedFrom1: true }, topics: {} });
  });

  it("starts from the version the data was saved with", () => {
    const migrations: Record<number, Migration> = { 2: (state) => ({ ...state, upgraded: true }) };
    expect(migrateToCurrent({ schemaVersion: 2 }, 2, migrations, 3)).toEqual({ schemaVersion: 3, upgraded: true });
  });

  it("fails clearly when a step is missing", () => {
    expect(() => migrateToCurrent({ schemaVersion: 1 }, 1, {}, 2)).toThrow(StateError);
    expect(() => migrateToCurrent({ schemaVersion: 1 }, 1, {}, 2)).toThrow(/cannot upgrade/);
  });
});
