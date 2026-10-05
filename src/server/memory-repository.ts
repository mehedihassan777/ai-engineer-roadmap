import type { SyncRepository, StoredState } from "./repository";

/**
 * Development-only repository that keeps the document in the server process (lost on restart).
 * Same compare-and-swap rules as the SQL version. Enabled with SYNC_STORE=memory, never in production.
 */
export function createMemoryRepository(): SyncRepository {
  const rows = new Map<string, StoredState>();

  return {
    async get(workspace) {
      const row = rows.get(workspace);
      return row ? structuredClone(row) : null;
    },

    async put({ workspace, baseRev, state, deviceId }) {
      const existing = rows.get(workspace);
      if (existing && existing.rev !== baseRev) return { ok: false, current: structuredClone(existing) };

      const next: StoredState = {
        rev: (existing?.rev ?? 0) + 1,
        state: structuredClone(state),
        updatedAt: new Date().toISOString(),
        updatedBy: deviceId,
      };
      rows.set(workspace, next);
      return { ok: true, rev: next.rev, updatedAt: next.updatedAt };
    },
  };
}
