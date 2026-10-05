import { isValidDateString } from "../dates";
import type { DsaLogEntry, PersistedState, TaskStatus } from "./types";

/**
 * Pure state transitions. Each returns the *same* object when nothing changes, so the store can skip
 * notifying subscribers.
 */

export type StatusInput = TaskStatus | "todo";

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  if (!(key in record)) return record;
  const next = { ...record };
  delete next[key];
  return next;
}

export function setTaskStatus(state: PersistedState, id: string, status: StatusInput): PersistedState {
  const current = state.tasks[id];
  if (status === "todo") {
    return current === undefined ? state : { ...state, tasks: without(state.tasks, id) };
  }
  return current === status ? state : { ...state, tasks: { ...state.tasks, [id]: status } };
}

/** The checkbox: done becomes to do; anything else becomes done. */
export function toggleTaskDone(state: PersistedState, id: string): PersistedState {
  return setTaskStatus(state, id, state.tasks[id] === "done" ? "todo" : "done");
}

export function toggleChecked(state: PersistedState, section: "topics" | "dod", id: string): PersistedState {
  const current = state[section];
  return { ...state, [section]: id in current ? without(current, id) : { ...current, [id]: true } };
}

export function addDsaEntry(state: PersistedState, entry: DsaLogEntry): PersistedState {
  return { ...state, dsaLog: [...state.dsaLog, entry] };
}

export function updateDsaEntry(
  state: PersistedState,
  id: string,
  patch: Partial<Omit<DsaLogEntry, "id">>,
): PersistedState {
  if (!state.dsaLog.some((entry) => entry.id === id)) return state;
  return {
    ...state,
    dsaLog: state.dsaLog.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)),
  };
}

export function removeDsaEntry(state: PersistedState, id: string): PersistedState {
  if (!state.dsaLog.some((entry) => entry.id === id)) return state;
  return { ...state, dsaLog: state.dsaLog.filter((entry) => entry.id !== id) };
}

/** Empty (or whitespace-only) text removes the note. */
export function setWeekNote(state: PersistedState, week: number, text: string): PersistedState {
  const key = String(week);
  if (text.trim().length === 0) {
    return key in state.notes ? { ...state, notes: without(state.notes, key) } : state;
  }
  return state.notes[key] === text ? state : { ...state, notes: { ...state.notes, [key]: text } };
}

export function setStartDate(state: PersistedState, date: string): PersistedState {
  if (!isValidDateString(date) || date === state.startDate) return state;
  return { ...state, startDate: date };
}

export function markExported(state: PersistedState, isoTimestamp: string): PersistedState {
  return { ...state, lastExportedAt: isoTimestamp };
}
