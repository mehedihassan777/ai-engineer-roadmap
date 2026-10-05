import "server-only";
import { readSyncConfig } from "./config";
import { createSyncHandlers, type SyncHandlers } from "./handlers";
import { createMemoryRepository } from "./memory-repository";
import { createNeonRunner } from "./neon-runner";
import type { SyncRepository } from "./repository";
import { createSqlRepository } from "./sql-repository";

interface SyncDeps {
  handlers: SyncHandlers;
  available: boolean;
  problem: string | null;
}

const FAILURE_DELAY_MS = 250;

// Cached on globalThis so dev hot reloads keep the dev-only in-memory store alive.
const globalForSync = globalThis as typeof globalThis & { __airSyncDeps?: SyncDeps };

function build(): SyncDeps {
  const { config, problem } = readSyncConfig(process.env);
  let repository: SyncRepository | null = null;
  if (config?.store.kind === "neon") repository = createSqlRepository(createNeonRunner(config.store.url));
  if (config?.store.kind === "memory") repository = createMemoryRepository();

  if (problem) console.warn(`[sync] disabled: ${problem}`);
  return {
    handlers: createSyncHandlers({ config, repository, failureDelayMs: FAILURE_DELAY_MS }),
    available: config !== null,
    problem,
  };
}

/** The sync handlers wired to this server's environment. Server-only: it reads secrets. */
export function getSyncDeps(): SyncDeps {
  globalForSync.__airSyncDeps ??= build();
  return globalForSync.__airSyncDeps;
}
