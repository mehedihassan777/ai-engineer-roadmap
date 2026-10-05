import { TRACK_IDS, type TrackId } from "@/data/ids";
import type { ResolvedTask } from "./roadmap";
import type { TaskStatus } from "./state/types";

/** What a task's status looks like to the filters ("todo" = no stored status). */
export type TaskState = TaskStatus | "todo";

/** "open" = unfinished: to do or in progress. */
export type StatusFilter = "all" | "open" | TaskState;
/** "past" = weeks before the current one (the backlog that slipped); "upcoming" = current week onwards. */
export type ScopeFilter = "all" | "past" | "upcoming";

export interface TaskFilters {
  track: TrackId | "all";
  status: StatusFilter;
  scope: ScopeFilter;
}

export const DEFAULT_FILTERS: TaskFilters = { track: "all", status: "all", scope: "all" };

export const STATUS_OPTIONS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Unfinished" },
  { value: "todo", label: "To do" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export const SCOPE_OPTIONS: ReadonlyArray<{ value: ScopeFilter; label: string }> = [
  { value: "all", label: "All weeks" },
  { value: "past", label: "Earlier weeks (carry-over)" },
  { value: "upcoming", label: "This week and later" },
];

const STATUS_VALUES: readonly string[] = STATUS_OPTIONS.map((option) => option.value);
const SCOPE_VALUES: readonly string[] = SCOPE_OPTIONS.map((option) => option.value);

export function stateOf(statuses: Record<string, TaskStatus>, taskId: string): TaskState {
  return statuses[taskId] ?? "todo";
}

export function matchesStatus(state: TaskState, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "open") return state !== "done";
  return state === filter;
}

export function matchesFilters(task: ResolvedTask, state: TaskState, filters: TaskFilters, currentWeek: number): boolean {
  if (filters.track !== "all" && task.track !== filters.track) return false;
  if (!matchesStatus(state, filters.status)) return false;
  if (filters.scope === "past") return task.weekNumber < currentWeek;
  if (filters.scope === "upcoming") return task.weekNumber >= currentWeek;
  return true;
}

export interface FilterCounts {
  /** Tasks per track given the current status and scope filters ("all" = every track). */
  byTrack: Record<TrackId | "all", number>;
  /** Tasks per status given the current track and scope filters. */
  byStatus: Record<StatusFilter, number>;
}

/** How many tasks each chip would show, so people can see what a filter does before clicking it. */
export function countMatches(
  tasks: ResolvedTask[],
  statuses: Record<string, TaskStatus>,
  filters: TaskFilters,
  currentWeek: number,
): FilterCounts {
  const byTrack = Object.fromEntries([...TRACK_IDS, "all"].map((id) => [id, 0])) as Record<TrackId | "all", number>;
  const byStatus = Object.fromEntries(STATUS_OPTIONS.map((option) => [option.value, 0])) as Record<StatusFilter, number>;

  for (const task of tasks) {
    const state = stateOf(statuses, task.id);
    if (matchesFilters(task, state, { ...filters, track: "all" }, currentWeek)) {
      // Counted for the track chips (status + scope applied, any track).
      byTrack.all += 1;
      byTrack[task.track] += 1;
    }
    for (const option of STATUS_OPTIONS) {
      if (matchesFilters(task, state, { ...filters, status: option.value }, currentWeek)) byStatus[option.value] += 1;
    }
  }
  return { byTrack, byStatus };
}

/** Reads filters from a query string; unknown or missing values fall back to the defaults. */
export function parseFilters(params: { get(name: string): string | null }): TaskFilters {
  const track = params.get("track");
  const status = params.get("status");
  const scope = params.get("scope");
  return {
    track: track !== null && (TRACK_IDS as readonly string[]).includes(track) ? (track as TrackId) : "all",
    status: status !== null && STATUS_VALUES.includes(status) ? (status as StatusFilter) : "all",
    scope: scope !== null && SCOPE_VALUES.includes(scope) ? (scope as ScopeFilter) : "all",
  };
}

/** Query string for the filters, leaving out defaults. Empty string when everything is default. */
export function filtersToQuery(filters: TaskFilters): string {
  const params = new URLSearchParams();
  if (filters.track !== DEFAULT_FILTERS.track) params.set("track", filters.track);
  if (filters.status !== DEFAULT_FILTERS.status) params.set("status", filters.status);
  if (filters.scope !== DEFAULT_FILTERS.scope) params.set("scope", filters.scope);
  return params.toString();
}
