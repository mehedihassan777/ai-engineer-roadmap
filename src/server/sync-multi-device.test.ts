import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createDefaultState } from "@/lib/state/defaults";
import type { KeyValueStorage } from "@/lib/state/storage";
import { createStore, type Store } from "@/lib/state/store";
import type { PersistedState } from "@/lib/state/types";
import { createSyncEngine, type SyncEngine } from "@/lib/sync/engine";
import { NOTE_SEPARATOR } from "@/lib/sync/merge";
import { loadToken } from "@/lib/sync/meta";
import { HEALTH_PATH } from "@/lib/sync/protocol";
import { createHttpTransport } from "@/lib/sync/transport";
import { createSyncHandlers } from "./handlers";
import { createMemoryRepository } from "./memory-repository";
import type { SyncRepository } from "./repository";
import { createSqlRepository } from "./sql-repository";
import { createPgliteRunner } from "./testing";

const TOKEN = "t".repeat(40);
const TODAY = "2026-10-06";

class MemoryStorage implements KeyValueStorage {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

/** A fake network in front of the real API handlers, with switches for outages and races. */
function createServer(repository: SyncRepository, workspace: string) {
  let token = TOKEN;
  let handlers = createSyncHandlers({ config: { token }, repository, workspace });
  const server = {
    offline: false,
    healthy: true,
    gets: 0,
    puts: 0,
    urls: [] as string[],
    beforePut: undefined as undefined | (() => Promise<void> | void),
    setToken(next: string) {
      token = next;
      handlers = createSyncHandlers({ config: { token }, repository, workspace });
    },
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (server.offline) throw new TypeError("fetch failed");
      const url = new URL(String(input), "http://localhost");
      if (url.pathname === HEALTH_PATH) return Response.json({ sync: server.healthy });
      server.urls.push(url.pathname + url.search);
      const request = new Request(url, init);
      if (init?.method === "PUT") {
        server.puts += 1;
        const hook = server.beforePut;
        server.beforePut = undefined;
        await hook?.();
        return handlers.put(request);
      }
      server.gets += 1;
      return handlers.get(request);
    }) as typeof fetch,
  };
  return server;
}
type TestServer = ReturnType<typeof createServer>;

interface Device {
  storage: MemoryStorage;
  store: Store;
  engine: SyncEngine;
  state: () => PersistedState;
}

let idCounter = 0;
function boot(server: TestServer, storage = new MemoryStorage()): Device {
  const store = createStore({ storage, today: () => TODAY, now: () => new Date("2026-10-06T10:00:00.000Z"), newId: () => `id-${(idCounter += 1)}` });
  const transport = createHttpTransport({ getToken: () => loadToken(storage), fetchImpl: server.fetch });
  const engine = createSyncEngine({ store, storage, transport, locks: null, debounceMs: 5, isOnline: () => !server.offline, isVisible: () => true });
  return { storage, store, engine, state: () => store.getSnapshot().state };
}

let runner: Awaited<ReturnType<typeof createPgliteRunner>>;
let testNumber = 0;
beforeAll(async () => {
  runner = await createPgliteRunner();
});
const newServer = () => createServer(createSqlRepository(runner), `ws-${(testNumber += 1)}`);

async function connected(server: TestServer, setup?: (device: Device) => void): Promise<Device> {
  const device = boot(server);
  setup?.(device);
  const result = await device.engine.connect(TOKEN);
  expect(result.ok).toBe(true);
  return device;
}

describe("connecting", () => {
  it("uploads this device's progress on the first connect", async () => {
    const server = newServer();
    const home = await connected(server, (d) => {
      d.store.toggleTaskDone("a");
      d.store.toggleTopic("dotnet-async");
    });
    const snap = home.engine.getSnapshot();
    expect(snap).toMatchObject({ available: true, connected: true, phase: "idle", pending: false, remoteUpdatedBy: "this-device" });
    expect(snap.lastSyncedAt).not.toBeNull();
    expect(server.puts).toBe(1);
  });

  it("a new device receives everything and does not echo it back", async () => {
    const server = newServer();
    await connected(server, (d) => d.store.toggleTaskDone("a"));
    const office = await connected(server);
    expect(office.state().tasks).toEqual({ a: "done" });
    expect(office.store.getSnapshot().hasBackup).toBe(false); // nothing of its own to lose
    expect(server.puts).toBe(1); // the office only pulled
    expect(office.engine.getSnapshot()).toMatchObject({ pending: false, remoteUpdatedBy: "another-device" });
  });

  it("merges a device that already has progress, keeps the cloud start date and offers an undo", async () => {
    const server = newServer();
    await connected(server, (d) => {
      d.store.setStartDate("2026-09-14");
      d.store.toggleTaskDone("home-task");
      d.store.setTaskStatus("shared", "in-progress");
    });
    const office = boot(server);
    office.store.setStartDate("2026-10-10");
    office.store.toggleTaskDone("office-task");
    office.store.toggleTaskDone("shared"); // done here, in progress in the cloud: the more advanced wins
    const result = await office.engine.connect(TOKEN);

    expect(result).toMatchObject({ ok: true });
    expect(office.state().tasks).toEqual({ "home-task": "done", "office-task": "done", shared: "done" });
    expect(office.state().startDate).toBe("2026-09-14");
    expect(result.ok && result.summary).toMatchObject({ fromCloud: expect.any(Number), fromThisDevice: expect.any(Number) });

    expect(office.store.getSnapshot().hasBackup).toBe(true);
    expect(office.store.undoReplace()).toBe(true);
    expect(office.state().tasks).toEqual({ "office-task": "done", shared: "done" });
    expect(office.state().startDate).toBe("2026-10-10");
  });

  it("does not report 'connected' until the first sync has succeeded (so the connect form can show errors)", async () => {
    const server = newServer();
    const device = boot(server);
    const seen: boolean[] = [];
    device.engine.subscribe(() => seen.push(device.engine.getSnapshot().connected));

    await device.engine.connect("w".repeat(40)); // rejected
    expect(seen.every((connected) => connected === false)).toBe(true);

    seen.length = 0;
    await device.engine.connect(TOKEN); // accepted
    expect(seen.at(-1)).toBe(true);
    expect(seen.slice(0, -1).every((connected) => connected === false)).toBe(true);
  });

  it("rejects a wrong token and leaves nothing connected", async () => {
    const server = newServer();
    const device = boot(server);
    const result = await device.engine.connect("w".repeat(40));
    expect(result).toEqual({ ok: false, error: "That token was rejected by the server." });
    expect(loadToken(device.storage)).toBeNull();
    expect(device.engine.getSnapshot().connected).toBe(false);
  });

  it("explains when the server has no sync", async () => {
    const server = newServer();
    server.healthy = false;
    const device = boot(server);
    expect(await device.engine.connect(TOKEN)).toEqual({ ok: false, error: "Cloud sync is not set up on this server." });
    expect(device.engine.getSnapshot().available).toBe(false);
  });

  it("refuses cloud data written by a newer app version, and does not stay connected", async () => {
    const repository = createMemoryRepository();
    const server = createServer(repository, "main");
    await repository.put({ workspace: "main", baseRev: 0, deviceId: "future", state: { ...createDefaultState(TODAY), schemaVersion: 9 } as unknown as PersistedState });
    const device = boot(server);
    const result = await device.engine.connect(TOKEN);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain("newer version");
    expect(loadToken(device.storage)).toBeNull();
  });

  it("disconnect forgets the token but keeps local progress", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.toggleTaskDone("a"));
    home.engine.disconnect();
    expect(loadToken(home.storage)).toBeNull();
    expect(home.state().tasks).toEqual({ a: "done" });
    expect(home.engine.getSnapshot()).toMatchObject({ connected: false, phase: "idle", lastSyncedAt: null });
    const puts = server.puts;
    home.store.toggleTaskDone("b");
    await home.engine.syncNow();
    expect(server.puts).toBe(puts); // nothing is uploaded once disconnected
  });
});

describe("syncing between home and office", () => {
  it("shows a tick made at home on the office machine, and back", async () => {
    const server = newServer();
    const home = await connected(server);
    const office = await connected(server);

    home.store.toggleTaskDone("w01-claude-md");
    await home.engine.syncNow();
    await office.engine.syncNow();
    expect(office.state().tasks).toEqual({ "w01-claude-md": "done" });

    office.store.setTaskStatus("w01-dsa-1", "in-progress");
    office.store.addDsaEntry({ date: TODAY, name: "Two Sum", difficulty: "easy", patternId: "arrays-hashing" });
    await office.engine.syncNow();
    await home.engine.syncNow();
    expect(home.state().tasks).toEqual({ "w01-claude-md": "done", "w01-dsa-1": "in-progress" });
    expect(home.state().dsaLog).toHaveLength(1);
  });

  it("propagates an untick", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.toggleTaskDone("x"));
    const office = await connected(server);
    expect(office.state().tasks.x).toBe("done");

    home.store.toggleTaskDone("x");
    await home.engine.syncNow();
    await office.engine.syncNow();
    expect(office.state().tasks).toEqual({});
  });

  it("keeps edits made on both machines while offline, on different items", async () => {
    const server = newServer();
    const home = await connected(server);
    const office = await connected(server);

    server.offline = true;
    home.store.toggleTaskDone("done-at-home");
    office.store.toggleTaskDone("done-at-office");
    await home.engine.syncNow();
    await office.engine.syncNow();
    expect(home.engine.getSnapshot()).toMatchObject({ phase: "offline", pending: true });
    expect(home.engine.getSnapshot().message).toMatch(/offline/i);
    expect(home.state().tasks).toEqual({ "done-at-home": "done" }); // still saved locally

    server.offline = false;
    await home.engine.syncNow();
    await office.engine.syncNow();
    await home.engine.syncNow();
    const expected = { "done-at-home": "done", "done-at-office": "done" };
    expect(home.state().tasks).toEqual(expected);
    expect(office.state().tasks).toEqual(expected);
    expect(home.engine.getSnapshot()).toMatchObject({ phase: "idle", pending: false });
  });

  it("on a real conflict the device that syncs last wins, and everyone converges", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.toggleTaskDone("c"));
    const office = await connected(server);

    server.offline = true;
    home.store.toggleTaskDone("c"); // unticked at home
    office.store.setTaskStatus("c", "in-progress"); // changed at the office
    await home.engine.syncNow();
    await office.engine.syncNow();
    server.offline = false;

    await home.engine.syncNow(); // home syncs first
    await office.engine.syncNow(); // office syncs last: its change wins
    await home.engine.syncNow();
    expect(home.state().tasks.c).toBe("in-progress");
    expect(office.state().tasks.c).toBe("in-progress");
  });

  it("never loses written notes: both versions are kept", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.setNote(1, "base"));
    const office = await connected(server);

    server.offline = true;
    home.store.setNote(1, "from home");
    office.store.setNote(1, "from office");
    await home.engine.syncNow();
    await office.engine.syncNow();
    server.offline = false;
    await home.engine.syncNow();
    await office.engine.syncNow();
    await home.engine.syncNow();

    const note = home.state().notes["1"];
    expect(note).toBe(`from office${NOTE_SEPARATOR}from home`);
    expect(office.state().notes["1"]).toBe(note);
  });

  it("recovers when two devices push at the same moment (409), without losing either change", async () => {
    const server = newServer();
    const home = await connected(server);
    const office = await connected(server);
    const putsBefore = server.puts;

    home.store.toggleTaskDone("from-home");
    server.beforePut = async () => {
      // The office sneaks its push in between the home's pull and the home's push.
      office.store.toggleTaskDone("from-office");
      await office.engine.syncNow();
    };
    await home.engine.syncNow();

    expect(server.puts - putsBefore).toBe(3); // office (1) + home rejected (1) + home retried (1)
    await office.engine.syncNow();
    const expected = { "from-home": "done", "from-office": "done" };
    expect(home.state().tasks).toEqual(expected);
    expect(office.state().tasks).toEqual(expected);
  });

  it("remembers what it last agreed on across a restart, so deletions still propagate", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.toggleTaskDone("x"));
    const office = await connected(server);

    const restarted = boot(server, home.storage); // same browser storage, fresh page load
    expect(restarted.state().tasks).toEqual({ x: "done" });
    restarted.store.toggleTaskDone("x"); // untick after the restart
    await restarted.engine.syncNow();
    await office.engine.syncNow();
    expect(office.state().tasks).toEqual({});
  });

  it("does not send anything when nothing changed, and asks for 'unchanged' instead of the full state", async () => {
    const server = newServer();
    const home = await connected(server, (d) => d.store.toggleTaskDone("a"));
    const putsBefore = server.puts;
    server.urls.length = 0;

    await home.engine.syncNow();
    await home.engine.syncNow();
    expect(server.puts).toBe(putsBefore);
    expect(server.urls).toHaveLength(2);
    expect(server.urls.every((url) => /\?rev=\d+$/.test(url))).toBe(true);
  });

  it("stops (and says why) when the token stops being accepted", async () => {
    const server = newServer();
    const home = await connected(server);
    server.setToken("r".repeat(40)); // the secret was rotated on the server
    home.store.toggleTaskDone("a");
    await home.engine.syncNow();
    expect(home.engine.getSnapshot()).toMatchObject({ phase: "unauthorized", pending: true });
    expect(home.engine.getSnapshot().message).toMatch(/token/);
    expect(home.state().tasks).toEqual({ a: "done" }); // local progress untouched
  });
});

describe("automatic syncing", () => {
  afterEach(() => vi.useRealTimers());

  it("uploads shortly after a local change without being asked", async () => {
    vi.useFakeTimers();
    const repository = createMemoryRepository();
    const server = createServer(repository, "main");
    const home = boot(server);
    expect((await home.engine.connect(TOKEN)).ok).toBe(true);
    home.engine.start();

    home.store.toggleTaskDone("auto");
    expect(home.engine.getSnapshot().pending).toBe(true);
    await vi.advanceTimersByTimeAsync(50);

    expect((await repository.get("main"))?.state.tasks).toEqual({ auto: "done" });
    expect(home.engine.getSnapshot().pending).toBe(false);
    home.engine.stop();
  });

  it("does nothing on the network when this device is not connected", async () => {
    vi.useFakeTimers();
    const server = newServer();
    const device = boot(server);
    device.engine.start();
    await vi.advanceTimersByTimeAsync(10);
    device.store.toggleTaskDone("local-only");
    await vi.advanceTimersByTimeAsync(100);
    expect(server.gets + server.puts).toBe(0);
    expect(device.engine.getSnapshot()).toMatchObject({ available: true, connected: false, pending: false });
    device.engine.stop();
  });

  it("retries after a network failure", async () => {
    vi.useFakeTimers();
    const server = createServer(createMemoryRepository(), "main"); // PGlite needs real timers
    const home = await connected(server);
    home.engine.start();
    server.offline = true;
    home.store.toggleTaskDone("later");
    await vi.advanceTimersByTimeAsync(50);
    expect(home.engine.getSnapshot().phase).toBe("offline");

    server.offline = false;
    // Two attempts failed while offline (the initial one and the debounced one), so the backoff has doubled to 30 s.
    await vi.advanceTimersByTimeAsync(40_000);
    expect(home.engine.getSnapshot()).toMatchObject({ phase: "idle", pending: false });
    home.engine.stop();
  });
});
