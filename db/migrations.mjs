/**
 * Database migrations, applied in order by `npm run db:migrate` and by the tests (on PGlite).
 * Never edit a migration that has been applied: add a new one. Each statement runs inside one transaction.
 */
export const MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id         text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

export const MIGRATIONS = [
  {
    id: "001_sync_state",
    statements: [
      // One row per workspace holds the whole progress document plus a revision counter used for compare-and-swap.
      `CREATE TABLE IF NOT EXISTS sync_state (
        workspace  text        PRIMARY KEY,
        state      jsonb       NOT NULL,
        rev        integer     NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now(),
        updated_by text        NOT NULL
      )`,
    ],
  },
];
