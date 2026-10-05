"use client";

import { Save } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { diffInDays, toDateString } from "@/lib/dates";
import { plural } from "@/lib/format";
import { LinkButton } from "../ui/Button";
import { Card } from "../ui/Card";

const STALE_AFTER_DAYS = 7;

/** Nudges you to export a backup: localStorage can be cleared by the browser at any time. */
export function BackupReminder({ today }: { today: string }) {
  const { lastExportedAt, tasks, dsaLog, notes } = useAppState();
  const hasProgress = Object.keys(tasks).length > 0 || dsaLog.length > 0 || Object.keys(notes).length > 0;

  let message: string;
  if (lastExportedAt === undefined) {
    if (!hasProgress) return null;
    message = "You have not exported a backup yet. Your progress lives only in this browser.";
  } else {
    const days = diffInDays(today, toDateString(new Date(lastExportedAt)));
    if (days <= STALE_AFTER_DAYS) return null;
    message = `Your last backup was ${days} ${plural(days, "day")} ago.`;
  }

  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <Save className="size-5 shrink-0 text-muted" aria-hidden="true" />
      <p className="flex-1 text-sm">{message}</p>
      <LinkButton href="/settings" variant="primary" size="sm">
        Back up now
      </LinkButton>
    </Card>
  );
}
