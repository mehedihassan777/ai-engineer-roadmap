"use client";

import { CircleDot, Clock } from "lucide-react";
import { actions } from "@/hooks/useAppState";
import { trackById } from "@/lib/content";
import { cn } from "@/lib/cn";
import { formatHours } from "@/lib/format";
import type { ResolvedTask } from "@/lib/roadmap";
import type { TaskState } from "@/lib/task-filters";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { ResourceLink } from "../ui/ResourceLink";
import { TRACK_STYLES } from "../ui/track-styles";

interface TaskItemProps {
  task: ResolvedTask;
  state: TaskState;
  /** Show the track label (when tasks are not already grouped by track). */
  showTrack?: boolean;
}

function StatusControl({ task, state }: { task: ResolvedTask; state: TaskState }) {
  if (state === "done") return <Badge tone="success">Done</Badge>;
  if (state === "in-progress") {
    return (
      <button
        type="button"
        onClick={() => actions.setTaskStatus(task.id, "todo")}
        title="In progress - click to move back to To do"
        className="inline-flex h-7 items-center gap-1 rounded-full bg-accent-soft px-2.5 text-xs font-medium text-accent hover:opacity-80"
      >
        <CircleDot className="size-3.5" aria-hidden="true" />
        In progress
        <span className="sr-only">: move &ldquo;{task.title}&rdquo; back to To do</span>
      </button>
    );
  }
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs" onClick={() => actions.setTaskStatus(task.id, "in-progress")}>
      Start
      <span className="sr-only"> &ldquo;{task.title}&rdquo; (mark as in progress)</span>
    </Button>
  );
}

export function TaskItem({ task, state, showTrack = false }: TaskItemProps) {
  const titleId = `task-title-${task.id}`;
  const done = state === "done";
  const track = trackById.get(task.track);

  return (
    <li className={cn("flex gap-3 px-4 py-3", done && "bg-surface-muted/50")}>
      <Checkbox checked={done} onChange={() => actions.toggleTaskDone(task.id)} aria-labelledby={titleId} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
          <p id={titleId} className={cn("font-medium", done && "text-muted line-through")}>
            {task.title}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {showTrack && track && (
              <Badge className={cn(TRACK_STYLES[track.color].soft, TRACK_STYLES[track.color].text)}>{track.shortName}</Badge>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatHours(task.hours)}
            </span>
            <StatusControl task={task} state={state} />
          </div>
        </div>
        {task.detail && <p className="mt-1 text-sm text-muted">{task.detail}</p>}
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-label="Resources">
          {task.resources.map((resource) => (
            <li key={resource.title}>
              <ResourceLink resource={resource} />
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
