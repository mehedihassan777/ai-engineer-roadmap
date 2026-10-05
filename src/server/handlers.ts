import { isValidDateString } from "@/lib/dates";
import { MAX_BODY_BYTES, toSyncedState, type ConflictResponse, type PullResponse, type PushResponse } from "@/lib/sync/protocol";
import { parseState } from "@/lib/state/parse-state";
import { StateError, type PersistedState } from "@/lib/state/types";
import { readBearerToken, tokenMatches } from "./auth";
import type { SyncRepository } from "./repository";

export interface HandlerOptions {
  /** Null when sync is not configured: every request then gets 503. */
  config: { token: string } | null;
  repository: SyncRepository | null;
  /** Data is partitioned by workspace; this app uses a single one. */
  workspace?: string;
  /** Delay before answering a wrong token (slows guessing). */
  failureDelayMs?: number;
}

export interface SyncHandlers {
  get(request: Request): Promise<Response>;
  put(request: Request): Promise<Response>;
}

const DEVICE_ID = /^[A-Za-z0-9._-]{1,80}$/;
const FALLBACK_START_DATE = "1970-01-01";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

function storageFailure(error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error);
  // Log the reason (never the token or the data) so a failing deployment can be diagnosed.
  console.error("[sync] storage error:", message);
  if (/sync_state/.test(message) && /does not exist/.test(message)) {
    return json({ error: "storage_error", hint: "The database schema is missing. Run `npm run db:migrate`." }, 500);
  }
  return json({ error: "storage_error" }, 500);
}

/** The sync API as plain Request -> Response functions, so tests can call them without a server. */
export function createSyncHandlers(options: HandlerOptions): SyncHandlers {
  const workspace = options.workspace ?? "main";
  const failureDelayMs = options.failureDelayMs ?? 0;
  const { config, repository } = options;

  /** Returns an error response when the request must not proceed, otherwise null. */
  async function guard(request: Request): Promise<Response | null> {
    if (!config || !repository) return json({ error: "sync_not_configured" }, 503);
    const provided = readBearerToken(request);
    if (provided === null || !tokenMatches(provided, config.token)) {
      if (failureDelayMs > 0) await sleep(failureDelayMs);
      return json({ error: "unauthorized" }, 401);
    }
    return null;
  }

  return {
    async get(request) {
      const rejected = await guard(request);
      if (rejected) return rejected;
      if (!repository) return json({ error: "sync_not_configured" }, 503);

      const revParam = new URL(request.url).searchParams.get("rev");
      const knownRev = revParam !== null && /^\d+$/.test(revParam) ? Number(revParam) : null;

      try {
        const stored = await repository.get(workspace);
        if (!stored) return json({ rev: 0, state: null } satisfies PullResponse);
        if (knownRev === stored.rev) {
          return json({ rev: stored.rev, unchanged: true, updatedAt: stored.updatedAt, updatedBy: stored.updatedBy } satisfies PullResponse);
        }
        return json({ rev: stored.rev, state: stored.state, updatedAt: stored.updatedAt, updatedBy: stored.updatedBy } satisfies PullResponse);
      } catch (error) {
        return storageFailure(error);
      }
    },

    async put(request) {
      const rejected = await guard(request);
      if (rejected) return rejected;
      if (!repository) return json({ error: "sync_not_configured" }, 503);

      const declared = Number(request.headers.get("content-length") ?? 0);
      if (declared > MAX_BODY_BYTES) return json({ error: "too_large" }, 413);
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return json({ error: "too_large" }, 413);

      let body: unknown;
      try {
        body = JSON.parse(text);
      } catch {
        return json({ error: "invalid_json" }, 400);
      }
      if (!isRecord(body)) return json({ error: "invalid_request" }, 400);

      const { baseRev, deviceId, state } = body;
      if (typeof baseRev !== "number" || !Number.isInteger(baseRev) || baseRev < 0) return json({ error: "invalid_base_rev" }, 400);
      if (typeof deviceId !== "string" || !DEVICE_ID.test(deviceId)) return json({ error: "invalid_device_id" }, 400);
      if (!isRecord(state) || !isValidDateString(state.startDate)) return json({ error: "invalid_state" }, 400);

      let clean: PersistedState;
      try {
        clean = toSyncedState(parseState(state, FALLBACK_START_DATE).state);
      } catch (error) {
        return json({ error: "invalid_state", message: error instanceof StateError ? error.message : undefined }, 400);
      }

      try {
        const result = await repository.put({ workspace, baseRev, state: clean, deviceId });
        if (result.ok) return json({ rev: result.rev, updatedAt: result.updatedAt } satisfies PushResponse);
        const current = result.current;
        return json(
          {
            error: "conflict",
            rev: current?.rev ?? 0,
            state: current?.state ?? null,
            updatedAt: current?.updatedAt,
            updatedBy: current?.updatedBy,
          } satisfies ConflictResponse,
          409,
        );
      } catch (error) {
        return storageFailure(error);
      }
    },
  };
}
