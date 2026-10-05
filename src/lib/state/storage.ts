import { parseState } from "./parse-state";
import { StateError, type ParseResult } from "./types";

/** One versioned key for the live state; the others hold a one-step undo and unreadable data kept for recovery. */
export const STORAGE_KEY = "air:v1";
export const BACKUP_KEY = "air:v1:backup";
export const CORRUPT_KEY = "air:v1:corrupt";

/** The subset of the Web Storage API the app uses (so tests can pass an in-memory fake). */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** window.localStorage, or null on the server or when the browser blocks it (private mode, disabled storage). */
export function getBrowserStorage(): KeyValueStorage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = "__air_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export type LoadResult =
  | { status: "empty" }
  | ({ status: "ok" } & ParseResult)
  | { status: "corrupt"; raw: string; reason: string };

function parseStored(raw: string, fallbackStartDate: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new StateError("The saved data is not valid JSON.");
  }
  return parseState(json, fallbackStartDate);
}

export function loadState(storage: KeyValueStorage, fallbackStartDate: string): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: "empty" };
  }
  if (raw === null) return { status: "empty" };
  try {
    return { status: "ok", ...parseStored(raw, fallbackStartDate) };
  } catch (error) {
    return { status: "corrupt", raw, reason: error instanceof Error ? error.message : "unknown error" };
  }
}

/** The one-step undo snapshot, if there is one and it is still readable. */
export function readBackup(storage: KeyValueStorage, fallbackStartDate: string): ParseResult | null {
  try {
    const raw = storage.getItem(BACKUP_KEY);
    return raw === null ? null : parseStored(raw, fallbackStartDate);
  } catch {
    return null;
  }
}
