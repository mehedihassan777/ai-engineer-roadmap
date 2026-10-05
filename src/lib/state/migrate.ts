import { SCHEMA_VERSION, StateError } from "./types";

type RawState = Record<string, unknown>;
export type Migration = (state: RawState) => RawState;

/**
 * MIGRATIONS[n] upgrades a state saved with schemaVersion n to schemaVersion n + 1.
 * Empty while the schema is still at version 1. When you change the persisted shape:
 * bump SCHEMA_VERSION in types.ts and add the migration here.
 */
export const MIGRATIONS: Record<number, Migration> = {};

export function migrateToCurrent(
  raw: RawState,
  fromVersion: number,
  migrations: Record<number, Migration> = MIGRATIONS,
  target: number = SCHEMA_VERSION,
): RawState {
  let state = raw;
  for (let version = fromVersion; version < target; version += 1) {
    const step = migrations[version];
    if (!step) throw new StateError(`This data uses schema ${version}, which this version of the app cannot upgrade.`);
    state = { ...step(state), schemaVersion: version + 1 };
  }
  return state;
}
