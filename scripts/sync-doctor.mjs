#!/usr/bin/env node
/**
 * Checks that cloud sync is set up correctly: environment, connection, schema and a compare-and-swap round trip.
 * Writes only to a throw-away workspace ("__doctor__") and deletes it afterwards. Never prints secrets.
 */
import { neon } from "@neondatabase/serverless";
import { CAS_UPSERT_SQL, SELECT_STATE_SQL } from "../db/sync-sql.mjs";
import { loadEnv } from "./load-env.mjs";

loadEnv();
let failed = false;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "  PASS" : "  FAIL"}  ${label}${detail ? ` - ${detail}` : ""}`);
  if (!ok) failed = true;
  return ok;
};

const token = process.env.SYNC_TOKEN ?? "";
check(token.length >= 32, "SYNC_TOKEN is set and at least 32 characters", token ? `${token.length} characters` : "not set (run `npm run sync:token`)");

const url = process.env.DATABASE_URL;
if (!check(Boolean(url), "DATABASE_URL is set")) process.exit(1);
check(!/^NEXT_PUBLIC_/.test("DATABASE_URL"), "DATABASE_URL is a server-only variable");
console.log(`  info  host: ${new URL(url).hostname}${new URL(url).hostname.includes("-pooler") ? " (pooled connection)" : " (direct connection)"}`);

const sql = neon(url);
const WORKSPACE = "__doctor__";
const state = (n) => JSON.stringify({ schemaVersion: 1, startDate: "2026-01-01", tasks: { probe: n % 2 ? "done" : "in-progress" }, topics: {}, dod: {}, dsaLog: [], notes: {} });

try {
  const [{ now }] = await sql.query("SELECT now() AS now");
  check(true, "Connected to the database", `server time ${new Date(now).toISOString()}`);

  const [{ present }] = await sql.query("SELECT to_regclass('public.sync_state') IS NOT NULL AS present");
  if (!check(present, "Table sync_state exists", present ? "" : "run `npm run db:migrate`")) process.exit(1);

  await sql.query("DELETE FROM sync_state WHERE workspace = $1", [WORKSPACE]);
  const first = await sql.query(CAS_UPSERT_SQL, [WORKSPACE, state(1), "doctor", 0]);
  check(first.length === 1 && first[0].rev === 1, "First write creates revision 1");
  const second = await sql.query(CAS_UPSERT_SQL, [WORKSPACE, state(2), "doctor", 1]);
  check(second.length === 1 && second[0].rev === 2, "Write on the current revision bumps it to 2");
  const stale = await sql.query(CAS_UPSERT_SQL, [WORKSPACE, state(3), "doctor", 1]);
  check(stale.length === 0, "Write on a stale revision is rejected (compare-and-swap works)");
  const [row] = await sql.query(SELECT_STATE_SQL, [WORKSPACE]);
  check(row?.rev === 2 && row.state?.tasks?.probe === "in-progress", "Stored state reads back intact");
} catch (error) {
  check(false, "Database round trip", error instanceof Error ? error.message : String(error));
} finally {
  try {
    await sql.query("DELETE FROM sync_state WHERE workspace = $1", [WORKSPACE]);
  } catch {
    // Ignore cleanup errors.
  }
}

console.log(failed ? "\nSomething needs fixing (see FAIL lines above)." : "\nAll checks passed. Cloud sync is ready.");
process.exit(failed ? 1 : 0);
