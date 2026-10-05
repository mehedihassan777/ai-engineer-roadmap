import type { Difficulty } from "@/data/types";
import { isValidDateString } from "../dates";
import { plural } from "../format";
import { createDefaultState } from "./defaults";
import { migrateToCurrent } from "./migrate";
import {
  SCHEMA_VERSION,
  StateError,
  type DsaLogEntry,
  type ParseResult,
  type PersistedState,
  type TaskStatus,
} from "./types";

const MAX_ID_LENGTH = 120;
const MAX_NAME_LENGTH = 200;
const MAX_LOG_NOTES_LENGTH = 4_000;
const MAX_WEEK_NOTE_LENGTH = 50_000;
const WEEK_KEY = /^\d{1,3}$/;
const DIFFICULTIES: readonly string[] = ["easy", "medium", "hard"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isDifficulty = (value: unknown): value is Difficulty => typeof value === "string" && DIFFICULTIES.includes(value);

function reportDropped(count: number, one: string, many: string, warnings: string[]): void {
  if (count > 0) warnings.push(`Ignored ${count} invalid ${plural(count, one, many)}.`);
}

function parseTasks(value: unknown, warnings: string[]): Record<string, TaskStatus> {
  if (value === undefined) return {};
  if (!isRecord(value)) {
    warnings.push("Ignored task progress: it was not an object.");
    return {};
  }
  const tasks: Record<string, TaskStatus> = {};
  let dropped = 0;
  for (const [id, status] of Object.entries(value)) {
    if ((status === "done" || status === "in-progress") && id.length > 0 && id.length <= MAX_ID_LENGTH) tasks[id] = status;
    else dropped += 1;
  }
  reportDropped(dropped, "task progress entry", "task progress entries", warnings);
  return tasks;
}

function parseFlags(value: unknown, label: string, warnings: string[]): Record<string, true> {
  if (value === undefined) return {};
  if (!isRecord(value)) {
    warnings.push(`Ignored ${label}: it was not an object.`);
    return {};
  }
  const flags: Record<string, true> = {};
  let dropped = 0;
  for (const [id, flag] of Object.entries(value)) {
    if (flag === true && id.length > 0 && id.length <= MAX_ID_LENGTH) flags[id] = true;
    else dropped += 1;
  }
  reportDropped(dropped, `${label} entry`, `${label} entries`, warnings);
  return flags;
}

function parseDsaLog(value: unknown, warnings: string[]): DsaLogEntry[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    warnings.push("Ignored the DSA log: it was not a list.");
    return [];
  }
  const entries: DsaLogEntry[] = [];
  const seen = new Set<string>();
  let dropped = 0;
  for (const item of value) {
    if (!isRecord(item)) {
      dropped += 1;
      continue;
    }
    const { id, date, name, difficulty, patternId, notes } = item;
    const validId = typeof id === "string" && id.length > 0 && id.length <= MAX_ID_LENGTH && !seen.has(id);
    const validName = typeof name === "string" && name.trim().length > 0;
    if (!validId || !isValidDateString(date) || !validName || !isDifficulty(difficulty)) {
      dropped += 1;
      continue;
    }
    seen.add(id);
    const entry: DsaLogEntry = {
      id,
      date,
      name: name.trim().slice(0, MAX_NAME_LENGTH),
      difficulty,
      patternId: typeof patternId === "string" && patternId.length > 0 ? patternId : "other",
    };
    if (typeof notes === "string" && notes.trim().length > 0) entry.notes = notes.slice(0, MAX_LOG_NOTES_LENGTH);
    entries.push(entry);
  }
  reportDropped(dropped, "DSA log entry", "DSA log entries", warnings);
  return entries;
}

function parseNotes(value: unknown, warnings: string[]): Record<string, string> {
  if (value === undefined) return {};
  if (!isRecord(value)) {
    warnings.push("Ignored weekly notes: they were not an object.");
    return {};
  }
  const notes: Record<string, string> = {};
  let dropped = 0;
  for (const [week, text] of Object.entries(value)) {
    if (WEEK_KEY.test(week) && typeof text === "string") {
      if (text.trim().length > 0) notes[week] = text.slice(0, MAX_WEEK_NOTE_LENGTH);
    } else {
      dropped += 1;
    }
  }
  reportDropped(dropped, "weekly note", "weekly notes", warnings);
  return notes;
}

/**
 * Validates and normalises saved or imported state.
 * Fatal problems (not an object, no/newer schema version) throw a StateError.
 * Individual bad entries are dropped and reported in `warnings` so a mostly-good file is still usable.
 */
export function parseState(raw: unknown, fallbackStartDate: string): ParseResult {
  if (!isRecord(raw)) throw new StateError("The data is not a JSON object.");

  const version = raw.schemaVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new StateError("The data has no valid schemaVersion.");
  }
  if (version > SCHEMA_VERSION) {
    throw new StateError(
      `This data was saved by a newer version of the app (schema ${version}). Update the app before importing it.`,
    );
  }

  const data = migrateToCurrent(raw, version);
  const warnings: string[] = [];

  const state: PersistedState = createDefaultState(fallbackStartDate);
  if (isValidDateString(data.startDate)) {
    state.startDate = data.startDate;
  } else {
    warnings.push(`The start date was missing or invalid, so ${fallbackStartDate} is used.`);
  }
  state.tasks = parseTasks(data.tasks, warnings);
  state.topics = parseFlags(data.topics, "stack topic", warnings);
  state.dod = parseFlags(data.dod, "definition-of-done", warnings);
  state.dsaLog = parseDsaLog(data.dsaLog, warnings);
  state.notes = parseNotes(data.notes, warnings);
  if (typeof data.lastExportedAt === "string" && !Number.isNaN(Date.parse(data.lastExportedAt))) {
    state.lastExportedAt = data.lastExportedAt;
  }
  return { state, warnings };
}
