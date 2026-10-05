import type { DsaLogEntry, PersistedState, TaskStatus } from "@/lib/state/types";

/**
 * Three-way merge of progress between this device (`local`), the cloud (`remote`) and the last state both agreed on (`base`).
 *
 * Per key (a task id, a topic id, a DSA log entry, a week note, the start date):
 * - only one side changed since `base` -> take that side;
 * - both changed the same key differently (a conflict) -> this device wins, because it is the one syncing right now;
 *   exceptions: notes are combined and a deleted-vs-edited entry keeps the edit, so written text and logged problems are never lost.
 * First connect (`base` is null, so nobody knows who changed what): union of everything; where both have a value the
 * more advanced task status wins, the cloud's start date and DSA entries win, and notes are combined.
 */

export interface MergeSummary {
  /** Keys whose value was taken from the cloud (and differed from this device). */
  fromCloud: number;
  /** Keys this device has that the cloud does not (will be uploaded). */
  fromThisDevice: number;
  /** Keys both sides had changed differently. */
  conflicts: number;
}

export interface MergeResult {
  merged: PersistedState;
  summary: MergeSummary;
}

export const NOTE_SEPARATOR = "\n\n--- also edited on another device ---\n";

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

type Resolver<V> = (local: V | undefined, remote: V | undefined) => V | undefined;

interface KeyMerge<V> {
  value: V | undefined;
  from: "same" | "cloud" | "device" | "conflict";
}

function mergeKey<V>(hasBase: boolean, base: V | undefined, local: V | undefined, remote: V | undefined, resolve: Resolver<V>): KeyMerge<V> {
  if (deepEqual(local, remote)) return { value: local, from: "same" };
  if (hasBase) {
    if (deepEqual(local, base)) return { value: remote, from: "cloud" }; // only the cloud changed it
    if (deepEqual(remote, base)) return { value: local, from: "device" }; // only this device changed it
    return { value: resolve(local, remote), from: "conflict" };
  }
  // No base: a value present on only one side is simply added; both present and different is a real disagreement.
  if (local === undefined) return { value: remote, from: "cloud" };
  if (remote === undefined) return { value: local, from: "device" };
  return { value: resolve(local, remote), from: "conflict" };
}

const rank = (status: TaskStatus | undefined): number => (status === "done" ? 2 : status === "in-progress" ? 1 : 0);

function combineNotes(local: string | undefined, remote: string | undefined): string | undefined {
  if (local === undefined || local.trim() === "") return remote;
  if (remote === undefined || remote.trim() === "") return local;
  if (local.includes(remote.trim())) return local;
  if (remote.includes(local.trim())) return remote;
  return `${local}${NOTE_SEPARATOR}${remote}`;
}

function mergeRecord<V>(
  base: Record<string, V> | undefined,
  local: Record<string, V>,
  remote: Record<string, V>,
  resolve: Resolver<V>,
  tally: MergeSummary,
): Record<string, V> {
  const hasBase = base !== undefined;
  const keys = new Set([...Object.keys(local), ...Object.keys(remote), ...Object.keys(base ?? {})]);
  const out: Record<string, V> = {};
  for (const key of keys) {
    const result = mergeKey(hasBase, base?.[key], local[key], remote[key], resolve);
    if (result.value !== undefined) out[key] = result.value;
    count(tally, result.from, local[key], remote[key]);
  }
  return out;
}

function count(tally: MergeSummary, from: KeyMerge<unknown>["from"], local: unknown, remote: unknown): void {
  if (from === "cloud" && !deepEqual(local, remote)) tally.fromCloud += 1;
  if (from === "device" && remote === undefined) tally.fromThisDevice += 1;
  if (from === "conflict") tally.conflicts += 1;
}

function mergeLog(
  base: DsaLogEntry[] | undefined,
  local: DsaLogEntry[],
  remote: DsaLogEntry[],
  firstConnect: boolean,
  tally: MergeSummary,
): DsaLogEntry[] {
  const index = (log: DsaLogEntry[]) => new Map(log.map((entry) => [entry.id, entry]));
  const baseById = base ? index(base) : undefined;
  const localById = index(local);
  const remoteById = index(remote);

  const resolve: Resolver<DsaLogEntry> = (l, r) => {
    if (l === undefined) return r; // deleted here but edited there: keep the edit
    if (r === undefined) return l;
    return firstConnect ? r : l;
  };

  const ids = [...new Set([...localById.keys(), ...remoteById.keys(), ...(baseById?.keys() ?? [])])];
  const merged = new Map<string, DsaLogEntry>();
  for (const id of ids) {
    const result = mergeKey(baseById !== undefined, baseById?.get(id), localById.get(id), remoteById.get(id), resolve);
    if (result.value !== undefined) merged.set(id, result.value);
    count(tally, result.from, localById.get(id), remoteById.get(id));
  }
  // Keep this device's order, then entries that only exist in the cloud.
  const ordered = local.filter((entry) => merged.has(entry.id)).map((entry) => merged.get(entry.id) as DsaLogEntry);
  const known = new Set(ordered.map((entry) => entry.id));
  for (const [id, entry] of merged) if (!known.has(id)) ordered.push(entry);
  return ordered;
}

export function mergeStates(base: PersistedState | null, local: PersistedState, remote: PersistedState): MergeResult {
  const firstConnect = base === null;
  const tally: MergeSummary = { fromCloud: 0, fromThisDevice: 0, conflicts: 0 };

  const taskResolver: Resolver<TaskStatus> = (l, r) => (firstConnect ? (rank(r) > rank(l) ? r : l) : l);
  const keepLocal: Resolver<true> = (l, r) => l ?? r;
  const noteResolver: Resolver<string> = combineNotes;

  const startDate = mergeKey<string>(!firstConnect, base?.startDate, local.startDate, remote.startDate, (l, r) => (firstConnect ? r : l));
  count(tally, startDate.from, local.startDate, remote.startDate);

  const merged: PersistedState = {
    schemaVersion: local.schemaVersion,
    startDate: startDate.value ?? local.startDate,
    tasks: mergeRecord(base?.tasks, local.tasks, remote.tasks, taskResolver, tally),
    topics: mergeRecord(base?.topics, local.topics, remote.topics, keepLocal, tally),
    dod: mergeRecord(base?.dod, local.dod, remote.dod, keepLocal, tally),
    dsaLog: mergeLog(base?.dsaLog, local.dsaLog, remote.dsaLog, firstConnect, tally),
    notes: mergeRecord(base?.notes, local.notes, remote.notes, noteResolver, tally),
  };
  if (local.lastExportedAt !== undefined) merged.lastExportedAt = local.lastExportedAt;
  return { merged, summary: tally };
}
