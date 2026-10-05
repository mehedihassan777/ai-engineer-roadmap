/** Reads the sync configuration from environment variables. Pure (takes the env as an argument) so it is easy to test. */

export const MIN_TOKEN_LENGTH = 32;

export type StoreConfig = { kind: "neon"; url: string } | { kind: "memory" };

export interface SyncConfig {
  /** The shared secret every device must send. */
  token: string;
  store: StoreConfig;
}

export interface ConfigResult {
  /** Null when sync is not (fully) configured. */
  config: SyncConfig | null;
  /** Why sync is off despite some settings being present; null when simply not configured. */
  problem: string | null;
}

type Env = Record<string, string | undefined>;

/**
 * - DATABASE_URL        Neon connection string (pooled is fine for the app).
 * - SYNC_TOKEN          Shared secret, at least 32 characters. Create one with `npm run sync:token`.
 * - SYNC_STORE=memory   Development only: keep data in the server's memory instead of a database.
 */
export function readSyncConfig(env: Env): ConfigResult {
  const token = env.SYNC_TOKEN?.trim() ?? "";
  const databaseUrl = env.DATABASE_URL?.trim() ?? "";
  const wantsMemory = env.SYNC_STORE === "memory";

  if (token === "" && databaseUrl === "" && !wantsMemory) return { config: null, problem: null };

  if (token === "") return { config: null, problem: "SYNC_TOKEN is not set (create one with `npm run sync:token`)." };
  if (token.length < MIN_TOKEN_LENGTH) {
    return { config: null, problem: `SYNC_TOKEN must be at least ${MIN_TOKEN_LENGTH} characters (use \`npm run sync:token\`).` };
  }

  if (databaseUrl !== "") return { config: { token, store: { kind: "neon", url: databaseUrl } }, problem: null };

  if (wantsMemory) {
    if (env.NODE_ENV === "production") {
      return { config: null, problem: "SYNC_STORE=memory is for development only and is ignored in production." };
    }
    return { config: { token, store: { kind: "memory" } }, problem: null };
  }
  return { config: null, problem: "DATABASE_URL is not set." };
}
