"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useSyncSnapshot } from "@/hooks/useSync";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { SyncConnectForm } from "./SyncConnectForm";
import { SyncStatusPanel } from "./SyncStatusPanel";

/** Settings > Cloud sync: lets you tick tasks at home and at the office and see the same progress. */
export function SyncCard() {
  const hydrated = useHydrated();
  const snapshot = useSyncSnapshot();

  let body;
  if (!hydrated || (snapshot.available === null && !snapshot.connected)) {
    body = <Skeleton className="mt-4 h-24 w-full max-w-md" />;
  } else if (snapshot.connected) {
    body = <SyncStatusPanel snapshot={snapshot} />;
  } else if (snapshot.available) {
    body = <SyncConnectForm />;
  } else {
    body = (
      <p className="mt-4 text-sm text-muted">
        Cloud sync is not set up on this server, so progress stays in this browser. To turn it on, add <code className="font-mono">DATABASE_URL</code>{" "}
        (Neon) and <code className="font-mono">SYNC_TOKEN</code> to the server&apos;s environment, run <code className="font-mono">npm run db:migrate</code>,
        and reload. The README has the steps.
      </p>
    );
  }

  return (
    <Card className="p-5" id="sync">
      <h2 className="text-base font-semibold">Cloud sync</h2>
      <p className="mt-1 text-sm text-muted">
        Keeps your progress in a Neon database so the same tasks, topics, DSA log, notes and start date show up on every device that has your
        token, for example at home and at the office. Edits always save on this device first and upload when you are online. Theme and
        last-export time stay per device.
      </p>
      {body}
    </Card>
  );
}
