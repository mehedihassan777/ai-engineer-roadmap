"use client";

import { Trash } from "lucide-react";
import { useId, useState } from "react";
import { actions } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ConfirmDialog } from "../ui/ConfirmDialog";

const CONFIRM_WORD = "RESET";

export function DangerZoneCard() {
  const inputId = useId();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const close = () => {
    setOpen(false);
    setTyped("");
  };
  const confirm = () => {
    actions.resetAll();
    close();
  };

  return (
    <Card className="border-rose-300 p-5 dark:border-rose-500/40">
      <h2 className="text-base font-semibold text-rose-700 dark:text-rose-300">Reset all progress</h2>
      <p className="mt-1 text-sm text-muted">
        Clears completed tasks, topic and checklist progress, the DSA log and notes, and restarts week 1 today. A one-step undo is kept
        until your next import or reset.
      </p>
      <Button variant="danger" className="mt-4" onClick={() => setOpen(true)} disabled={!hydrated}>
        <Trash className="size-4" aria-hidden="true" />
        Reset everything…
      </Button>

      <ConfirmDialog
        open={open}
        title="Reset all progress?"
        confirmLabel="Reset everything"
        confirmVariant="danger"
        confirmDisabled={typed !== CONFIRM_WORD}
        onConfirm={confirm}
        onCancel={close}
      >
        <p>This removes all of your progress from this browser. Export a backup first if you might want it back.</p>
        <div>
          <label htmlFor={inputId} className="mb-1 block font-medium">
            Type {CONFIRM_WORD} to confirm
          </label>
          <input
            id={inputId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            className="h-10 w-full rounded-lg border border-line bg-background px-3"
          />
        </div>
      </ConfirmDialog>
    </Card>
  );
}
