import { parseState } from "@/lib/state/parse-state";
import type { KeyValueStorage } from "@/lib/state/storage";
import type { PersistedState } from "@/lib/state/types";
import { toSyncedState } from "./protocol";

/**
 * Device-local sync bookkeeping, stored apart from the progress itself so exports/imports never carry it.
 * `base` is the state this device and the cloud last agreed on (what the cloud held at `baseRev`).
 */
export interface SyncMeta {
  version: 1;
  deviceId: string;
  baseRev: number;
  base: PersistedState | null;
  lastSyncedAt: string | null;
  remoteUpdatedAt: string | null;
  remoteUpdatedBy: string | null;
}

export const META_KEY = "air:v1:sync";
export const TOKEN_KEY = "air:v1:sync-token";

function newDeviceId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  return `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function freshMeta(deviceId: string = newDeviceId()): SyncMeta {
  return { version: 1, deviceId, baseRev: 0, base: null, lastSyncedAt: null, remoteUpdatedAt: null, remoteUpdatedBy: null };
}

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0;

/** Reads the metadata; anything unreadable falls back to a fresh start (which just means a first-connect style merge). */
export function loadMeta(storage: KeyValueStorage | null): SyncMeta {
  let raw: unknown = null;
  try {
    const text = storage?.getItem(META_KEY);
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = null;
  }
  if (typeof raw !== "object" || raw === null) return freshMeta();

  const record = raw as Record<string, unknown>;
  const meta = freshMeta(isString(record.deviceId) ? record.deviceId : undefined);
  try {
    if (record.base !== null && record.base !== undefined && Number.isInteger(record.baseRev) && (record.baseRev as number) > 0) {
      const startDate = (record.base as { startDate?: string }).startDate ?? "1970-01-01";
      meta.base = toSyncedState(parseState(record.base, startDate).state);
      meta.baseRev = record.baseRev as number;
    }
  } catch {
    // Unreadable base: keep the fresh values.
  }
  meta.lastSyncedAt = isString(record.lastSyncedAt) ? record.lastSyncedAt : null;
  meta.remoteUpdatedAt = isString(record.remoteUpdatedAt) ? record.remoteUpdatedAt : null;
  meta.remoteUpdatedBy = isString(record.remoteUpdatedBy) ? record.remoteUpdatedBy : null;
  return meta;
}

export function saveMeta(storage: KeyValueStorage | null, meta: SyncMeta): void {
  try {
    storage?.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Storage full or blocked: the next round simply behaves like a first connect (safe, just less precise).
  }
}

export function loadToken(storage: KeyValueStorage | null): string | null {
  try {
    const token = storage?.getItem(TOKEN_KEY)?.trim();
    return token ? token : null;
  } catch {
    return null;
  }
}

export function saveToken(storage: KeyValueStorage | null, token: string): void {
  storage?.setItem(TOKEN_KEY, token.trim());
}

export function clearToken(storage: KeyValueStorage | null): void {
  try {
    storage?.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to do.
  }
}
