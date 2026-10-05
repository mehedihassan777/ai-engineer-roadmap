import type { KeyValueStorage } from "@/lib/state/storage";
import { parseState } from "@/lib/state/parse-state";
import { StateError, type PersistedState } from "@/lib/state/types";
import { deepEqual, mergeStates, type MergeSummary } from "./merge";
import { META_KEY, clearToken, freshMeta, loadMeta, loadToken, saveMeta, saveToken, type SyncMeta } from "./meta";
import { toSyncedState } from "./protocol";
import { SyncError, type Transport } from "./transport";

export type SyncPhase = "idle" | "syncing" | "offline" | "error" | "unauthorized";

export interface SyncSnapshot {
  /** Whether this server offers sync; null until it has been asked. */
  available: boolean | null;
  /** This device holds a token. */
  connected: boolean;
  phase: SyncPhase;
  message: string | null;
  lastSyncedAt: string | null;
  remoteUpdatedAt: string | null;
  remoteUpdatedBy: "this-device" | "another-device" | null;
  /** What the most recent merge did. */
  lastMerge: MergeSummary | null;
  /** This device has changes the cloud does not have yet. */
  pending: boolean;
}

export type ConnectResult = { ok: true; summary: MergeSummary | null } | { ok: false; error: string };

/** The part of the app store the engine needs. */
export interface EngineStore {
  getSnapshot(): { state: PersistedState };
  subscribe(listener: () => void): () => void;
  applyRemote(next: PersistedState, options?: { backup?: boolean }): void;
}

export interface EngineOptions {
  store: EngineStore;
  storage: KeyValueStorage | null;
  transport: Transport;
  now?: () => Date;
  /** Wait after the last local change before uploading. */
  debounceMs?: number;
  /** How often to check the cloud while the tab is visible. */
  pollMs?: number;
  /** Web Locks (shared by tabs of this browser). Pass null to disable. Defaults to navigator.locks. */
  locks?: { request<T>(name: string, callback: () => Promise<T>): Promise<T> } | null;
  isOnline?: () => boolean;
  isVisible?: () => boolean;
}

export interface SyncEngine {
  getSnapshot(): SyncSnapshot;
  subscribe(listener: () => void): () => void;
  /** Starts listening (store changes, focus, online/offline, polling) and checks whether the server offers sync. */
  start(): void;
  stop(): void;
  /** Stores the token, runs the first sync and reports the outcome. On failure nothing stays connected. */
  connect(token: string): Promise<ConnectResult>;
  /** Forgets the token and sync bookkeeping on this device. Local progress is kept. */
  disconnect(): void;
  syncNow(): Promise<void>;
}

const MAX_CONFLICT_RETRIES = 5;
const MAX_BACKOFF_MS = 300_000;
const BASE_BACKOFF_MS = 15_000;
const LOCK_NAME = "air-sync";

const syncedEqual = (a: PersistedState, b: PersistedState) => deepEqual(toSyncedState(a), toSyncedState(b));

function hasProgress(state: PersistedState): boolean {
  return (
    Object.keys(state.tasks).length > 0 ||
    Object.keys(state.topics).length > 0 ||
    Object.keys(state.dod).length > 0 ||
    state.dsaLog.length > 0 ||
    Object.keys(state.notes).length > 0
  );
}

export function createSyncEngine(options: EngineOptions): SyncEngine {
  const { store, storage, transport } = options;
  const now = options.now ?? (() => new Date());
  const debounceMs = options.debounceMs ?? 1_500;
  const pollMs = options.pollMs ?? 60_000;
  const locks = options.locks === undefined ? ((globalThis.navigator as { locks?: EngineOptions["locks"] } | undefined)?.locks ?? null) : options.locks;
  const isOnline = options.isOnline ?? (() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));
  const isVisible = options.isVisible ?? (() => (typeof document === "undefined" ? true : document.visibilityState !== "hidden"));

  const listeners = new Set<() => void>();
  let metaCache: { raw: string | null; meta: SyncMeta } | null = null;

  function readMeta(): SyncMeta {
    let raw: string | null = null;
    try {
      raw = storage?.getItem(META_KEY) ?? null;
    } catch {
      raw = null;
    }
    if (metaCache && metaCache.raw === raw) return metaCache.meta;
    const meta = loadMeta(storage);
    if (raw === null) saveMeta(storage, meta); // remember the device id from the very first run
    metaCache = { raw: storage?.getItem(META_KEY) ?? null, meta };
    return meta;
  }

  const isConnected = () => loadToken(storage) !== null;

  function computePending(): boolean {
    if (!isConnected()) return false;
    const meta = readMeta();
    return meta.base === null ? true : !syncedEqual(store.getSnapshot().state, meta.base);
  }

  const meta0 = readMeta();
  let snapshot: SyncSnapshot = {
    available: null,
    connected: isConnected(),
    phase: "idle",
    message: null,
    lastSyncedAt: meta0.lastSyncedAt,
    remoteUpdatedAt: meta0.remoteUpdatedAt,
    remoteUpdatedBy: meta0.remoteUpdatedBy === null ? null : meta0.remoteUpdatedBy === meta0.deviceId ? "this-device" : "another-device",
    lastMerge: null,
    pending: false,
  };
  snapshot = { ...snapshot, pending: computePending() };

  function update(patch: Partial<SyncSnapshot>): void {
    const next = { ...snapshot, ...patch };
    if (JSON.stringify(next) === JSON.stringify(snapshot)) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  // --- the sync round ------------------------------------------------------------------------------------------------

  function parseRemote(raw: PersistedState, fallbackStartDate: string): PersistedState {
    return toSyncedState(parseState(raw, fallbackStartDate).state);
  }

  /** One full pull -> merge -> apply -> push cycle. Throws on failure. */
  async function round(): Promise<void> {
    let conflicts = 0;
    for (;;) {
      const meta = readMeta();
      const firstConnect = meta.base === null;
      const pulled = await transport.pull(firstConnect ? null : meta.baseRev);

      let remote: PersistedState | null = null;
      if (pulled.unchanged && meta.base) remote = meta.base;
      else if (pulled.state) remote = parseRemote(pulled.state, store.getSnapshot().state.startDate);

      // Everything from here to applyRemote is synchronous, so no local edit can slip in between reading and merging.
      const local = store.getSnapshot().state;
      let merged = local;
      let summary: MergeSummary | null = null;
      if (remote) ({ merged, summary } = mergeStates(meta.base, local, remote));
      if (!syncedEqual(merged, local)) store.applyRemote(merged, { backup: firstConnect && remote !== null && hasProgress(local) });

      let rev = pulled.rev;
      let updatedAt = pulled.updatedAt ?? null;
      let updatedBy = pulled.updatedBy ?? null;
      if (remote === null || !syncedEqual(merged, remote)) {
        const result = await transport.push({ baseRev: pulled.rev, deviceId: meta.deviceId, state: toSyncedState(merged) });
        if (!result.ok) {
          conflicts += 1;
          if (conflicts >= MAX_CONFLICT_RETRIES) throw new SyncError("server", "Could not merge with the cloud after several tries; will retry.");
          continue; // someone else pushed in between: pull again and merge
        }
        rev = result.response.rev;
        updatedAt = result.response.updatedAt;
        updatedBy = meta.deviceId;
      }

      const syncedAt = now().toISOString();
      const next: SyncMeta = { ...meta, baseRev: rev, base: toSyncedState(merged), lastSyncedAt: syncedAt, remoteUpdatedAt: updatedAt, remoteUpdatedBy: updatedBy };
      saveMeta(storage, next);
      update({
        phase: "idle",
        message: null,
        lastSyncedAt: syncedAt,
        remoteUpdatedAt: updatedAt,
        remoteUpdatedBy: updatedBy === null ? null : updatedBy === meta.deviceId ? "this-device" : "another-device",
        lastMerge: summary ?? snapshot.lastMerge,
        pending: computePending(),
      });
      return;
    }
  }

  // --- scheduling and error handling ---------------------------------------------------------------------------------

  let running: Promise<void> | null = null;
  let rerun = false;
  let lastOk = true;
  let failures = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;

  function scheduleRetry(): void {
    clearTimeout(retryTimer);
    failures += 1;
    const delay = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * 2 ** (failures - 1));
    retryTimer = setTimeout(() => void syncNow(), delay);
  }

  function handleFailure(error: unknown): void {
    lastOk = false;
    if (error instanceof SyncError) {
      if (error.kind === "unauthorized") {
        update({ phase: "unauthorized", message: "The server rejected this device's sync token. Reconnect in Settings.", pending: computePending() });
        return; // retrying cannot help
      }
      if (error.kind === "unavailable") {
        update({ available: false, phase: "error", message: error.message, pending: computePending() });
        return;
      }
      if (error.kind === "network") {
        const offline = !isOnline();
        update({
          phase: offline ? "offline" : "error",
          message: offline
            ? "You are offline. Changes are saved on this device and will sync when you are back online."
            : `Could not reach the server (${error.message}). Will retry.`,
          pending: computePending(),
        });
        scheduleRetry();
        return;
      }
      update({ phase: "error", message: error.message, pending: computePending() });
      scheduleRetry();
      return;
    }
    if (error instanceof StateError) {
      update({ phase: "error", message: `The cloud data cannot be read by this version of the app: ${error.message}`, pending: computePending() });
      scheduleRetry();
      return;
    }
    update({ phase: "error", message: "Sync failed unexpectedly. Will retry.", pending: computePending() });
    scheduleRetry();
  }

  async function runRound(): Promise<void> {
    update({ phase: "syncing", message: null });
    try {
      await round();
      failures = 0;
      lastOk = true;
    } catch (error) {
      handleFailure(error);
    }
  }

  function syncNow(): Promise<void> {
    if (!isConnected()) return Promise.resolve();
    if (running) {
      rerun = true;
      return running;
    }
    clearTimeout(retryTimer);
    running = (async () => {
      do {
        rerun = false;
        await (locks ? locks.request(LOCK_NAME, runRound) : runRound());
      } while (rerun && lastOk);
    })().finally(() => {
      running = null;
    });
    return running;
  }

  function scheduleDebounced(): void {
    clearTimeout(debounceTimer);
    if (!isConnected() || snapshot.phase === "unauthorized" || !computePending()) return;
    debounceTimer = setTimeout(() => void syncNow(), debounceMs);
  }

  function onStoreChange(): void {
    update({ pending: computePending() });
    scheduleDebounced();
  }

  // --- lifecycle ---------------------------------------------------------------------------------------------------------

  let started = false;
  let cleanup: Array<() => void> = [];

  function start(): void {
    if (started) return;
    started = true;
    cleanup.push(store.subscribe(onStoreChange));

    if (typeof window !== "undefined") {
      const onFocus = () => {
        if (isVisible()) void syncNow();
      };
      const onOnline = () => {
        failures = 0;
        void syncNow();
      };
      const onOffline = () => {
        if (isConnected()) update({ phase: "offline", message: "You are offline. Changes are saved on this device and will sync when you are back online." });
      };
      const onStorage = (event: StorageEvent) => {
        if (event.key === null || event.key === META_KEY || event.key.endsWith("sync-token")) {
          metaCache = null;
          update({ connected: isConnected(), pending: computePending() });
        }
      };
      window.addEventListener("focus", onFocus);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      window.addEventListener("storage", onStorage);
      document.addEventListener("visibilitychange", onFocus);
      cleanup.push(() => {
        window.removeEventListener("focus", onFocus);
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
        window.removeEventListener("storage", onStorage);
        document.removeEventListener("visibilitychange", onFocus);
      });
    }

    const poll = setInterval(() => {
      if (isVisible() && isConnected() && snapshot.phase !== "unauthorized") void syncNow();
    }, pollMs);
    cleanup.push(() => clearInterval(poll));

    void (async () => {
      const available = await transport.health();
      update({ available });
      if (available && isConnected()) await syncNow();
      else if (!available && isConnected()) update({ phase: "error", message: "Cloud sync is not set up on this server." });
    })();
  }

  function stop(): void {
    started = false;
    clearTimeout(debounceTimer);
    clearTimeout(retryTimer);
    cleanup.forEach((fn) => fn());
    cleanup = [];
  }

  async function connect(token: string): Promise<ConnectResult> {
    const trimmed = token.trim();
    if (trimmed === "") return { ok: false, error: "Enter the sync token." };

    const available = await transport.health();
    update({ available });
    if (!available) return { ok: false, error: "Cloud sync is not set up on this server." };

    saveToken(storage, trimmed);
    saveMeta(storage, freshMeta(readMeta().deviceId)); // first-connect merge rules apply
    metaCache = null;
    failures = 0;
    // `connected` flips only after the first sync succeeds, so the connect form (and its error message) stays on screen.
    update({ phase: "idle", message: null, lastMerge: null });
    await syncNow();

    if (snapshot.phase === "idle") {
      update({ connected: true, pending: computePending() });
      return { ok: true, summary: snapshot.lastMerge };
    }
    const error = snapshot.phase === "unauthorized" ? "That token was rejected by the server." : (snapshot.message ?? "Could not sync.");
    disconnect();
    return { ok: false, error };
  }

  function disconnect(): void {
    clearTimeout(debounceTimer);
    clearTimeout(retryTimer);
    const deviceId = readMeta().deviceId;
    clearToken(storage);
    saveMeta(storage, freshMeta(deviceId));
    metaCache = null;
    failures = 0;
    update({
      connected: false,
      phase: "idle",
      message: null,
      lastSyncedAt: null,
      remoteUpdatedAt: null,
      remoteUpdatedBy: null,
      lastMerge: null,
      pending: false,
    });
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start,
    stop,
    connect,
    disconnect,
    syncNow,
  };
}
