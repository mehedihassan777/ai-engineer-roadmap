"use client";

import { Download, TriangleAlert, Undo2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { actions, useAppSnapshot } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { formatDate, toDateString } from "@/lib/dates";
import { buildExportFile, exportFileName, parseExportFile, serializeExport } from "@/lib/state/export-import";
import { StateError } from "@/lib/state/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { downloadTextFile } from "./download";
import { ImportDialog, type PendingImport } from "./ImportDialog";

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export function BackupCard() {
  const hydrated = useHydrated();
  const { state, hasBackup } = useAppSnapshot();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const lastExport = state.lastExportedAt ? formatDate(toDateString(new Date(state.lastExportedAt))) : null;

  function exportBackup() {
    const now = new Date();
    downloadTextFile(exportFileName(now), serializeExport(buildExportFile(state, now)));
    actions.markExported();
    setError(null);
    setMessage(`Backup downloaded as ${exportFileName(now)}. Keep it somewhere safe.`);
  }

  async function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets you pick the same file again later
    if (!file) return;
    setMessage(null);
    setError(null);
    if (file.size > MAX_IMPORT_BYTES) {
      setError("That file is larger than 5 MB, so it is not a roadmap backup.");
      return;
    }
    try {
      const { state: imported, warnings } = parseExportFile(await file.text(), state.startDate);
      setPending({ fileName: file.name, state: imported, warnings });
    } catch (caught) {
      setError(caught instanceof StateError ? caught.message : "That file could not be read.");
    }
  }

  function confirmImport() {
    if (!pending) return;
    actions.replaceState(pending.state);
    setMessage(`Imported ${pending.fileName}. Your previous data can be restored below.`);
    setPending(null);
  }

  function restorePrevious() {
    const restored = actions.undoReplace();
    setMessage(restored ? "Restored the data from before your last import or reset." : "There is nothing to restore.");
  }

  return (
    <Card className="p-5" id="backup">
      <h2 className="text-base font-semibold">Backup</h2>
      <p className="mt-1 text-sm text-muted">
        Progress, the DSA log and notes live only in this browser&apos;s storage. Export a JSON file regularly and import it to restore or
        move to another browser.
      </p>
      <p className="mt-2 text-sm">
        Last export: <span className="font-medium">{hydrated ? (lastExport ?? "never") : "…"}</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" onClick={exportBackup} disabled={!hydrated}>
          <Download className="size-4" aria-hidden="true" />
          Export JSON
        </Button>
        <Button variant="secondary" onClick={() => fileInput.current?.click()} disabled={!hydrated}>
          <Upload className="size-4" aria-hidden="true" />
          Import JSON…
        </Button>
        <input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" tabIndex={-1} aria-label="Choose a backup file to import" onChange={onFileChosen} />
        {hydrated && hasBackup && (
          <Button variant="ghost" onClick={restorePrevious}>
            <Undo2 className="size-4" aria-hidden="true" />
            Restore data from before the last import or reset
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </p>
      )}

      <ImportDialog pending={pending} current={state} onConfirm={confirmImport} onCancel={() => setPending(null)} />
    </Card>
  );
}
