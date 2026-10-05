import { neon } from "@neondatabase/serverless";
import type { SqlRow, SqlRunner } from "./sql-repository";

/** Neon's HTTP driver: the whole batch is sent in one request and runs as a single non-interactive transaction. */
export function createNeonRunner(connectionString: string): SqlRunner {
  const sql = neon(connectionString);
  return {
    async batch(statements) {
      const results = await sql.transaction(statements.map((statement) => sql.query(statement.text, statement.params as unknown[])));
      return results as unknown as SqlRow[][];
    },
  };
}
