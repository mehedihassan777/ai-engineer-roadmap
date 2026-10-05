import { SCHEMA_VERSION, type PersistedState } from "./types";

/** A brand-new state: nothing ticked, week 1 starting on `startDate`. */
export function createDefaultState(startDate: string): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    startDate,
    tasks: {},
    topics: {},
    dod: {},
    dsaLog: [],
    notes: {},
  };
}
