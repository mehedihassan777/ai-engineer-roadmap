"use client";

import { TriangleAlert, X } from "lucide-react";
import { useState } from "react";
import { useAppSnapshot } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";

const NOT_SAVING =
  "Your progress is not being saved: this browser is blocking local storage (private window?). Export a backup before you close the tab.";

/** Tells the user when progress cannot be saved or saved data had to be repaired. Dismissable per message. */
export function StatusBanner() {
  const hydrated = useHydrated();
  const { persistent, notice } = useAppSnapshot();
  const [dismissed, setDismissed] = useState<string | null>(null);

  const message = notice ?? (persistent ? null : NOT_SAVING);
  if (!hydrated || message === null || dismissed === message) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={() => setDismissed(message)}
        aria-label="Dismiss this message"
        className="rounded p-0.5 hover:bg-amber-100 dark:hover:bg-amber-500/20"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
