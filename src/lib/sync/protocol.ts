import type { PersistedState } from "@/lib/state/types";

/** The wire format shared by the sync API (src/server) and the sync client (src/lib/sync). */

export const SYNC_PATH = "/api/sync";
export const HEALTH_PATH = "/api/health";
/** Largest request body the API accepts (a full state with all 24 weekly notes is well below this). */
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

/** GET /api/sync?rev=N */
export interface PullResponse {
  /** Current server revision; 0 means nothing has been stored yet. */
  rev: number;
  /** True when `rev` equals the revision the client already has, so no state is sent. */
  unchanged?: true;
  /** The stored state, or null when nothing has been stored yet. Absent when `unchanged`. */
  state?: PersistedState | null;
  updatedAt?: string;
  updatedBy?: string;
}

/** PUT /api/sync */
export interface PushRequest {
  /** The server revision this state was merged against. */
  baseRev: number;
  deviceId: string;
  state: PersistedState;
}

export interface PushResponse {
  rev: number;
  updatedAt: string;
}

/** 409: someone else pushed first. Carries the current server state so the client can merge without another request. */
export interface ConflictResponse {
  error: "conflict";
  rev: number;
  state: PersistedState | null;
  updatedAt?: string;
  updatedBy?: string;
}

export interface HealthResponse {
  /** True when this server has a database and a sync token configured. */
  sync: boolean;
}

/** Device-local fields are never synced. */
export function toSyncedState(state: PersistedState): PersistedState {
  const copy: PersistedState = { ...state };
  delete copy.lastExportedAt;
  return copy;
}
