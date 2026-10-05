"use client";

import { useEffect, useSyncExternalStore } from "react";
import { appSyncEngine } from "@/lib/sync/app-engine";
import type { SyncSnapshot } from "@/lib/sync/engine";

/** What the server (and the first client render) sees: sync unknown and not connected. */
const SERVER_SNAPSHOT: SyncSnapshot = {
  available: null,
  connected: false,
  phase: "idle",
  message: null,
  lastSyncedAt: null,
  remoteUpdatedAt: null,
  remoteUpdatedBy: null,
  lastMerge: null,
  pending: false,
};

/** Actions: connect(token), disconnect(), syncNow(). */
export const syncEngine = appSyncEngine;

export function useSyncSnapshot(): SyncSnapshot {
  return useSyncExternalStore(appSyncEngine.subscribe, appSyncEngine.getSnapshot, () => SERVER_SNAPSHOT);
}

/** Starts the sync engine once for the whole app (mounted in the app shell). */
export function useStartSync(): void {
  useEffect(() => {
    appSyncEngine.start();
    return () => appSyncEngine.stop();
  }, []);
}
