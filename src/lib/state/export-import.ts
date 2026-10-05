import { toDateString } from "../dates";
import { parseState } from "./parse-state";
import {
  EXPORT_FORMAT,
  SCHEMA_VERSION,
  StateError,
  type ExportFile,
  type ParseResult,
  type PersistedState,
} from "./types";

/** Wraps the state in the export envelope and stamps the export time. */
export function buildExportFile(state: PersistedState, now: Date = new Date()): ExportFile {
  const exportedAt = now.toISOString();
  return {
    format: EXPORT_FORMAT,
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    data: { ...state, lastExportedAt: exportedAt },
  };
}

export function serializeExport(file: ExportFile): string {
  return JSON.stringify(file, null, 2);
}

export function exportFileName(now: Date = new Date()): string {
  return `ai-roadmap-backup-${toDateString(now)}.json`;
}

/** Parses the text of an export file. Throws a StateError with a user-readable message when it is not usable. */
export function parseExportFile(text: string, fallbackStartDate: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new StateError("That file is not valid JSON.");
  }
  if (typeof parsed !== "object" || parsed === null || (parsed as { format?: unknown }).format !== EXPORT_FORMAT) {
    throw new StateError("That is not an AI Engineer Roadmap export file.");
  }
  return parseState((parsed as { data?: unknown }).data, fallbackStartDate);
}

export interface StateSummary {
  startDate: string;
  tasksDone: number;
  tasksInProgress: number;
  topicsChecked: number;
  dodChecked: number;
  dsaEntries: number;
  weeksWithNotes: number;
}

/** Counts shown in the import confirmation dialog. */
export function summarizeState(state: PersistedState): StateSummary {
  const statuses = Object.values(state.tasks);
  return {
    startDate: state.startDate,
    tasksDone: statuses.filter((status) => status === "done").length,
    tasksInProgress: statuses.filter((status) => status === "in-progress").length,
    topicsChecked: Object.keys(state.topics).length,
    dodChecked: Object.keys(state.dod).length,
    dsaEntries: state.dsaLog.length,
    weeksWithNotes: Object.keys(state.notes).length,
  };
}
