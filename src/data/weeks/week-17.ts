import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week17 = defineWeek({
  number: 17,
  phaseId: "production-ai",
  title: "Capstone kickoff and eval-driven development",
  summary:
    "Start the capstone: an order-exception agent that spots stuck, late or inconsistent orders and proposes fixes. Write the evals before the features, and gate every change on them in CI.",
  projectId: "order-exception-agent",
  dsa: patternWeek("intervals", [
    ["Insert Interval", "Merge Intervals"],
    ["Non-overlapping Intervals", "Meeting Rooms", "Meeting Rooms II"],
    ["Minimum Interval to Include Each Query"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w17-capstone-scope", "Capstone scope: exceptions, actions and what is out of scope", {
      detail:
        "List the order exceptions the agent handles (payment failed, stock mismatch, late shipment, address problem) and the actions it may propose. Decide what it may do alone (read, tag) and what needs approval (hold, refund, reroute).",
      weight: 1,
      resources: [R.buildingEffectiveAgents],
      projectId: "order-exception-agent",
    }),
    ai("w17-capstone-scenarios", "Synthetic exception scenarios with expected outcomes", {
      detail:
        "Generate 60 synthetic scenarios in the demo OMS, each with the expected classification and action. Include tricky and hostile ones. This is the eval set the whole capstone is built against.",
      weight: 1.5,
      resources: [R.claudeDevelopTests, R.bogus],
      projectId: "order-exception-agent",
    }),
    ai("w17-capstone-skeleton", "Capstone skeleton: reuse the MCP server, the job runner and the UI", {
      detail:
        "Wire together what you built: the OMS MCP server as tools, the queued job runner with approvals from Project 4, and a Next.js page listing exceptions. No new infrastructure unless you need it.",
      weight: 1.75,
      resources: [R.mcpCsharpSdk, R.msAgentFramework],
      projectId: "order-exception-agent",
    }),
    ai("w17-eval-gate", "Eval gate in CI with separate fast and full suites", {
      detail:
        "A fast suite with a fake model on every push, and a full suite with the real model on pull requests that touch prompts, tools or models. Fail on regressions and post the report on the pull request.",
      weight: 1.5,
      resources: [R.githubActions, R.msAiEvaluation],
      projectId: "order-exception-agent",
    }),
    ai("w17-eval-practices", "Eval practices: error analysis before more metrics", {
      detail:
        "Read about error analysis. Look at 20 failures by hand, group them into types and fix the biggest group first. Keep a log of failure types over time.",
      weight: 1,
      resources: [R.hamelEvals, R.chipHuyenAiEngineering],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w17-ai-pr-review", "AI pull-request review: what it catches and what it misses", {
      detail:
        "Run an AI review on five of your pull requests and compare with your own review. Keep its findings that were real and tune its instructions to cut the noise.",
      weight: 1,
      resources: [R.claudeCodeGithubActions],
      projectId: "order-exception-agent",
    }),
    assisted("w17-capstone-claude-md", "Capstone CLAUDE.md: rules for an agent-heavy codebase", {
      detail:
        "Write the capstone's CLAUDE.md with the never-do list (no write tools without approval, no real data, no prompt changes without evals).",
      weight: 0.5,
      resources: [R.claudeCodeMemory],
      projectId: "order-exception-agent",
    }),

    // --- System design (3 h) ---
    design("w17-sd-observability", "Observability: logs, metrics and traces, and what each is for", {
      detail:
        "Learn the three signals and how traces connect a request across services. Decide what you need to answer 'why did the agent propose this refund?' a week later.",
      weight: 1,
      resources: [R.otelConcepts, R.sreMonitoring],
    }),
    design("w17-sd-slos", "SLOs and error budgets, including for AI quality", {
      detail:
        "Set SLOs for the capstone: availability, latency, and a quality SLO from your evals (for example 'at least 90% of proposals accepted'). Decide what happens when the budget runs out.",
      weight: 1,
      resources: [R.sreSlos],
      projectId: "order-exception-agent",
    }),
    design("w17-sd-capstone-design", "Capstone design doc v1", {
      detail:
        "Requirements, components, data flow, failure modes and trade-offs for the order-exception agent, reusing the earlier designs where they fit.",
      weight: 1,
      resources: [R.systemDesignPrimer, R.azureWellArchitected],
      projectId: "order-exception-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w17-github-actions", "CI/CD with GitHub Actions: jobs, caching, secrets", {
      detail:
        "Build a workflow that restores, builds and tests both the .NET and Next.js parts with caching. Store the model API key as a secret and make sure it never reaches logs or forks.",
      weight: 1,
      resources: [R.githubActions],
      projectId: "order-exception-agent",
    }),
    fundamentals("w17-test-containers", "Integration tests with real services in CI", {
      detail:
        "Run PostgreSQL in a container inside CI for the integration tests instead of mocking the database.",
      weight: 0.5,
      resources: [R.testcontainers],
      projectId: "order-exception-agent",
    }),
  ],
});
