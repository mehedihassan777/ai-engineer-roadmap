"use client";

import { useSyncExternalStore } from "react";
import { appStore } from "@/lib/state/app-store";
import type { AppSnapshot } from "@/lib/state/store";
import type { PersistedState } from "@/lib/state/types";

/** The store's actions (toggleTaskDone, addDsaEntry, ...). Call them from event handlers. */
export const actions = appStore;

/** Persisted state plus persistence status. On the server and during hydration this is an empty default state. */
export function useAppSnapshot(): AppSnapshot {
  return useSyncExternalStore(appStore.subscribe, appStore.getSnapshot, appStore.getServerSnapshot);
}

export function useAppState(): PersistedState {
  return useAppSnapshot().state;
}
