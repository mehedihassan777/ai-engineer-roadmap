import {
  DSA_PATTERN_IDS,
  PHASE_IDS,
  PROJECT_IDS,
  STACK_SLUGS,
  TRACK_IDS,
  type DsaPatternId,
} from "@/data/ids";
import type { Content, PlanConfig, Resource, Task, Week } from "@/data/types";
import { resolveRoadmap } from "./roadmap";
import { trackWeeklyHours } from "./time-budget";

export interface ValidateOptions {
  /**
   * While content is still being written: do not require every week, project, stack page or skill card
   * to exist yet. Everything that does exist is still fully validated.
   */
  allowPartialPlan?: boolean;
}

const TASK_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EPSILON = 1e-6;

const isNonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

function findDuplicates<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const duplicates = new Set<T>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

/**
 * Checks the roadmap content for mistakes that TypeScript cannot catch: duplicate ids, weeks that do not add
 * up to the time budget, broken references, bad URLs. Returns human-readable problems; empty means valid.
 */
export function validateContent(content: Content, plan: PlanConfig, options: ValidateOptions = {}): string[] {
  const issues: string[] = [];
  const partial = options.allowPartialPlan === true;
  const report = (message: string) => issues.push(message);

  checkPlan(plan, report);
  checkTracks(content, report);
  checkPhases(content, plan, report);
  checkWeeks(content, plan, partial, report);
  checkTasks(content, plan, report);
  checkDsa(content, plan, partial, report);
  checkProjects(content, plan, partial, report);
  checkStacks(content, plan, partial, report);
  checkSkills(content, plan, partial, report);
  return issues;
}

type Report = (message: string) => void;

function checkPlan(plan: PlanConfig, report: Report): void {
  if (!Number.isInteger(plan.totalWeeks) || plan.totalWeeks < 1) report("PLAN.totalWeeks must be a positive integer.");
  if (!(plan.weeklyHours > 0)) report("PLAN.weeklyHours must be greater than 0.");
  if (!(plan.hourStep > 0)) report("PLAN.hourStep must be greater than 0.");
  if (plan.dsa.minSessionsPerWeek < 1) report("PLAN.dsa.minSessionsPerWeek must be at least 1.");
  if (plan.dsa.mockWeekEvery < 1) report("PLAN.dsa.mockWeekEvery must be at least 1.");

  let shareSum = 0;
  for (const track of TRACK_IDS) {
    const share = plan.split[track];
    if (typeof share !== "number" || share < 0) report(`PLAN.split.${track} must be a number >= 0.`);
    else shareSum += share;
  }
  if (Math.abs(shareSum - 1) > EPSILON) report(`PLAN.split must add up to 1 (it adds up to ${shareSum}).`);

  const budget = TRACK_IDS.reduce((total, track) => total + trackWeeklyHours(plan, track), 0);
  if (Math.abs(budget - plan.weeklyHours) > EPSILON) {
    report(
      `Track budgets add up to ${budget} h, not PLAN.weeklyHours (${plan.weeklyHours} h). Adjust PLAN.split or PLAN.hourStep so each track's share is a multiple of the hour step.`,
    );
  }
}

function checkTracks(content: Content, report: Report): void {
  const ids = content.tracks.map((track) => track.id);
  for (const id of TRACK_IDS) if (!ids.includes(id)) report(`Track "${id}" is missing from tracks.ts.`);
  for (const id of findDuplicates(ids)) report(`Track id "${id}" is defined more than once.`);
  for (const track of content.tracks) {
    if (!(TRACK_IDS as readonly string[]).includes(track.id)) report(`Unknown track id "${track.id}".`);
    if (!isNonEmpty(track.name)) report(`Track "${track.id}" has no name.`);
  }
}

function checkPhases(content: Content, plan: PlanConfig, report: Report): void {
  const ids = content.phases.map((phase) => phase.id);
  for (const id of PHASE_IDS) if (!ids.includes(id)) report(`Phase "${id}" is missing from phases.ts.`);
  for (const id of findDuplicates(ids)) report(`Phase id "${id}" is defined more than once.`);

  const ordered = [...content.phases].sort((a, b) => a.weeks[0] - b.weeks[0]);
  let expectedStart = 1;
  for (const phase of ordered) {
    const [start, end] = phase.weeks;
    if (start > end) report(`Phase "${phase.id}" has an inverted week range ${start}-${end}.`);
    if (start !== expectedStart) report(`Phase "${phase.id}" starts at week ${start}; expected week ${expectedStart} (phases must be contiguous).`);
    expectedStart = end + 1;
    if (!isNonEmpty(phase.title) || !isNonEmpty(phase.summary)) report(`Phase "${phase.id}" needs a title and a summary.`);
    if (phase.outcomes.length === 0) report(`Phase "${phase.id}" has no outcomes.`);
    for (const projectId of phase.projectIds) {
      if (!(PROJECT_IDS as readonly string[]).includes(projectId)) report(`Phase "${phase.id}" references unknown project "${projectId}".`);
    }
  }
  if (expectedStart - 1 !== plan.totalWeeks) {
    report(`Phases end at week ${expectedStart - 1}, but PLAN.totalWeeks is ${plan.totalWeeks}.`);
  }
}

function checkWeeks(content: Content, plan: PlanConfig, partial: boolean, report: Report): void {
  const numbers = content.weeks.map((week) => week.number);
  for (const number of findDuplicates(numbers)) report(`Week ${number} is defined more than once.`);
  if (!partial) {
    for (let number = 1; number <= plan.totalWeeks; number += 1) {
      if (!numbers.includes(number)) report(`Week ${number} is missing from weeks/index.ts.`);
    }
  }

  for (const week of content.weeks) {
    const label = `Week ${week.number}`;
    if (!Number.isInteger(week.number) || week.number < 1 || week.number > plan.totalWeeks) {
      report(`${label}: week number must be between 1 and ${plan.totalWeeks}.`);
    }
    const phase = content.phases.find((candidate) => candidate.id === week.phaseId);
    if (!phase) report(`${label}: unknown phase "${week.phaseId}".`);
    else if (week.number < phase.weeks[0] || week.number > phase.weeks[1]) {
      report(`${label}: belongs to phase "${phase.id}" (weeks ${phase.weeks[0]}-${phase.weeks[1]}) but is outside its range.`);
    }
    if (!isNonEmpty(week.title) || !isNonEmpty(week.summary)) report(`${label}: needs a title and a summary.`);
    if (week.projectId && !(PROJECT_IDS as readonly string[]).includes(week.projectId)) {
      report(`${label}: unknown project "${week.projectId}".`);
    }
  }
}

function checkResources(resources: Resource[], owner: string, report: Report, min = 1, max = 2): void {
  if (resources.length < min || resources.length > max) {
    report(`${owner}: needs ${min === max ? min : `${min}-${max}`} resource(s), has ${resources.length}.`);
  }
  for (const resource of resources) {
    if (!isNonEmpty(resource.title)) report(`${owner}: a resource has no title.`);
    if (resource.url !== undefined) {
      try {
        const url = new URL(resource.url);
        if (url.protocol !== "https:") report(`${owner}: resource URL must use https (${resource.url}).`);
      } catch {
        report(`${owner}: resource URL is not a valid URL (${resource.url}).`);
      }
    }
  }
}

function checkTask(task: Task, week: Week, report: Report): void {
  const label = `Week ${week.number}, task "${task.id}"`;
  if (!TASK_ID.test(task.id)) report(`${label}: ids must be lowercase letters, digits and hyphens.`);
  if (!(TRACK_IDS as readonly string[]).includes(task.track)) report(`${label}: unknown track "${task.track}".`);
  if (!isNonEmpty(task.title)) report(`${label}: has no title.`);
  if (task.detail !== undefined && !isNonEmpty(task.detail)) report(`${label}: detail is empty (omit it instead).`);
  if (task.weight !== undefined && !(Number.isFinite(task.weight) && task.weight > 0)) {
    report(`${label}: weight must be a number greater than 0.`);
  }
  if (task.projectId && !(PROJECT_IDS as readonly string[]).includes(task.projectId)) {
    report(`${label}: unknown project "${task.projectId}".`);
  }
  checkResources(task.resources, label, report);
}

function checkTasks(content: Content, plan: PlanConfig, report: Report): void {
  const allTasks = content.weeks.flatMap((week) => week.tasks);
  for (const id of findDuplicates(allTasks.map((task) => task.id))) {
    report(`Task id "${id}" is used more than once - ids must be globally unique because progress is keyed by them.`);
  }

  const roadmap = resolveRoadmap(content, plan);
  for (const week of content.weeks) {
    for (const task of week.tasks) checkTask(task, week, report);

    const resolved = roadmap.weeksByNumber.get(week.number);
    for (const track of TRACK_IDS) {
      const tasks = week.tasks.filter((task) => task.track === track);
      if (tasks.length === 0) {
        report(`Week ${week.number}: no tasks for track "${track}".`);
        continue;
      }
      const budget = trackWeeklyHours(plan, track);
      const allocated = resolved?.hoursByTrack[track] ?? 0;
      if (Math.abs(allocated - budget) > EPSILON) {
        report(`Week ${week.number}: track "${track}" allocates ${allocated} h but its budget is ${budget} h.`);
      }
    }
    for (const task of resolved?.tasks ?? []) {
      if (task.hours < plan.hourStep - EPSILON) {
        report(`Week ${week.number}, task "${task.id}": gets ${task.hours} h, below the ${plan.hourStep} h step - raise its weight or merge tasks.`);
      }
    }
    const dsaTasks = week.tasks.filter((task) => task.track === "dsa").length;
    if (dsaTasks < plan.dsa.minSessionsPerWeek) {
      report(`Week ${week.number}: has ${dsaTasks} DSA session(s); at least ${plan.dsa.minSessionsPerWeek} are required.`);
    }
  }
}

function checkDsa(content: Content, plan: PlanConfig, partial: boolean, report: Report): void {
  const patterns = new Map(content.dsaPatterns.map((pattern) => [pattern.id, pattern]));
  for (const id of findDuplicates(content.dsaPatterns.map((pattern) => pattern.id))) report(`DSA pattern "${id}" is defined twice.`);
  for (const id of DSA_PATTERN_IDS) if (!patterns.has(id)) report(`DSA pattern "${id}" is missing from dsa-patterns.ts.`);

  for (const pattern of content.dsaPatterns) {
    const label = `DSA pattern "${pattern.id}"`;
    if (!isNonEmpty(pattern.name) || !isNonEmpty(pattern.summary)) report(`${label}: needs a name and a summary.`);
    if (pattern.keyIdeas.length === 0) report(`${label}: has no key ideas.`);
    if (pattern.problems.length === 0) report(`${label}: has no problems.`);
    for (const name of findDuplicates(pattern.problems.map((problem) => problem.name))) {
      report(`${label}: problem "${name}" is listed twice.`);
    }
  }

  const weekOfPattern = new Map<DsaPatternId, number>();
  const scheduledProblems = new Map<string, number>();
  for (const week of [...content.weeks].sort((a, b) => a.number - b.number)) {
    const label = `Week ${week.number}`;
    const isMockSlot = week.number % plan.dsa.mockWeekEvery === 0;

    if (week.dsa.kind === "mock") {
      if (!isMockSlot) report(`${label}: is a mock week but only every ${plan.dsa.mockWeekEvery}th week should be.`);
      if (week.dsa.coversPatternIds.length === 0) report(`${label}: mock week covers no patterns.`);
      for (const id of week.dsa.coversPatternIds) {
        if (!patterns.has(id)) report(`${label}: mock week covers unknown pattern "${id}".`);
        else if (!weekOfPattern.has(id) && !partial) report(`${label}: mock week covers "${id}", which has not been taught in an earlier week.`);
      }
      continue;
    }

    if (isMockSlot) report(`${label}: should be a DSA mock-interview week (every ${plan.dsa.mockWeekEvery}th week).`);
    const pattern = patterns.get(week.dsa.patternId);
    if (!pattern) {
      report(`${label}: unknown DSA pattern "${week.dsa.patternId}".`);
      continue;
    }
    weekOfPattern.set(week.dsa.patternId, week.number);
    if (week.dsa.sessions.length < plan.dsa.minSessionsPerWeek) {
      report(`${label}: lists ${week.dsa.sessions.length} DSA session(s); at least ${plan.dsa.minSessionsPerWeek} are required.`);
    }
    const known = new Set(pattern.problems.map((problem) => problem.name));
    week.dsa.sessions.forEach((session, index) => {
      if (session.length === 0) report(`${label}: DSA session ${index + 1} has no problems.`);
      for (const name of session) {
        if (!known.has(name)) report(`${label}: "${name}" is not a problem of pattern "${pattern.id}" (check spelling against dsa-patterns.ts).`);
        const key = `${pattern.id}:${name}`;
        const earlier = scheduledProblems.get(key);
        if (earlier !== undefined) report(`${label}: "${name}" is already scheduled in week ${earlier}.`);
        else scheduledProblems.set(key, week.number);
      }
    });
  }
}

function checkProjects(content: Content, plan: PlanConfig, partial: boolean, report: Report): void {
  const ids = content.projects.map((project) => project.id);
  for (const id of findDuplicates(ids)) report(`Project "${id}" is defined more than once.`);
  if (!partial) for (const id of PROJECT_IDS) if (!ids.includes(id)) report(`Project "${id}" is missing from projects/index.ts.`);

  for (const project of content.projects) {
    const label = `Project "${project.id}"`;
    if (!(PROJECT_IDS as readonly string[]).includes(project.id)) report(`${label}: unknown project id.`);
    const phase = content.phases.find((candidate) => candidate.id === project.phaseId);
    if (!phase) report(`${label}: unknown phase "${project.phaseId}".`);
    else if (!phase.projectIds.includes(project.id)) report(`${label}: phase "${phase.id}" does not list it in projectIds.`);

    const [start, end] = project.weeks;
    if (start < 1 || end > plan.totalWeeks || start > end) report(`${label}: week range ${start}-${end} is invalid.`);
    for (const week of content.weeks) {
      if (week.projectId === project.id && (week.number < start || week.number > end)) {
        report(`${label}: week ${week.number} points to it but is outside its range ${start}-${end}.`);
      }
    }

    for (const field of ["tagline", "goal"] as const) if (!isNonEmpty(project[field])) report(`${label}: ${field} is empty.`);
    const lists: Array<[string, unknown[]]> = [
      ["features", project.features],
      ["architectureNotes", project.architectureNotes],
      ["systemDesign.requirements.functional", project.systemDesign.requirements.functional],
      ["systemDesign.requirements.nonFunctional", project.systemDesign.requirements.nonFunctional],
      ["systemDesign.components", project.systemDesign.components],
      ["systemDesign.dataFlow", project.systemDesign.dataFlow],
      ["systemDesign.failureModes", project.systemDesign.failureModes],
      ["systemDesign.tradeoffs", project.systemDesign.tradeoffs],
      ["stretchGoals", project.stretchGoals],
      ["definitionOfDone", project.definitionOfDone],
    ];
    for (const [name, list] of lists) if (list.length === 0) report(`${label}: ${name} is empty.`);
    for (const id of findDuplicates(project.definitionOfDone.map((item) => item.id))) {
      report(`${label}: definition-of-done id "${id}" is used twice.`);
    }
    checkResources(project.resources, label, report, 1, 6);
  }
}

function checkStacks(content: Content, plan: PlanConfig, partial: boolean, report: Report): void {
  const slugs = content.stacks.map((stack) => stack.slug);
  for (const slug of findDuplicates(slugs)) report(`Stack page "${slug}" is defined more than once.`);
  if (!partial) for (const slug of STACK_SLUGS) if (!slugs.includes(slug)) report(`Stack page "${slug}" is missing from stacks/index.ts.`);

  const topics = content.stacks.flatMap((stack) => stack.sections.flatMap((section) => section.topics));
  for (const id of findDuplicates(topics.map((topic) => topic.id))) report(`Stack topic id "${id}" is used more than once.`);

  for (const stack of content.stacks) {
    const label = `Stack page "${stack.slug}"`;
    if (!(STACK_SLUGS as readonly string[]).includes(stack.slug)) report(`${label}: unknown slug.`);
    if (!isNonEmpty(stack.title) || !isNonEmpty(stack.intro)) report(`${label}: needs a title and an intro.`);
    if (stack.sections.length === 0 || stack.sections.some((section) => section.topics.length === 0)) {
      report(`${label}: every section needs at least one topic.`);
    }
    for (const topic of stack.sections.flatMap((section) => section.topics)) {
      const topicLabel = `${label}, topic "${topic.id}"`;
      if (!TASK_ID.test(topic.id)) report(`${topicLabel}: ids must be lowercase letters, digits and hyphens.`);
      if (!isNonEmpty(topic.title)) report(`${topicLabel}: has no title.`);
      if (topic.level !== "deep" && topic.level !== "review") report(`${topicLabel}: level must be "deep" or "review".`);
      for (const week of topic.weeks ?? []) {
        if (!Number.isInteger(week) || week < 1 || week > plan.totalWeeks) report(`${topicLabel}: week ${week} is out of range.`);
      }
      checkResources(topic.resources, topicLabel, report);
    }
  }
}

function checkSkills(content: Content, plan: PlanConfig, partial: boolean, report: Report): void {
  for (const id of findDuplicates(content.skills.map((skill) => skill.id))) report(`Skill card "${id}" is defined more than once.`);
  for (const skill of content.skills) {
    const label = `Skill card "${skill.id}"`;
    if (skill.bucket !== "master" && skill.bucket !== "delegate") report(`${label}: bucket must be "master" or "delegate".`);
    if (!isNonEmpty(skill.skill) || !isNonEmpty(skill.why) || !isNonEmpty(skill.howToVerify)) {
      report(`${label}: needs skill, why and howToVerify text.`);
    }
    for (const week of skill.weeks ?? []) {
      if (!Number.isInteger(week) || week < 1 || week > plan.totalWeeks) report(`${label}: week ${week} is out of range.`);
    }
  }
  if (!partial) {
    if (!content.skills.some((skill) => skill.bucket === "master")) report("No 'master' skill cards defined.");
    if (!content.skills.some((skill) => skill.bucket === "delegate")) report("No 'delegate' skill cards defined.");
  }
}
