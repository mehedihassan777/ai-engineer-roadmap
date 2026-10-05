import type { Difficulty } from "@/data/types";

/** Bump when the persisted shape changes, and add a migration in migrate.ts. */
export const SCHEMA_VERSION = 1;

export const EXPORT_FORMAT = "ai-engineer-roadmap";

/** A task with no entry is "to do". */
export type TaskStatus = "in-progress" | "done";

export interface DsaLogEntry {
  id: string;
  /** Local YYYY-MM-DD. */
  date: string;
  name: string;
  difficulty: Difficulty;
  /** A DSA pattern id, or "other". */
  patternId: string;
  notes?: string;
}

/** Everything the user's progress consists of. Content (weeks, tasks, ...) is never stored here. */
export interface PersistedState {
  schemaVersion: typeof SCHEMA_VERSION;
  /** Local YYYY-MM-DD on which week 1 starts. */
  startDate: string;
  /** Keyed by task id. Unknown ids are ignored when calculating, but kept so nothing is lost. */
  tasks: Record<string, TaskStatus>;
  /** Checked stack topics, keyed by topic id. */
  topics: Record<string, true>;
  /** Checked definition-of-done items, keyed `${projectId}:${itemId}`. */
  dod: Record<string, true>;
  dsaLog: DsaLogEntry[];
  /** Weekly notes, keyed by week number as a string. */
  notes: Record<string, string>;
  lastExportedAt?: string;
}

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  schemaVersion: number;
  exportedAt: string;
  data: PersistedState;
}

/** Thrown for problems the user should be told about (bad import file, newer schema, ...). */
export class StateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StateError";
  }
}

export interface ParseResult {
  state: PersistedState;
  /** Non-fatal problems, e.g. "Ignored 2 invalid log entries". */
  warnings: string[];
}
