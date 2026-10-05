import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultState } from "@/lib/state/defaults";
import type { PersistedState } from "@/lib/state/types";
import { MAX_BODY_BYTES } from "@/lib/sync/protocol";
import { createSyncHandlers, type SyncHandlers } from "./handlers";
import { createMemoryRepository } from "./memory-repository";
import type { SyncRepository } from "./repository";
import { createSqlRepository } from "./sql-repository";
import { createPgliteRunner } from "./testing";

const TOKEN = "k".repeat(40);
const URL_BASE = "http://localhost/api/sync";

const state = (overrides: Partial<PersistedState> = {}): PersistedState => ({
  ...createDefaultState("2026-10-05"),
  tasks: { "w01-claude-md": "done" },
  ...overrides,
});

const auth = (token: string = TOKEN) => ({ authorization: `Bearer ${token}` });
const get = (handlers: SyncHandlers, query = "", headers: Record<string, string> = auth()) =>
  handlers.get(new Request(`${URL_BASE}${query}`, { headers }));
const put = (handlers: SyncHandlers, body: unknown, headers: Record<string, string> = auth()) =>
  handlers.put(new Request(URL_BASE, { method: "PUT", headers: { ...headers, "content-type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const push = (handlers: SyncHandlers, baseRev: number, s: PersistedState = state(), deviceId = "home-pc") => put(handlers, { baseRev, deviceId, state: s });

function suite(name: string, createRepository: () => Promise<SyncRepository>) {
  describe(name, () => {
    const make = async () => createSyncHandlers({ config: { token: TOKEN }, repository: await createRepository() });

    it("answers 503 when sync is not configured", async () => {
      const handlers = createSyncHandlers({ config: null, repository: null });
      expect((await get(handlers)).status).toBe(503);
      expect((await push(handlers, 0)).status).toBe(503);
    });

    it("answers 401 without a valid bearer token", async () => {
      const handlers = await make();
      expect((await get(handlers, "", {})).status).toBe(401);
      expect((await get(handlers, "", auth("wrong".repeat(10)))).status).toBe(401);
      expect((await get(handlers, "", { authorization: `Basic ${TOKEN}` })).status).toBe(401);
      expect((await push(handlers, 0, state(), "x")).status).toBe(200); // control: right token works
      expect((await put(handlers, { baseRev: 0, deviceId: "x", state: state() }, auth("nope"))).status).toBe(401);
    });

    it("never caches responses", async () => {
      const handlers = await make();
      expect((await get(handlers)).headers.get("cache-control")).toBe("no-store");
      expect((await get(handlers, "", {})).headers.get("cache-control")).toBe("no-store");
    });

    it("returns an empty document before the first push", async () => {
      const handlers = await make();
      const response = await get(handlers);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ rev: 0, state: null });
    });

    it("stores a push, returns it on pull, and reports 'unchanged' for a known revision", async () => {
      const handlers = await make();
      const pushed = await push(handlers, 0, state({ topics: { "dotnet-async": true } }), "home-pc");
      expect(pushed.status).toBe(200);
      expect(await pushed.json()).toMatchObject({ rev: 1 });

      const pulled = await (await get(handlers)).json();
      expect(pulled).toMatchObject({ rev: 1, updatedBy: "home-pc" });
      expect(pulled.state.topics).toEqual({ "dotnet-async": true });

      expect(await (await get(handlers, "?rev=1")).json()).toMatchObject({ rev: 1, unchanged: true });
      expect((await (await get(handlers, "?rev=0")).json()).state).not.toBeUndefined();
      expect((await (await get(handlers, "?rev=abc")).json()).state).not.toBeUndefined();
    });

    it("answers 409 with the current state when the base revision is stale", async () => {
      const handlers = await make();
      await push(handlers, 0, state({ tasks: { first: "done" } }), "home-pc");
      await push(handlers, 1, state({ tasks: { second: "done" } }), "office-pc");

      const stale = await push(handlers, 1, state({ tasks: { third: "done" } }), "home-pc");
      expect(stale.status).toBe(409);
      const body = await stale.json();
      expect(body).toMatchObject({ error: "conflict", rev: 2, updatedBy: "office-pc" });
      expect(body.state.tasks).toEqual({ second: "done" });
    });

    it("does not store device-local fields", async () => {
      const handlers = await make();
      await push(handlers, 0, state({ lastExportedAt: "2026-10-06T10:00:00.000Z" }));
      expect((await (await get(handlers)).json()).state.lastExportedAt).toBeUndefined();
    });

    it("sanitises incoming state instead of trusting it", async () => {
      const handlers = await make();
      const dirty = { ...state(), tasks: { good: "done", bad: "maybe" }, dsaLog: [{ id: "1", date: "nope", name: "x", difficulty: "easy" }] };
      expect((await push(handlers, 0, dirty as unknown as PersistedState)).status).toBe(200);
      const stored = (await (await get(handlers)).json()).state;
      expect(stored.tasks).toEqual({ good: "done" });
      expect(stored.dsaLog).toEqual([]);
    });

    it.each([
      ["not JSON", "{oops"],
      ["not an object", "[1]"],
      ["negative base revision", { baseRev: -1, deviceId: "x", state: state() }],
      ["fractional base revision", { baseRev: 1.5, deviceId: "x", state: state() }],
      ["missing device id", { baseRev: 0, state: state() }],
      ["device id with bad characters", { baseRev: 0, deviceId: "bad id!", state: state() }],
      ["missing state", { baseRev: 0, deviceId: "x" }],
      ["invalid start date", { baseRev: 0, deviceId: "x", state: { ...state(), startDate: "2026-02-30" } }],
      ["newer schema", { baseRev: 0, deviceId: "x", state: { ...state(), schemaVersion: 9 } }],
    ])("rejects a bad push: %s", async (_label, body) => {
      const handlers = await make();
      expect((await put(handlers, body)).status).toBe(400);
      expect(await (await get(handlers)).json()).toEqual({ rev: 0, state: null }); // nothing stored
    });

    it("rejects an oversized body", async () => {
      const handlers = await make();
      const huge = JSON.stringify({ baseRev: 0, deviceId: "x", state: state({ notes: { "1": "x".repeat(MAX_BODY_BYTES) } }) });
      expect((await put(handlers, huge)).status).toBe(413);
    });
  });
}

suite("sync handlers over the memory repository", async () => createMemoryRepository());
suite("sync handlers over the SQL repository on PGlite", async () => createSqlRepository(await createPgliteRunner()));

describe("failures and brute force", () => {
  afterEach(() => vi.restoreAllMocks());

  it("turns storage errors into a 500 without leaking details, with a hint when the schema is missing", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const failing = (message: string): SyncRepository => ({
      get: async () => {
        throw new Error(message);
      },
      put: async () => {
        throw new Error(message);
      },
    });

    const missing = createSyncHandlers({ config: { token: TOKEN }, repository: failing('relation "sync_state" does not exist') });
    const response = await get(missing);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "storage_error", hint: "The database schema is missing. Run `npm run db:migrate`." });

    const other = createSyncHandlers({ config: { token: TOKEN }, repository: failing("password authentication failed for user secret_user") });
    const body = await (await push(other, 0)).json();
    expect(body).toEqual({ error: "storage_error" });
    expect(JSON.stringify(body)).not.toContain("secret_user");
    expect(consoleError).toHaveBeenCalled();
  });

  it("delays answers to wrong tokens", async () => {
    vi.useFakeTimers();
    try {
      const handlers = createSyncHandlers({ config: { token: TOKEN }, repository: createMemoryRepository(), failureDelayMs: 300 });
      let settled = false;
      const pending = get(handlers, "", auth("wrong")).then((response) => {
        settled = true;
        return response;
      });
      await vi.advanceTimersByTimeAsync(200);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(150);
      expect((await pending).status).toBe(401);
    } finally {
      vi.useRealTimers();
    }
  });
});
