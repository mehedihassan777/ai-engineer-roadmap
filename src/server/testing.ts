import { PGlite } from "@electric-sql/pglite";
import { MIGRATIONS, MIGRATIONS_TABLE_SQL } from "../../db/migrations.mjs";
import type { SqlRow, SqlRunner } from "./sql-repository";

/**
 * A real Postgres (PGlite, in memory) with the app's migrations applied, behind the same SqlRunner interface
 * the Neon driver implements. Used by tests only - it lets the actual SQL run without a Neon account.
 */
export async function createPgliteRunner(): Promise<SqlRunner> {
  const db = await PGlite.create();
  await db.exec(MIGRATIONS_TABLE_SQL);
  for (const migration of MIGRATIONS) {
    for (const statement of migration.statements) await db.exec(statement);
  }
  return {
    batch: (statements) =>
      db.transaction(async (tx) => {
        const results: SqlRow[][] = [];
        for (const statement of statements) {
          const result = await tx.query<SqlRow>(statement.text, statement.params);
          results.push(result.rows);
        }
        return results;
      }),
  };
}
