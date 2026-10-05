"use client";

import { useState } from "react";
import { CalendarX2 } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { TRACKS, roadmap } from "@/lib/content";
import { formatHours, formatPercent } from "@/lib/format";
import { weekProgress } from "@/lib/progress";
import { groupTasksByTrack } from "@/lib/roadmap";
import { DEFAULT_FILTERS, countMatches, matchesFilters, stateOf, type TaskFilters } from "@/lib/task-filters";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ProgressBar } from "../ui/ProgressBar";
import { TaskFilterBar } from "./TaskFilterBar";
import { TrackGroup } from "./TrackGroup";
import { WeekHeader } from "./WeekHeader";
import { WeekNotes } from "./WeekNotes";

export function WeekView({ weekNumber }: { weekNumber: number }) {
  const week = roadmap.weeksByNumber.get(weekNumber);
  const { tasks: statuses } = useAppState();
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);

  if (!week) {
    return (
      <EmptyState
        icon={<CalendarX2 className="size-8" aria-hidden="true" />}
        title={`Week ${weekNumber} is not in the roadmap content yet`}
        description="Add it under src/data/weeks and register it in weeks/index.ts."
      />
    );
  }

  const stat = weekProgress(week, statuses);
  const counts = countMatches(week.tasks, statuses, filters, week.number);
  const groups = groupTasksByTrack(week, TRACKS).map((group) => ({
    ...group,
    visible: group.tasks.filter((task) => matchesFilters(task, stateOf(statuses, task.id), filters, week.number)),
  }));
  const visibleGroups = groups.filter((group) => group.visible.length > 0);

  return (
    <div className="space-y-6">
      <WeekHeader week={week} />

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <ProgressBar value={stat.percent} label={`Week ${week.number} progress`} className="flex-1" />
          <span className="text-sm font-semibold tabular-nums">{formatPercent(stat.percent)}</span>
        </div>
        <p className="mt-2 text-sm text-muted">
          {stat.doneTasks} of {stat.totalTasks} tasks done · {formatHours(stat.doneHours)} of {formatHours(stat.totalHours)}
          {stat.inProgressTasks > 0 && ` · ${stat.inProgressTasks} in progress`}
        </p>
      </Card>

      <TaskFilterBar filters={filters} onChange={setFilters} counts={counts} />

      {visibleGroups.length > 0 ? (
        <div className="space-y-5">
          {visibleGroups.map((group) => (
            <TrackGroup key={group.track.id} track={group.track} tasks={group.visible} allTasks={group.tasks} statuses={statuses} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No tasks match these filters"
          description="Try a different track or status."
          action={
            <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          }
        />
      )}

      <WeekNotes week={week.number} />
    </div>
  );
}
