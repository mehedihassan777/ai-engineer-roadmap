import { existsSync } from "node:fs";

/** Loads .env.local then .env (when present) without overriding variables that are already set. */
export function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}
