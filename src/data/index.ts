import { PLAN } from "./constants";
import { DSA_PATTERNS } from "./dsa-patterns";
import { SKILLS } from "./learn-vs-delegate";
import { PHASES } from "./phases";
import { PROJECTS } from "./projects";
import { STACKS } from "./stacks";
import { TRACKS } from "./tracks";
import type { Content } from "./types";
import { WEEKS } from "./weeks";

export { PLAN };

/** Everything the app and the content validator need, assembled in one place. */
export const CONTENT: Content = {
  tracks: TRACKS,
  phases: PHASES,
  weeks: WEEKS,
  projects: PROJECTS,
  stacks: STACKS,
  dsaPatterns: DSA_PATTERNS,
  skills: SKILLS,
};
