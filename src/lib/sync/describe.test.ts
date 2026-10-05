import { describe, expect, it } from "vitest";
import { describeSync } from "./describe";
import type { SyncSnapshot } from "./engine";

const base: SyncSnapshot = {
  available: true,
  connected: true,
  phase: "idle",
  message: null,
  lastSyncedAt: null,
  remoteUpdatedAt: null,
  remoteUpdatedBy: null,
  lastMerge: null,
  pending: false,
};
const describeWith = (patch: Partial<SyncSnapshot>) => describeSync({ ...base, ...patch });

describe("describeSync", () => {
  it("reports sync as off or unavailable when not connected", () => {
    expect(describeWith({ connected: false })).toEqual({ label: "Sync off", tone: "off" });
    expect(describeWith({ connected: false, available: false })).toEqual({ label: "Local only", tone: "off" });
    expect(describeWith({ connected: false, available: null })).toEqual({ label: "Local only", tone: "off" });
  });

  it("reports a healthy connection", () => {
    expect(describeWith({})).toEqual({ label: "Synced", tone: "ok" });
    expect(describeWith({ pending: true })).toEqual({ label: "Waiting to sync", tone: "warn" });
    expect(describeWith({ phase: "syncing" })).toEqual({ label: "Syncing…", tone: "busy" });
  });

  it("reports problems with the right severity", () => {
    expect(describeWith({ phase: "offline" })).toEqual({ label: "Offline", tone: "warn" });
    expect(describeWith({ phase: "offline", pending: true }).label).toMatch(/saved here/);
    expect(describeWith({ phase: "error" })).toEqual({ label: "Sync problem", tone: "error" });
    expect(describeWith({ phase: "unauthorized" })).toEqual({ label: "Token rejected", tone: "error" });
  });
});
