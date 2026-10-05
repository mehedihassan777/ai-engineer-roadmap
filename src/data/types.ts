import type { DsaPatternId, PhaseId, ProjectId, StackSlug, TrackId } from "./ids";

export type { DsaPatternId, PhaseId, ProjectId, StackSlug, TrackId };

export type Level = "deep" | "review";
export type Difficulty = "easy" | "medium" | "hard";
export type ResourceKind = "docs" | "course" | "video" | "book" | "repo" | "article" | "tool";

/** A learning resource. A resource without `url` is shown as plain text with a "verify link" badge. */
export interface Resource {
  title: string;
  url?: string;
  kind?: ResourceKind;
}

export interface Task {
  /** Stable, globally unique. Progress is keyed by it - never rename it after you start ticking things off. */
  id: string;
  track: TrackId;
  title: string;
  detail?: string;
  /**
   * Relative effort inside its (week, track). Default 1. Hours are derived from `PLAN` in constants.ts, so
   * at the default budget weights that add up to the track's weekly hours map 1:1 to hours.
   */
  weight?: number;
  /** 1-2 resources (validated). Official docs first. */
  resources: Resource[];
  projectId?: ProjectId;
}

/** What the DSA track does in a week: a pattern (with the problems per session) or a mock-interview week. */
export type DsaPlan =
  | { kind: "pattern"; patternId: DsaPatternId; sessions: string[][] }
  | { kind: "mock"; coversPatternIds: DsaPatternId[] };

export interface Week {
  number: number;
  phaseId: PhaseId;
  title: string;
  summary: string;
  /** The project this week builds on. */
  projectId?: ProjectId;
  /** e.g. "Project 1 done" or "Claude Certified Architect - Foundations prep". */
  milestone?: string;
  dsa: DsaPlan;
  /** Includes the generated DSA session tasks (see `defineWeek`). */
  tasks: Task[];
}

export interface Phase {
  id: PhaseId;
  number: number;
  title: string;
  /** Inclusive week range. */
  weeks: [number, number];
  summary: string;
  outcomes: string[];
  projectIds: ProjectId[];
}

export type TrackColor = "violet" | "sky" | "amber" | "emerald" | "rose";

export interface Track {
  id: TrackId;
  name: string;
  /** Compact label for chips and legends, e.g. "DSA". */
  shortName: string;
  description: string;
  /** The UI maps this to Tailwind classes. */
  color: TrackColor;
}

export interface StackTopic {
  id: string;
  title: string;
  level: Level;
  note?: string;
  /** Weeks where this topic is practiced - shown as chips on the stack page. */
  weeks?: number[];
  resources: Resource[];
}

export interface StackSection {
  title: string;
  topics: StackTopic[];
}

export interface StackPage {
  slug: StackSlug;
  title: string;
  intro: string;
  sections: StackSection[];
}

export interface ProjectSystemDesign {
  requirements: { functional: string[]; nonFunctional: string[] };
  components: { name: string; responsibility: string }[];
  /** Ordered steps. */
  dataFlow: string[];
  failureModes: { failure: string; mitigation: string }[];
  tradeoffs: { decision: string; options: string; choice: string }[];
}

export interface ChecklistItem {
  id: string;
  text: string;
}

export interface Project {
  id: ProjectId;
  title: string;
  phaseId: PhaseId;
  /** Inclusive week range. */
  weeks: [number, number];
  tagline: string;
  goal: string;
  stack: { frontend: string; backend: string; data: string; infra?: string };
  features: string[];
  architectureNotes: string[];
  systemDesign: ProjectSystemDesign;
  stretchGoals: string[];
  /** Persisted checklist. */
  definitionOfDone: ChecklistItem[];
  resources: Resource[];
}

export interface DsaProblem {
  name: string;
  difficulty: Difficulty;
  /** Needs LeetCode Premium; NeetCode lists free alternatives (verify). */
  premium?: boolean;
}

export interface DsaPattern {
  id: DsaPatternId;
  name: string;
  summary: string;
  keyIdeas: string[];
  problems: DsaProblem[];
}

export interface SkillGuidance {
  id: string;
  skill: string;
  bucket: "master" | "delegate";
  /** Why it is risky (master) or safe (delegate) to leave to AI. */
  why: string;
  /** Concrete checklist for reviewing AI-written code or output. */
  howToVerify: string;
  /** Roadmap weeks that train this skill. */
  weeks?: number[];
}

/** The weekly time budget and plan shape. Lives in constants.ts - the one file to tweak. */
export interface PlanConfig {
  totalWeeks: number;
  weeklyHours: number;
  /** Share of the weekly hours per track; must sum to 1. */
  split: Record<TrackId, number>;
  dsa: { minSessionsPerWeek: number; mockWeekEvery: number };
  /** Rounding granularity for per-task estimates, in hours. */
  hourStep: number;
}

/** Everything the app and the validator need, assembled in src/data/index.ts. */
export interface Content {
  tracks: Track[];
  phases: Phase[];
  weeks: Week[];
  projects: Project[];
  stacks: StackPage[];
  dsaPatterns: DsaPattern[];
  skills: SkillGuidance[];
}
