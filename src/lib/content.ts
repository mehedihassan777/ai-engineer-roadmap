import { PLAN } from "@/data/constants";
import { DSA_PATTERNS } from "@/data/dsa-patterns";
import { PHASES } from "@/data/phases";
import { TRACKS } from "@/data/tracks";
import { WEEKS } from "@/data/weeks";
import { resolveRoadmap } from "./roadmap";

export { DSA_PATTERNS, PHASES, PLAN, TRACKS };

/**
 * The resolved roadmap (derived hours + indexes), computed once at module load; treat as read-only.
 * Imports only what the plan itself needs, so client routes do not ship project or stack content they never show.
 */
export const roadmap = resolveRoadmap({ tracks: TRACKS, phases: PHASES, weeks: WEEKS }, PLAN);

export const phaseById = new Map(PHASES.map((phase) => [phase.id, phase]));
export const trackById = new Map(TRACKS.map((track) => [track.id, track]));
export const patternById = new Map(DSA_PATTERNS.map((pattern) => [pattern.id, pattern]));
