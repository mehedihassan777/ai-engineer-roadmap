"use client";

import { useMemo } from "react";
import { roadmap } from "@/lib/content";
import { computeProgress, type ProgressSummary } from "@/lib/progress";
import { useAppState } from "./useAppState";

/** Hours-weighted progress overall and per track, phase and week. Recomputed only when task statuses change. */
export function useProgress(): ProgressSummary {
  const { tasks } = useAppState();
  return useMemo(() => computeProgress(roadmap, tasks), [tasks]);
}
