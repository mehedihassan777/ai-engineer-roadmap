import { CONTENT, PLAN } from "@/data";
import type { Content, PhaseId, PlanConfig, Week } from "@/data/types";
import { describe, expect, it } from "vitest";
import { validateContent } from "./validate-content";

/**
 * TODO(stage 5): remove `allowPartialPlan` once weeks 6-24, projects 2-5, the stack pages and the
 * skill cards exist. From then on `validateContent(CONTENT, PLAN)` must return no issues.
 */
const PARTIAL = { allowPartialPlan: true } as const;

const clone = (): Content => structuredClone(CONTENT);
const issuesFor = (content: Content, plan: PlanConfig = PLAN) => validateContent(content, plan, PARTIAL);
const expectIssue = (issues: string[], pattern: RegExp) => expect(issues.some((issue) => pattern.test(issue))).toBe(true);

/** Copies an existing week to a new number with unique task ids and no project link, so only the rule under test fires. */
function addWeekCopy(content: Content, fromIndex: number, number: number, phaseId: PhaseId): Week {
  const week = structuredClone(content.weeks[fromIndex]);
  week.number = number;
  week.phaseId = phaseId;
  week.projectId = undefined;
  for (const task of week.tasks) task.id = `w${String(number).padStart(2, "0")}-${task.id.replace(/^w\d+-/, "")}`;
  content.weeks.push(week);
  return week;
}

describe("the real content", () => {
  it("has no problems", () => {
    expect(validateContent(CONTENT, PLAN, PARTIAL)).toEqual([]);
  });

  it("lists what is still missing when the plan must be complete", () => {
    const issues = validateContent(CONTENT, PLAN);
    expectIssue(issues, /Week 3 is missing/);
    expectIssue(issues, /Week 24 is missing/);
    expectIssue(issues, /Project "docs-qa" is missing/);
    expectIssue(issues, /Stack page "mcp" is missing/);
    expectIssue(issues, /No 'master' skill cards/);
  });
});

describe("plan configuration", () => {
  it("requires the split to add up to 1", () => {
    expectIssue(issuesFor(CONTENT, { ...PLAN, split: { ...PLAN.split, ai: 0.5 } }), /must add up to 1/);
  });

  it("requires track budgets to add up to the weekly hours", () => {
    const awkward = { ...PLAN, weeklyHours: 14.9 };
    expectIssue(issuesFor(CONTENT, awkward), /Track budgets add up to/);
  });
});

describe("tasks", () => {
  it("rejects duplicate task ids, because progress is keyed by them", () => {
    const content = clone();
    content.weeks[1].tasks[0].id = content.weeks[0].tasks[0].id;
    expectIssue(issuesFor(content), /Task id ".*" is used more than once/);
  });

  it("rejects badly formed ids", () => {
    const content = clone();
    content.weeks[0].tasks[0].id = "Bad ID";
    expectIssue(issuesFor(content), /lowercase letters, digits and hyphens/);
  });

  it("requires one or two resources", () => {
    const none = clone();
    none.weeks[0].tasks[0].resources = [];
    expectIssue(issuesFor(none), /needs 1-2 resource\(s\), has 0/);

    const three = clone();
    three.weeks[0].tasks[0].resources = [{ title: "a" }, { title: "b" }, { title: "c" }];
    expectIssue(issuesFor(three), /needs 1-2 resource\(s\), has 3/);
  });

  it("requires https URLs that parse", () => {
    const insecure = clone();
    insecure.weeks[0].tasks[0].resources = [{ title: "x", url: "http://example.com" }];
    expectIssue(issuesFor(insecure), /must use https/);

    const broken = clone();
    broken.weeks[0].tasks[0].resources = [{ title: "x", url: "not a url" }];
    expectIssue(issuesFor(broken), /not a valid URL/);
  });

  it("allows a resource without a URL (shown as 'verify link')", () => {
    const content = clone();
    content.weeks[0].tasks[0].resources = [{ title: "Some book", kind: "book" }];
    expect(issuesFor(content)).toEqual([]);
  });

  it("rejects non-positive weights and tasks that would get less than one hour step", () => {
    const zero = clone();
    zero.weeks[0].tasks[0].weight = 0;
    expectIssue(issuesFor(zero), /weight must be a number greater than 0/);

    const tiny = clone();
    tiny.weeks[0].tasks[0].weight = 0.001;
    expectIssue(issuesFor(tiny), /below the 0.25 h step/);
  });

  it("rejects unknown project references", () => {
    const content = clone();
    content.weeks[0].tasks[0].projectId = "nope" as never;
    expectIssue(issuesFor(content), /unknown project "nope"/);
  });
});

describe("weeks", () => {
  it("rejects duplicate week numbers", () => {
    const content = clone();
    content.weeks.push(structuredClone(content.weeks[0]));
    expectIssue(issuesFor(content), /Week 1 is defined more than once/);
  });

  it("rejects a week outside its phase's range", () => {
    const content = clone();
    content.weeks[0].phaseId = "rag";
    expectIssue(issuesFor(content), /outside its range/);
  });

  it("requires every track to have tasks each week", () => {
    const content = clone();
    content.weeks[0].tasks = content.weeks[0].tasks.filter((task) => task.track !== "assisted");
    expectIssue(issuesFor(content), /no tasks for track "assisted"/);
  });

  it("requires the minimum number of DSA sessions", () => {
    const content = clone();
    const dsa = content.weeks[0].tasks.filter((task) => task.track === "dsa");
    content.weeks[0].tasks = content.weeks[0].tasks.filter((task) => task !== dsa[0]);
    expectIssue(issuesFor(content), /has 2 DSA session\(s\); at least 3 are required/);
  });

  it("rejects a week pointing at a project outside the project's week range", () => {
    const content = clone();
    content.projects[0].weeks = [3, 5];
    expectIssue(issuesFor(content), /week 1 points to it but is outside its range 3-5/);
  });
});

describe("DSA plan", () => {
  const firstPatternWeek = (content: Content) => {
    const dsa = content.weeks[0].dsa;
    if (dsa.kind !== "pattern") throw new Error("week 1 should be a pattern week");
    return dsa;
  };

  it("rejects problem names that are not in the pattern (typos)", () => {
    const content = clone();
    firstPatternWeek(content).sessions[0][0] = "Two Sumz";
    expectIssue(issuesFor(content), /"Two Sumz" is not a problem of pattern "arrays-hashing"/);
  });

  it("rejects a problem scheduled twice", () => {
    const content = clone();
    const dsa = firstPatternWeek(content);
    dsa.sessions[1][0] = dsa.sessions[0][0];
    expectIssue(issuesFor(content), /already scheduled in week 1/);
  });

  it("rejects an unknown pattern", () => {
    const content = clone();
    firstPatternWeek(content).patternId = "nope" as never;
    expectIssue(issuesFor(content), /unknown DSA pattern "nope"/);
  });

  it("puts mock-interview weeks on every sixth week, and only there", () => {
    const misplaced = clone();
    misplaced.weeks[1].dsa = { kind: "mock", coversPatternIds: ["arrays-hashing"] };
    expectIssue(issuesFor(misplaced), /is a mock week but only every 6th week should be/);

    const missing = clone();
    addWeekCopy(missing, 1, 6, "rag"); // a normal pattern week where week 6 must be a mock week
    expectIssue(issuesFor(missing), /Week 6: should be a DSA mock-interview week/);
  });

  it("requires mock weeks to cover patterns that were taught earlier", () => {
    const content = clone();
    const mock = addWeekCopy(content, 1, 6, "rag");
    mock.dsa = { kind: "mock", coversPatternIds: ["graphs"] };
    expect(validateContent(content, PLAN, PARTIAL)).toEqual([]); // not enforced while the plan is incomplete
    expectIssue(validateContent(content, PLAN), /covers "graphs", which has not been taught/);

    mock.dsa = { kind: "mock", coversPatternIds: ["arrays-hashing", "two-pointers"] };
    expect(validateContent(content, PLAN, PARTIAL)).toEqual([]);
  });
});

describe("projects, stacks and skills", () => {
  it("rejects duplicate definition-of-done ids", () => {
    const content = clone();
    content.projects[0].definitionOfDone.push({ id: content.projects[0].definitionOfDone[0].id, text: "again" });
    expectIssue(issuesFor(content), /definition-of-done id ".*" is used twice/);
  });

  it("rejects an empty system-design section", () => {
    const content = clone();
    content.projects[0].systemDesign.failureModes = [];
    expectIssue(issuesFor(content), /systemDesign.failureModes is empty/);
  });

  it("validates stack topics: unique ids, levels, resources", () => {
    const content = clone();
    content.stacks = [
      {
        slug: "dotnet",
        title: ".NET",
        intro: "intro",
        sections: [
          {
            title: "Core",
            topics: [
              { id: "async", title: "Async", level: "deep", resources: [{ title: "Docs", url: "https://example.com" }] },
              { id: "async", title: "Again", level: "maybe" as never, resources: [] },
            ],
          },
        ],
      },
    ];
    const issues = issuesFor(content);
    expectIssue(issues, /Stack topic id "async" is used more than once/);
    expectIssue(issues, /level must be "deep" or "review"/);
    expectIssue(issues, /needs 1-2 resource\(s\), has 0/);
  });

  it("validates skill cards", () => {
    const content = clone();
    content.skills = [
      { id: "a", skill: "Async", bucket: "master", why: "why", howToVerify: "how", weeks: [99] },
      { id: "a", skill: "Boilerplate", bucket: "wrong" as never, why: "", howToVerify: "how" },
    ];
    const issues = issuesFor(content);
    expectIssue(issues, /Skill card "a" is defined more than once/);
    expectIssue(issues, /bucket must be "master" or "delegate"/);
    expectIssue(issues, /needs skill, why and howToVerify text/);
    expectIssue(issues, /week 99 is out of range/);
  });
});
