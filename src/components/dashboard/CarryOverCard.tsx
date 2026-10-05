"use client";

import { CircleCheck, Inbox } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { roadmap } from "@/lib/content";
import { formatHours, plural } from "@/lib/format";
import { carryOver } from "@/lib/progress";
import { LinkButton } from "../ui/Button";
import { Card } from "../ui/Card";

export function CarryOverCard({ currentWeek }: { currentWeek: number }) {
  const { tasks: statuses } = useAppState();
  const { tasks, hours } = carryOver(roadmap, statuses, currentWeek);

  if (tasks.length === 0) {
    return (
      <Card className="flex items-start gap-3 p-5">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-medium">You&apos;re caught up</h2>
          <p className="mt-1 text-sm text-muted">No unfinished tasks from earlier weeks.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <Inbox className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-medium">Carry-over from earlier weeks</h2>
          <p className="mt-1 text-sm text-muted">
            {tasks.length} unfinished {plural(tasks.length, "task")} · {formatHours(hours)} still planned
          </p>
        </div>
      </div>
      <LinkButton href="/tasks?status=open&scope=past" variant="secondary" size="sm" className="mt-4">
        Review them
      </LinkButton>
    </Card>
  );
}
