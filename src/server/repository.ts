import type { PersistedState } from "@/lib/state/types";

export interface StoredState {
  rev: number;
  state: PersistedState;
  updatedAt: string;
  updatedBy: string;
}

export type PutResult =
  | { ok: true; rev: number; updatedAt: string }
  /** The stored revision did not match `baseRev`; `current` is what is stored now (null if the row vanished). */
  | { ok: false; current: StoredState | null };

export interface PutInput {
  workspace: string;
  /** The revision the caller merged against (0 = nothing stored yet). */
  baseRev: number;
  state: PersistedState;
  deviceId: string;
}

/** Where the synced progress document lives. Implementations must make `put` an atomic compare-and-swap. */
export interface SyncRepository {
  get(workspace: string): Promise<StoredState | null>;
  put(input: PutInput): Promise<PutResult>;
}
