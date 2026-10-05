import type { SyncSnapshot } from "./engine";

export type SyncTone = "off" | "ok" | "busy" | "warn" | "error";

export interface SyncDescription {
  label: string;
  tone: SyncTone;
}

/** One short label and a tone for the sync state, used by the sidebar indicator and the Settings card. */
export function describeSync(snapshot: SyncSnapshot): SyncDescription {
  if (!snapshot.connected) {
    return snapshot.available ? { label: "Sync off", tone: "off" } : { label: "Local only", tone: "off" };
  }
  switch (snapshot.phase) {
    case "unauthorized":
      return { label: "Token rejected", tone: "error" };
    case "syncing":
      return { label: "Syncing…", tone: "busy" };
    case "offline":
      return { label: snapshot.pending ? "Offline, changes saved here" : "Offline", tone: "warn" };
    case "error":
      return { label: "Sync problem", tone: "error" };
    case "idle":
      return snapshot.pending ? { label: "Waiting to sync", tone: "warn" } : { label: "Synced", tone: "ok" };
  }
}
