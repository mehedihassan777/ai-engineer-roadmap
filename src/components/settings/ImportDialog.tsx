"use client";

import { summarizeState } from "@/lib/state/export-import";
import type { PersistedState } from "@/lib/state/types";
import { formatDate } from "@/lib/dates";
import { useSyncSnapshot } from "@/hooks/useSync";
import { ConfirmDialog } from "../ui/ConfirmDialog";

export interface PendingImport {
  fileName: string;
  state: PersistedState;
  warnings: string[];
}

interface ImportDialogProps {
  pending: PendingImport | null;
  current: PersistedState;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Shows what an import would replace, side by side, before anything is overwritten. */
export function ImportDialog({ pending, current, onConfirm, onCancel }: ImportDialogProps) {
  const syncConnected = useSyncSnapshot().connected;
  const incoming = pending ? summarizeState(pending.state) : null;
  const existing = summarizeState(current);

  const rows: Array<[string, string | number, string | number | undefined]> = incoming
    ? [
        ["Start date", formatDate(existing.startDate), formatDate(incoming.startDate)],
        ["Tasks done", existing.tasksDone, incoming.tasksDone],
        ["Tasks in progress", existing.tasksInProgress, incoming.tasksInProgress],
        ["Stack topics checked", existing.topicsChecked, incoming.topicsChecked],
        ["Definition-of-done items", existing.dodChecked, incoming.dodChecked],
        ["DSA log entries", existing.dsaEntries, incoming.dsaEntries],
        ["Weeks with notes", existing.weeksWithNotes, incoming.weeksWithNotes],
      ]
    : [];

  return (
    <ConfirmDialog
      open={pending !== null}
      title="Replace your data with this backup?"
      confirmLabel="Replace my data"
      confirmVariant="danger"
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <p>
        <strong>{pending?.fileName}</strong> will replace everything currently saved in this browser. Your current data is kept as a
        one-step undo.
      </p>
      {syncConnected && (
        <p className="rounded-lg bg-sky-50 p-3 text-sky-900 dark:bg-sky-500/10 dark:text-sky-200">
          Cloud sync is on: the imported data will also replace your progress in the cloud and on your other devices.
        </p>
      )}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted uppercase">
            <th scope="col" className="py-1.5 font-semibold">
              &nbsp;
            </th>
            <th scope="col" className="py-1.5 font-semibold">
              Current
            </th>
            <th scope="col" className="py-1.5 font-semibold">
              Backup
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, now, next]) => (
            <tr key={label} className="border-b border-line/60">
              <th scope="row" className="py-1.5 font-normal text-muted">
                {label}
              </th>
              <td className="py-1.5 tabular-nums">{now}</td>
              <td className="py-1.5 font-medium tabular-nums">{next}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pending && pending.warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-medium">Some parts of the file were ignored:</p>
          <ul className="mt-1 list-disc pl-5">
            {pending.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </ConfirmDialog>
  );
}
