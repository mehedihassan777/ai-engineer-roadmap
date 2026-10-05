"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { useAppState } from "@/hooks/useAppState";
import { useSchedule } from "@/hooks/useSchedule";
import { roadmap } from "@/lib/content";
import { formatHours, plural } from "@/lib/format";
import {
  DEFAULT_FILTERS,
  countMatches,
  filtersToQuery,
  matchesFilters,
  parseFilters,
  stateOf,
  type TaskFilters,
} from "@/lib/task-filters";
import { PageHeader } from "../layout/PageHeader";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Skeleton } from "../ui/Skeleton";
import { TaskFilterBar } from "../week/TaskFilterBar";
import { TaskItem } from "../week/TaskItem";

export function TasksSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <p className="sr-only" role="status">
        Loading tasks…
      </p>
      <Skeleton className="h-40" />
      <Skeleton className="h-64" />
    </div>
  );
}

/** Every task in the plan with the same filters as This week plus a week scope. Filters live in the URL. */
export function TasksView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const schedule = useSchedule();
  const { tasks: statuses } = useAppState();

  if (!schedule.ready || !schedule.info) return <TasksSkeleton />;

  const filters = parseFilters(searchParams);
  const currentWeek = schedule.info.week;
  const setFilters = (next: TaskFilters) => {
    const query = filtersToQuery(next);
    router.replace(query ? `/tasks?${query}` : "/tasks", { scroll: false });
  };

  const counts = countMatches(
    roadmap.weeks.flatMap((week) => week.tasks),
    statuses,
    filters,
    currentWeek,
  );
  const groups = roadmap.weeks
    .map((week) => ({
      week,
      tasks: week.tasks.filter((task) => matchesFilters(task, stateOf(statuses, task.id), filters, currentWeek)),
    }))
    .filter((group) => group.tasks.length > 0);
  const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
  const hours = groups.reduce((sum, group) => sum + group.tasks.reduce((inner, task) => inner + task.hours, 0), 0);

  return (
    <>
      <PageHeader
        title="All tasks"
        description="Every task in the plan. Filter by track and status, or look at what slipped from earlier weeks."
      />
      <div className="space-y-5">
        <TaskFilterBar filters={filters} onChange={setFilters} counts={counts} showScope />
        <p className="text-sm text-muted" role="status">
          {total} {plural(total, "task")} · {formatHours(hours)}
        </p>

        {groups.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-8" aria-hidden="true" />}
            title="No tasks match these filters"
            action={
              <Button variant="secondary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            }
          />
        ) : (
          groups.map(({ week, tasks }) => (
            <section key={week.number} aria-labelledby={`all-tasks-week-${week.number}`}>
              <h2 id={`all-tasks-week-${week.number}`} className="mb-2 text-base font-semibold">
                <Link href={`/week/${week.number}`} className="hover:text-accent hover:underline">
                  Week {week.number}: {week.title}
                </Link>
              </h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-line">
                  {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} state={stateOf(statuses, task.id)} showTrack />
                  ))}
                </ul>
              </Card>
            </section>
          ))
        )}
      </div>
    </>
  );
}
