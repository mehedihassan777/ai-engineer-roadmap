import { TRACK_IDS, type TrackId } from "@/data/ids";
import type { ResolvedTask, ResolvedWeek, Roadmap } from "./roadmap";
import type { TaskStatus } from "./state/types";

export type StatusMap = Record<string, TaskStatus>;

export interface ProgressStat {
  doneHours: number;
  totalHours: number;
  doneTasks: number;
  inProgressTasks: number;
  totalTasks: number;
  /** Hours-weighted, 0-100 (not rounded). */
  percent: number;
}

export interface ProgressSummary {
  overall: ProgressStat;
  byTrack: Record<TrackId, ProgressStat>;
  byPhase: Record<string, ProgressStat>;
  byWeek: Record<number, ProgressStat>;
}

const emptyStat = (): ProgressStat => ({
  doneHours: 0,
  totalHours: 0,
  doneTasks: 0,
  inProgressTasks: 0,
  totalTasks: 0,
  percent: 0,
});

function add(stat: ProgressStat, task: ResolvedTask, status: TaskStatus | undefined): void {
  stat.totalHours += task.hours;
  stat.totalTasks += 1;
  if (status === "done") {
    stat.doneHours += task.hours;
    stat.doneTasks += 1;
  } else if (status === "in-progress") {
    stat.inProgressTasks += 1;
  }
}

function finish(stat: ProgressStat): ProgressStat {
  stat.percent = stat.totalHours > 0 ? (stat.doneHours / stat.totalHours) * 100 : 0;
  return stat;
}

/** Progress is hours-weighted: finishing a 2 h task moves the bar more than a 15 min one. */
export function computeProgress(roadmap: Roadmap, statuses: StatusMap): ProgressSummary {
  const overall = emptyStat();
  const byTrack = Object.fromEntries(TRACK_IDS.map((id) => [id, emptyStat()])) as Record<TrackId, ProgressStat>;
  const byPhase: Record<string, ProgressStat> = {};
  const byWeek: Record<number, ProgressStat> = {};

  for (const week of roadmap.weeks) {
    const weekStat = (byWeek[week.number] ??= emptyStat());
    const phaseStat = (byPhase[week.phaseId] ??= emptyStat());
    for (const task of week.tasks) {
      const status = statuses[task.id];
      add(overall, task, status);
      add(byTrack[task.track], task, status);
      add(phaseStat, task, status);
      add(weekStat, task, status);
    }
  }

  Object.values(byTrack).forEach(finish);
  Object.values(byPhase).forEach(finish);
  Object.values(byWeek).forEach(finish);
  return { overall: finish(overall), byTrack, byPhase, byWeek };
}

export function weekProgress(week: ResolvedWeek, statuses: StatusMap): ProgressStat {
  const stat = emptyStat();
  for (const task of week.tasks) add(stat, task, statuses[task.id]);
  return finish(stat);
}

/** Unfinished tasks from weeks before `currentWeek` - the backlog that slipped. */
export function carryOver(
  roadmap: Roadmap,
  statuses: StatusMap,
  currentWeek: number,
): { tasks: ResolvedTask[]; hours: number } {
  const tasks = roadmap.weeks
    .filter((week) => week.number < currentWeek)
    .flatMap((week) => week.tasks)
    .filter((task) => statuses[task.id] !== "done");
  return { tasks, hours: tasks.reduce((total, task) => total + task.hours, 0) };
}

/** Progress of a plain checklist (stack topics, definition-of-done items). */
export function checklistProgress(
  ids: string[],
  checked: Record<string, true>,
): { done: number; total: number; percent: number } {
  const done = ids.filter((id) => checked[id] === true).length;
  return { done, total: ids.length, percent: ids.length > 0 ? (done / ids.length) * 100 : 0 };
}
