"use client";

import { Cloud } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { syncEngine } from "@/hooks/useSync";
import { Button } from "../ui/Button";

/** Paste the sync token (the same one on every device) to start syncing this device. */
export function SyncConnectForm() {
  const inputId = useId();
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await syncEngine.connect(token);
    setBusy(false);
    if (result.ok) setToken("");
    else setError(result.error);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
          Sync token
        </label>
        <input
          id={inputId}
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste the SYNC_TOKEN from your server settings"
          className="h-10 w-full max-w-md rounded-lg border border-line bg-background px-3 text-sm"
        />
      </div>
      <Button type="submit" variant="primary" disabled={busy || token.trim() === ""}>
        <Cloud className="size-4" aria-hidden="true" />
        {busy ? "Connecting…" : "Connect this device"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <p className="text-xs text-muted">
        The first time, progress already on this device is merged with the cloud (nothing is deleted, and you can undo it under Backup).
      </p>
    </form>
  );
}
