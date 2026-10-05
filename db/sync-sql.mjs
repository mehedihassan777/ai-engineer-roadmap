/** SQL used by the sync repository, the doctor script and the tests - one definition so they cannot drift apart. */

export const SELECT_STATE_SQL = `SELECT rev, state, updated_at, updated_by FROM sync_state WHERE workspace = $1`;

/**
 * Compare-and-swap write. Params: $1 workspace, $2 state (JSON text), $3 device id, $4 expected base revision.
 * - No row yet: inserts revision 1 (also re-seeds a wiped database).
 * - Row exists and its revision equals $4: updates and bumps the revision.
 * - Row exists with a different revision: the WHERE clause is false, nothing changes and no row is returned.
 */
export const CAS_UPSERT_SQL = `
INSERT INTO sync_state AS s (workspace, state, rev, updated_by)
VALUES ($1, $2::jsonb, 1, $3)
ON CONFLICT (workspace) DO UPDATE
  SET state = EXCLUDED.state, rev = s.rev + 1, updated_at = now(), updated_by = EXCLUDED.updated_by
  WHERE s.rev = $4
RETURNING rev, updated_at, updated_by`;
