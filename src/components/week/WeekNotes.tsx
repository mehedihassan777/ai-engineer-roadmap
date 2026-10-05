"use client";

import { useEffect, useId, useRef, useState } from "react";
import { actions, useAppState } from "@/hooks/useAppState";
import { useHydrated } from "@/hooks/useHydrated";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

const SAVE_DELAY_MS = 600;

function NotesEditor({ week }: { week: number }) {
  const id = useId();
  const stored = useAppState().notes[String(week)] ?? "";
  const [draft, setDraft] = useState(stored);
  const latest = useRef(stored);
  const dirty = draft.trim() !== stored.trim();

  // Autosave shortly after the last keystroke.
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => actions.setNote(week, draft), SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, week]);

  // Leaving the page within the delay must not lose the last edit.
  useEffect(
    () => () => {
      const current = actions.getSnapshot().state.notes[String(week)] ?? "";
      if (latest.current.trim() !== current.trim()) actions.setNote(week, latest.current);
    },
    [week],
  );

  return (
    <div>
      <label htmlFor={id} className="text-base font-semibold">
        Notes for week {week}
      </label>
      <textarea
        id={id}
        value={draft}
        onChange={(event) => {
          latest.current = event.target.value;
          setDraft(event.target.value);
        }}
        onBlur={() => actions.setNote(week, draft)}
        rows={8}
        placeholder="What you learned, what broke, links, questions for next week…"
        className="mt-2 w-full resize-y rounded-lg border border-line bg-background p-3 text-sm leading-relaxed"
      />
      <p className="mt-1.5 text-xs text-muted" role="status">
        {dirty ? "Saving…" : "Saved"} · stored only in this browser (include it in your backups with Settings → Export)
      </p>
    </div>
  );
}

/** Free-text notes for the week, autosaved locally. The editor mounts only after hydration so it starts from the saved text. */
export function WeekNotes({ week }: { week: number }) {
  const hydrated = useHydrated();
  return (
    <Card className="p-5">
      {hydrated ? <NotesEditor key={week} week={week} /> : <Skeleton className="h-52 w-full" />}
    </Card>
  );
}
