import { TRACK_IDS, type TrackId } from "@/data/ids";
import type { Content, Phase, PhaseId, PlanConfig, Task, Track, Week } from "@/data/types";
import { allocateHours, trackWeeklyHours } from "./time-budget";

/** A task with its derived hour estimate and where it lives in the plan. */
export interface ResolvedTask extends Task {
  hours: number;
  weekNumber: number;
  phaseId: PhaseId;
}

export interface ResolvedWeek extends Omit<Week, "tasks"> {
  tasks: ResolvedTask[];
  hoursByTrack: Record<TrackId, number>;
  totalHours: number;
}

/** The content with derived values and lookup indexes. Built once from src/data; never mutated. */
export interface Roadmap {
  tracks: Track[];
  phases: Phase[];
  weeks: ResolvedWeek[];
  weeksByNumber: Map<number, ResolvedWeek>;
  tasksById: Map<string, ResolvedTask>;
  totalHours: number;
  hoursByTrack: Record<TrackId, number>;
  taskCountByTrack: Record<TrackId, number>;
}

const zeroByTrack = () => Object.fromEntries(TRACK_IDS.map((id) => [id, 0])) as Record<TrackId, number>;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

function resolveWeek(week: Week, plan: PlanConfig): ResolvedWeek {
  const hoursByTrack = zeroByTrack();
  const hoursByTask = new Map<Task, number>();

  for (const track of TRACK_IDS) {
    const tasks = week.tasks.filter((task) => task.track === track);
    const hours = allocateHours(
      tasks.map((task) => task.weight ?? 1),
      trackWeeklyHours(plan, track),
      plan.hourStep,
    );
    tasks.forEach((task, index) => hoursByTask.set(task, hours[index] ?? 0));
    hoursByTrack[track] = sum(hours);
  }

  return {
    ...week,
    tasks: week.tasks.map((task) => ({
      ...task,
      hours: hoursByTask.get(task) ?? 0,
      weekNumber: week.number,
      phaseId: week.phaseId,
    })),
    hoursByTrack,
    totalHours: sum(Object.values(hoursByTrack)),
  };
}

export function resolveRoadmap(content: Pick<Content, "tracks" | "phases" | "weeks">, plan: PlanConfig): Roadmap {
  const weeks = [...content.weeks].sort((a, b) => a.number - b.number).map((week) => resolveWeek(week, plan));

  const weeksByNumber = new Map<number, ResolvedWeek>();
  const tasksById = new Map<string, ResolvedTask>();
  const hoursByTrack = zeroByTrack();
  const taskCountByTrack = zeroByTrack();

  for (const week of weeks) {
    weeksByNumber.set(week.number, week);
    for (const task of week.tasks) {
      tasksById.set(task.id, task);
      taskCountByTrack[task.track] += 1;
      hoursByTrack[task.track] += task.hours;
    }
  }

  return {
    tracks: content.tracks,
    phases: content.phases,
    weeks,
    weeksByNumber,
    tasksById,
    totalHours: sum(Object.values(hoursByTrack)),
    hoursByTrack,
    taskCountByTrack,
  };
}

export interface TrackGroup {
  track: Track;
  tasks: ResolvedTask[];
  hours: number;
}

/** A week's tasks grouped by track, in the order the tracks are defined; empty groups are omitted. */
export function groupTasksByTrack(week: ResolvedWeek, tracks: Track[]): TrackGroup[] {
  return tracks
    .map((track) => {
      const tasks = week.tasks.filter((task) => task.track === track.id);
      return { track, tasks, hours: sum(tasks.map((task) => task.hours)) };
    })
    .filter((group) => group.tasks.length > 0);
}
