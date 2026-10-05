import { todayString } from "../dates";
import { createDefaultState } from "./defaults";
import {
  BACKUP_KEY,
  CORRUPT_KEY,
  STORAGE_KEY,
  loadState,
  readBackup,
  type KeyValueStorage,
} from "./storage";
import * as transitions from "./transitions";
import type { DsaLogEntry, PersistedState } from "./types";

/**
 * Framework-agnostic store: holds the persisted state, writes it to storage on every change and
 * notifies subscribers. src/hooks adapts it to React with useSyncExternalStore.
 */

export interface AppSnapshot {
  state: PersistedState;
  /** False when browser storage is unavailable or a write failed: progress will be lost on reload. */
  persistent: boolean;
  /** An import or reset can be undone. */
  hasBackup: boolean;
  /** One-line banner text (recovered or ignored data, save failure), or null. */
  notice: string | null;
}

export interface StoreOptions {
  storage: KeyValueStorage | null;
  today?: () => string;
  now?: () => Date;
  newId?: () => string;
}

export interface Store {
  getSnapshot(): AppSnapshot;
  /** What the server (and the first client render) sees: an empty default state. */
  getServerSnapshot(): AppSnapshot;
  subscribe(listener: () => void): () => void;
  /** Re-read storage after another tab changed it. */
  reloadFromStorage(): void;

  setTaskStatus(id: string, status: transitions.StatusInput): void;
  toggleTaskDone(id: string): void;
  toggleTopic(id: string): void;
  toggleDod(key: string): void;
  addDsaEntry(entry: Omit<DsaLogEntry, "id">): string;
  updateDsaEntry(id: string, patch: Partial<Omit<DsaLogEntry, "id">>): void;
  removeDsaEntry(id: string): void;
  setNote(week: number, text: string): void;
  setStartDate(date: string): void;
  markExported(): void;
  /** Replaces everything (an import). The previous state is kept as a one-step undo. */
  replaceState(next: PersistedState): void;
  /** Applies state merged from the cloud. With `backup`, the previous state is first kept as the one-step undo. */
  applyRemote(next: PersistedState, options?: { backup?: boolean }): void;
  /** Restores the state saved before the last import or reset. Returns false when there is nothing to restore. */
  undoReplace(): boolean;
  /** Back to a fresh state (week 1 starts today). The previous state is kept as a one-step undo. */
  resetAll(): void;
}

const SAVE_FAILED_NOTICE =
  "Could not save your progress (browser storage is full or blocked). Export a backup now so nothing is lost.";

const SERVER_SNAPSHOT: AppSnapshot = {
  state: createDefaultState("1970-01-01"),
  persistent: false,
  hasBackup: false,
  notice: null,
};

function defaultId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStore(options: StoreOptions): Store {
  const { storage } = options;
  const today = options.today ?? (() => todayString());
  const now = options.now ?? (() => new Date());
  const newId = options.newId ?? defaultId;
  const listeners = new Set<() => void>();

  let state = createDefaultState(today());
  let persistent = storage !== null;
  let notice: string | null = null;

  const initial = storage ? loadState(storage, today()) : null;
  if (initial?.status === "ok") {
    state = initial.state;
    if (initial.warnings.length > 0) notice = initial.warnings.join(" ");
  } else if (initial?.status === "corrupt" && storage) {
    // Keep the unreadable data so it can be recovered by hand instead of silently overwriting it.
    try {
      storage.setItem(CORRUPT_KEY, initial.raw);
    } catch {
      // Nothing more we can do; the notice below still tells the user.
    }
    notice = `Your saved progress could not be read (${initial.reason}), so the app started fresh. The unreadable data was kept under the browser storage key "${CORRUPT_KEY}".`;
  }

  const hasBackup = () => {
    try {
      return storage?.getItem(BACKUP_KEY) != null;
    } catch {
      return false;
    }
  };

  const buildSnapshot = (): AppSnapshot => ({ state, persistent, hasBackup: hasBackup(), notice });

  function persist(): void {
    if (!storage) return;
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistent = true;
      if (notice === SAVE_FAILED_NOTICE) notice = null;
    } catch {
      persistent = false;
      notice = SAVE_FAILED_NOTICE;
    }
  }

  // The default start date is "the day you first opened the app" - persist it now so it sticks.
  if (initial?.status !== "ok") persist();

  let snapshot = buildSnapshot();

  function publish(): void {
    snapshot = buildSnapshot();
    listeners.forEach((listener) => listener());
  }

  function commit(next: PersistedState): void {
    if (next === state) return;
    state = next;
    persist();
    publish();
  }

  function saveBackup(): void {
    if (!storage) return;
    try {
      storage.setItem(BACKUP_KEY, JSON.stringify(state));
    } catch {
      // Without room for a backup the replace still goes ahead; the user was warned by the confirm dialog.
    }
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    reloadFromStorage() {
      if (!storage) return;
      const loaded = loadState(storage, today());
      if (loaded.status !== "ok") return;
      state = loaded.state;
      publish();
    },

    setTaskStatus: (id, status) => commit(transitions.setTaskStatus(state, id, status)),
    toggleTaskDone: (id) => commit(transitions.toggleTaskDone(state, id)),
    toggleTopic: (id) => commit(transitions.toggleChecked(state, "topics", id)),
    toggleDod: (key) => commit(transitions.toggleChecked(state, "dod", key)),
    addDsaEntry(entry) {
      const id = newId();
      commit(transitions.addDsaEntry(state, { ...entry, id }));
      return id;
    },
    updateDsaEntry: (id, patch) => commit(transitions.updateDsaEntry(state, id, patch)),
    removeDsaEntry: (id) => commit(transitions.removeDsaEntry(state, id)),
    setNote: (week, text) => commit(transitions.setWeekNote(state, week, text)),
    setStartDate: (date) => commit(transitions.setStartDate(state, date)),
    markExported: () => commit(transitions.markExported(state, now().toISOString())),

    replaceState(next) {
      saveBackup();
      commit({ ...next });
    },
    applyRemote(next, options) {
      if (options?.backup) saveBackup();
      commit({ ...next });
    },
    undoReplace() {
      if (!storage) return false;
      const backup = readBackup(storage, today());
      if (!backup) return false;
      try {
        storage.removeItem(BACKUP_KEY);
      } catch {
        // Ignore: restoring still works.
      }
      commit({ ...backup.state });
      return true;
    },
    resetAll() {
      saveBackup();
      commit(createDefaultState(today()));
    },
  };
}
