import {
  HEALTH_PATH,
  SYNC_PATH,
  type ConflictResponse,
  type HealthResponse,
  type PullResponse,
  type PushRequest,
  type PushResponse,
} from "./protocol";

export type SyncErrorKind =
  /** The server rejected the token. */
  | "unauthorized"
  /** This server has no sync configured. */
  | "unavailable"
  /** The request never got an answer (offline, DNS, server down). */
  | "network"
  /** The server answered with an error or something unreadable. */
  | "server";

export class SyncError extends Error {
  constructor(
    readonly kind: SyncErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "SyncError";
  }
}

export type PushResult = { ok: true; response: PushResponse } | { ok: false; conflict: ConflictResponse };

export interface Transport {
  /** Whether this server offers sync. Never throws: any failure means "not available". */
  health(): Promise<boolean>;
  /** Pass the revision you already hold to get `unchanged` instead of the full state. */
  pull(knownRev: number | null): Promise<PullResponse>;
  push(request: PushRequest): Promise<PushResult>;
}

interface HttpTransportOptions {
  getToken: () => string | null;
  fetchImpl?: typeof fetch;
  /** Prefix for the API paths; empty for same-origin. */
  baseUrl?: string;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new SyncError("server", `The server sent an unreadable response (HTTP ${response.status}).`);
  }
}

function failureFor(response: Response, body: unknown): SyncError {
  if (response.status === 401) return new SyncError("unauthorized", "The server rejected the sync token.");
  if (response.status === 503 || response.status === 404) return new SyncError("unavailable", "Cloud sync is not set up on this server.");
  const hint = typeof body === "object" && body !== null && "hint" in body ? String((body as { hint: unknown }).hint) : null;
  return new SyncError("server", hint ?? `The server answered HTTP ${response.status}.`);
}

/** Talks to /api/sync with the device's token as a bearer header. */
export function createHttpTransport({ getToken, fetchImpl, baseUrl = "" }: HttpTransportOptions): Transport {
  const doFetch = fetchImpl ?? ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init));

  async function send(path: string, init: RequestInit & { json?: unknown } = {}): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = { accept: "application/json" };
    if (token) headers.authorization = `Bearer ${token}`;
    if (init.json !== undefined) headers["content-type"] = "application/json";
    try {
      return await doFetch(`${baseUrl}${path}`, {
        method: init.method ?? "GET",
        headers,
        body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
        cache: "no-store",
      });
    } catch (error) {
      throw new SyncError("network", error instanceof Error ? error.message : "Could not reach the server.");
    }
  }

  return {
    async health() {
      try {
        const response = await send(HEALTH_PATH);
        if (!response.ok) return false;
        return ((await response.json()) as HealthResponse).sync === true;
      } catch {
        return false;
      }
    },

    async pull(knownRev) {
      const response = await send(knownRev === null ? SYNC_PATH : `${SYNC_PATH}?rev=${knownRev}`);
      const body = await readJson(response);
      if (!response.ok) throw failureFor(response, body);
      return body as PullResponse;
    },

    async push(request) {
      const response = await send(SYNC_PATH, { method: "PUT", json: request });
      const body = await readJson(response);
      if (response.status === 409) return { ok: false, conflict: body as ConflictResponse };
      if (!response.ok) throw failureFor(response, body);
      return { ok: true, response: body as PushResponse };
    },
  };
}
