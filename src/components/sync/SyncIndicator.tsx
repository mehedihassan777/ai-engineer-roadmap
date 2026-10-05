"use client";

import Link from "next/link";
import { useHydrated } from "@/hooks/useHydrated";
import { useSyncSnapshot } from "@/hooks/useSync";
import { describeSync } from "@/lib/sync/describe";
import { SyncDot } from "./SyncDot";

/** Small sync status in the sidebar. Hidden entirely when this server has no cloud sync, so local-only use is unchanged. */
export function SyncIndicator() {
  const hydrated = useHydrated();
  const snapshot = useSyncSnapshot();
  if (!hydrated || (!snapshot.connected && !snapshot.available)) return null;

  const { label, tone } = describeSync(snapshot);
  return (
    <Link
      href="/settings#sync"
      className="flex items-center gap-2 rounded-lg px-1 py-1 text-xs text-muted hover:text-foreground"
      title={snapshot.message ?? "Cloud sync settings"}
    >
      <SyncDot tone={tone} />
      <span>
        Cloud: <span className="font-medium text-foreground">{label}</span>
      </span>
    </Link>
  );
}
