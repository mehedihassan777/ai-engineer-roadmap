import { describe, expect, it, vi } from "vitest";
import { createDefaultState } from "./defaults";
import { BACKUP_KEY, CORRUPT_KEY, STORAGE_KEY, type KeyValueStorage } from "./storage";
import { createStore, type StoreOptions } from "./store";
import type { PersistedState } from "./types";

class MemoryStorage implements KeyValueStorage {
  data = new Map<string, string>();
  failWrites = false;
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}

const TODAY = "2026-10-06";
let counter = 0;
const options = (storage: KeyValueStorage | null, overrides: Partial<StoreOptions> = {}): StoreOptions => ({
  storage,
  today: () => TODAY,
  now: () => new Date("2026-10-06T10:00:00.000Z"),
  newId: () => `id-${(counter += 1)}`,
  ...overrides,
});

const stored = (storage: MemoryStorage): PersistedState => JSON.parse(storage.data.get(STORAGE_KEY) ?? "null");

describe("first run", () => {
  it("starts on a default state whose start date is today, and saves it", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));
    const snapshot = store.getSnapshot();
    expect(snapshot.state).toEqual(createDefaultState(TODAY));
    expect(snapshot.persistent).toBe(true);
    expect(snapshot.notice).toBeNull();
    expect(stored(storage).startDate).toBe(TODAY); // saved immediately, so "week 1" does not move tomorrow
  });

  it("keeps working in memory when storage is unavailable", () => {
    const store = createStore(options(null));
    store.toggleTaskDone("a");
    expect(store.getSnapshot().state.tasks).toEqual({ a: "done" });
    expect(store.getSnapshot().persistent).toBe(false);
  });
});

describe("persistence", () => {
  it("writes every change and a new store reads it back", () => {
    const storage = new MemoryStorage();
    const first = createStore(options(storage));
    first.toggleTaskDone("w01-claude-md");
    first.toggleTopic("dotnet-async");
    first.toggleDod("order-assistant:seed");
    first.setNote(1, "notes");
    first.setStartDate("2026-10-05");
    first.addDsaEntry({ date: TODAY, name: "Two Sum", difficulty: "easy", patternId: "arrays-hashing" });

    const second = createStore(options(storage)).getSnapshot().state;
    expect(second.tasks).toEqual({ "w01-claude-md": "done" });
    expect(second.topics).toEqual({ "dotnet-async": true });
    expect(second.dod).toEqual({ "order-assistant:seed": true });
    expect(second.notes).toEqual({ "1": "notes" });
    expect(second.startDate).toBe("2026-10-05");
    expect(second.dsaLog).toHaveLength(1);
  });

  it("returns the generated id from addDsaEntry", () => {
    const store = createStore(options(new MemoryStorage(), { newId: () => "fixed-id" }));
    expect(store.addDsaEntry({ date: TODAY, name: "3Sum", difficulty: "medium", patternId: "two-pointers" })).toBe("fixed-id");
    expect(store.getSnapshot().state.dsaLog[0].id).toBe("fixed-id");
  });

  it("stamps the export time", () => {
    const store = createStore(options(new MemoryStorage()));
    store.markExported();
    expect(store.getSnapshot().state.lastExportedAt).toBe("2026-10-06T10:00:00.000Z");
  });
});

describe("subscriptions", () => {
  it("notifies on change, not on no-ops, and stops after unsubscribe", () => {
    const store = createStore(options(new MemoryStorage()));
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.toggleTaskDone("a");
    expect(listener).toHaveBeenCalledTimes(1);

    store.setTaskStatus("a", "done"); // already done
    store.setNote(1, ""); // nothing to remove
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.toggleTaskDone("a");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("gives a new snapshot object only when something changed", () => {
    const store = createStore(options(new MemoryStorage()));
    const before = store.getSnapshot();
    store.setTaskStatus("a", "todo");
    expect(store.getSnapshot()).toBe(before);
    store.toggleTaskDone("a");
    expect(store.getSnapshot()).not.toBe(before);
  });

  it("serves a stable, empty server snapshot", () => {
    const store = createStore(options(new MemoryStorage()));
    store.toggleTaskDone("a");
    expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
    expect(store.getServerSnapshot().state.tasks).toEqual({});
  });
});

describe("damaged or incompatible saved data", () => {
  it("sets unreadable data aside instead of overwriting it silently", () => {
    const storage = new MemoryStorage();
    storage.data.set(STORAGE_KEY, "{not json");
    const store = createStore(options(storage));
    expect(store.getSnapshot().state).toEqual(createDefaultState(TODAY));
    expect(store.getSnapshot().notice).toMatch(/could not be read/);
    expect(storage.data.get(CORRUPT_KEY)).toBe("{not json");
  });

  it("does the same for data from a newer schema", () => {
    const storage = new MemoryStorage();
    const newer = JSON.stringify({ schemaVersion: 99, tasks: { a: "done" } });
    storage.data.set(STORAGE_KEY, newer);
    const store = createStore(options(storage));
    expect(store.getSnapshot().notice).toMatch(/newer version/);
    expect(storage.data.get(CORRUPT_KEY)).toBe(newer);
  });

  it("keeps readable data and reports ignored entries in a notice", () => {
    const storage = new MemoryStorage();
    storage.data.set(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, startDate: "2026-10-05", tasks: { a: "done", b: "??" } }));
    const store = createStore(options(storage));
    expect(store.getSnapshot().state.tasks).toEqual({ a: "done" });
    expect(store.getSnapshot().notice).toMatch(/Ignored 1 invalid task progress entry/);
  });
});

describe("save failures", () => {
  it("flags the problem, keeps the state in memory and recovers when writes work again", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));

    storage.failWrites = true;
    store.toggleTaskDone("a");
    expect(store.getSnapshot().state.tasks).toEqual({ a: "done" });
    expect(store.getSnapshot().persistent).toBe(false);
    expect(store.getSnapshot().notice).toMatch(/Could not save/);

    storage.failWrites = false;
    store.toggleTaskDone("b");
    expect(store.getSnapshot().persistent).toBe(true);
    expect(store.getSnapshot().notice).toBeNull();
    expect(stored(storage).tasks).toEqual({ a: "done", b: "done" });
  });
});

describe("replace, reset and undo", () => {
  const imported: PersistedState = { ...createDefaultState("2026-01-05"), tasks: { imported: "done" } };

  it("replaces everything and can undo once", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));
    store.toggleTaskDone("mine");
    expect(store.getSnapshot().hasBackup).toBe(false);

    store.replaceState(imported);
    expect(store.getSnapshot().state.tasks).toEqual({ imported: "done" });
    expect(store.getSnapshot().state.startDate).toBe("2026-01-05");
    expect(store.getSnapshot().hasBackup).toBe(true);
    expect(stored(storage).tasks).toEqual({ imported: "done" });

    expect(store.undoReplace()).toBe(true);
    expect(store.getSnapshot().state.tasks).toEqual({ mine: "done" });
    expect(store.getSnapshot().hasBackup).toBe(false);
    expect(store.undoReplace()).toBe(false);
  });

  it("resets to a fresh state starting today, and can undo", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));
    store.toggleTaskDone("mine");
    store.setStartDate("2026-09-01");

    store.resetAll();
    expect(store.getSnapshot().state).toEqual(createDefaultState(TODAY));
    expect(store.getSnapshot().hasBackup).toBe(true);

    expect(store.undoReplace()).toBe(true);
    expect(store.getSnapshot().state.tasks).toEqual({ mine: "done" });
    expect(store.getSnapshot().state.startDate).toBe("2026-09-01");
    expect(storage.data.has(BACKUP_KEY)).toBe(false);
  });

  it("cannot undo without storage", () => {
    expect(createStore(options(null)).undoReplace()).toBe(false);
  });
});

describe("another tab changed storage", () => {
  it("reloads and notifies", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));
    const listener = vi.fn();
    store.subscribe(listener);

    storage.data.set(STORAGE_KEY, JSON.stringify({ ...createDefaultState("2026-10-05"), tasks: { fromOtherTab: "done" } }));
    store.reloadFromStorage();

    expect(store.getSnapshot().state.tasks).toEqual({ fromOtherTab: "done" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ignores unreadable data from the other tab", () => {
    const storage = new MemoryStorage();
    const store = createStore(options(storage));
    store.toggleTaskDone("a");
    storage.data.set(STORAGE_KEY, "garbage");
    store.reloadFromStorage();
    expect(store.getSnapshot().state.tasks).toEqual({ a: "done" });
  });
});
