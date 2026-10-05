import type { PersistedState } from "@/lib/state/types";
import { CAS_UPSERT_SQL, SELECT_STATE_SQL } from "../../db/sync-sql.mjs";
import type { PutInput, PutResult, StoredState, SyncRepository } from "./repository";

export interface SqlStatement {
  text: string;
  params: unknown[];
}
export type SqlRow = Record<string, unknown>;

/** Runs statements as ONE transaction and returns each statement's rows. Neon (HTTP) and PGlite (tests) implement it. */
export interface SqlRunner {
  batch(statements: SqlStatement[]): Promise<SqlRow[][]>;
}

function toIso(value: unknown): string {
  return new Date(value as string | number | Date).toISOString();
}

function decodeRow(row: SqlRow | undefined): StoredState | null {
  if (!row) return null;
  const state = typeof row.state === "string" ? JSON.parse(row.state) : row.state;
  return {
    rev: Number(row.rev),
    state: state as PersistedState,
    updatedAt: toIso(row.updated_at),
    updatedBy: String(row.updated_by),
  };
}

/** Postgres-backed repository using compare-and-swap on the `rev` column (see db/sync-sql.mjs). */
export function createSqlRepository(runner: SqlRunner): SyncRepository {
  return {
    async get(workspace) {
      const [rows] = await runner.batch([{ text: SELECT_STATE_SQL, params: [workspace] }]);
      return decodeRow(rows[0]);
    },

    async put({ workspace, baseRev, state, deviceId }: PutInput): Promise<PutResult> {
      const [written, current] = await runner.batch([
        { text: CAS_UPSERT_SQL, params: [workspace, JSON.stringify(state), deviceId, baseRev] },
        { text: SELECT_STATE_SQL, params: [workspace] },
      ]);
      const row = written[0];
      if (row) return { ok: true, rev: Number(row.rev), updatedAt: toIso(row.updated_at) };
      return { ok: false, current: decodeRow(current[0]) };
    },
  };
}
