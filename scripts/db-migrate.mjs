#!/usr/bin/env node
/**
 * Applies db/migrations.mjs to your Neon database. Safe to run repeatedly.
 * Uses DATABASE_URL_UNPOOLED (direct connection, recommended for schema changes) when set, else DATABASE_URL.
 */
import { neon } from "@neondatabase/serverless";
import { MIGRATIONS, MIGRATIONS_TABLE_SQL } from "../db/migrations.mjs";
import { loadEnv } from "./load-env.mjs";

loadEnv();
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local (Neon console > Connect > connection string).");
  process.exit(1);
}

const sql = neon(url);
try {
  await sql.query(MIGRATIONS_TABLE_SQL);
  const applied = new Set((await sql.query("SELECT id FROM schema_migrations")).map((row) => row.id));

  let count = 0;
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) {
      console.log(`  skip   ${migration.id} (already applied)`);
      continue;
    }
    await sql.transaction([
      ...migration.statements.map((statement) => sql.query(statement)),
      sql.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migration.id]),
    ]);
    console.log(`  apply  ${migration.id}`);
    count += 1;
  }
  console.log(count === 0 ? "Database is up to date." : `Applied ${count} migration(s).`);
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
}
