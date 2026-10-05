"use client";

import { cn } from "@/lib/cn";
import { formatHours } from "@/lib/format";
import type { ResolvedTask } from "@/lib/roadmap";
import { stateOf } from "@/lib/task-filters";
import type { TaskStatus } from "@/lib/state/types";
import type { Track } from "@/data/types";
import { Card } from "../ui/Card";
import { TRACK_STYLES } from "../ui/track-styles";
import { TaskItem } from "./TaskItem";

interface TrackGroupProps {
  track: Track;
  /** The tasks to show (after filtering). */
  tasks: ResolvedTask[];
  /** All of the track's tasks that week, for the done/total summary. */
  allTasks: ResolvedTask[];
  statuses: Record<string, TaskStatus>;
}

/** One track's tasks for the week: coloured header with progress, then the checklist. */
export function TrackGroup({ track, tasks, allTasks, statuses }: TrackGroupProps) {
  const style = TRACK_STYLES[track.color];
  const done = allTasks.filter((task) => statuses[task.id] === "done").length;
  const hours = allTasks.reduce((total, task) => total + task.hours, 0);
  const headingId = `track-${track.id}`;

  return (
    <section aria-labelledby={headingId}>
      <Card className="overflow-hidden">
        <div className={cn("flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3", style.soft, style.border)}>
          <h2 id={headingId} className={cn("flex items-center gap-2 text-base font-semibold", style.text)}>
            <span className={cn("size-2.5 rounded-full", style.dot)} aria-hidden="true" />
            {track.name}
          </h2>
          <p className="text-sm text-muted tabular-nums">
            {done}/{allTasks.length} done · {formatHours(hours)}
          </p>
        </div>
        <ul className="divide-y divide-line">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} state={stateOf(statuses, task.id)} />
          ))}
        </ul>
      </Card>
    </section>
  );
}
