"use client";

import { RefreshCw } from "lucide-react";
import { syncEngine } from "@/hooks/useSync";
import { formatDateTime } from "@/lib/dates";
import { describeSync } from "@/lib/sync/describe";
import type { SyncSnapshot } from "@/lib/sync/engine";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { SyncDot } from "./SyncDot";

function mergeSentence(snapshot: SyncSnapshot): string | null {
  const merge = snapshot.lastMerge;
  if (!merge || merge.fromCloud + merge.fromThisDevice + merge.conflicts === 0) return null;
  const parts = [`${merge.fromCloud} item(s) received from the cloud`, `${merge.fromThisDevice} uploaded from this device`];
  if (merge.conflicts > 0) parts.push(`${merge.conflicts} conflict(s) resolved (this device won; notes keep both versions)`);
  return `Last merge: ${parts.join(", ")}.`;
}

/** Shown when this device is connected: status, last sync, and the two actions. */
export function SyncStatusPanel({ snapshot }: { snapshot: SyncSnapshot }) {
  const { label, tone } = describeSync(snapshot);
  const syncing = snapshot.phase === "syncing";
  const merge = mergeSentence(snapshot);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex items-center gap-2 text-sm font-medium" role="status">
          <SyncDot tone={tone} className="size-2.5" />
          {label}
        </p>
        {snapshot.pending && snapshot.phase !== "syncing" && <Badge tone="warning">changes waiting to upload</Badge>}
      </div>

      {snapshot.message && snapshot.phase !== "syncing" && (
        <p className="text-sm text-amber-800 dark:text-amber-300">{snapshot.message}</p>
      )}

      <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="text-muted">Last synced</dt>
        <dd>{snapshot.lastSyncedAt ? formatDateTime(snapshot.lastSyncedAt) : "not yet"}</dd>
        <dt className="text-muted">Cloud last updated</dt>
        <dd>
          {snapshot.remoteUpdatedAt ? formatDateTime(snapshot.remoteUpdatedAt) : "—"}
          {snapshot.remoteUpdatedBy && ` by ${snapshot.remoteUpdatedBy === "this-device" ? "this device" : "another device"}`}
        </dd>
      </dl>
      {merge && <p className="text-sm text-muted">{merge}</p>}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void syncEngine.syncNow()} disabled={syncing}>
          <RefreshCw className={syncing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
          Sync now
        </Button>
        <Button variant="ghost" onClick={() => syncEngine.disconnect()}>
          Disconnect this device
        </Button>
      </div>
    </div>
  );
}
