import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week13 = defineWeek({
  number: 13,
  phaseId: "mcp-agents",
  title: "Write tools with approval — Project 3 done",
  summary:
    "Add the first tools that change data, each behind a human approval step, defend against prompt injection that tries to trigger them, and finish the OMS MCP server with tests and docs.",
  projectId: "oms-mcp-server",
  milestone: "Project 3 done",
  dsa: patternWeek("backtracking", [
    ["Subsets", "Combination Sum", "Permutations"],
    ["Subsets II", "Combination Sum II", "Word Search"],
    ["Palindrome Partitioning", "Letter Combinations of a Phone Number", "N-Queens"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w13-write-tools", "Least-privilege write tools: hold an order, add a note", {
      detail:
        "Add two small write tools, each with an idempotency key and strict argument validation. Keep them narrow: 'put order on hold with a reason', not 'update order'. Log who asked, what the model sent and the result.",
      weight: 1.5,
      resources: [R.mcpTools, R.stripeIdempotency],
      projectId: "oms-mcp-server",
    }),
    ai("w13-approval", "Ask the user to approve before any write", {
      detail:
        "Show the exact change and require a yes before the tool runs, using elicitation or an approval step in your client. A refused or timed-out approval must leave nothing changed.",
      weight: 1.5,
      resources: [R.mcpElicitation, R.mcpSecurity],
      projectId: "oms-mcp-server",
    }),
    ai("w13-injection-defense", "Prompt injection defenses for tool-using models", {
      detail:
        "Plant instructions in order notes and product names that try to call a write tool. Test your defenses: data marked as untrusted, approval on writes, narrow tools, and no tool that can send data out. Record which attacks still get through.",
      weight: 1.5,
      resources: [R.claudeMitigateJailbreaks, R.willisonPromptInjection],
      projectId: "oms-mcp-server",
    }),
    ai("w13-mcp-tests", "Integration tests for the MCP server", {
      detail:
        "Start the server in tests, call every tool through an MCP client, and check results, errors and permissions. Use a real PostgreSQL in a container.",
      weight: 1,
      resources: [R.aspnetIntegrationTests, R.testcontainers],
      projectId: "oms-mcp-server",
    }),
    ai("w13-p3-finish", "Finish Project 3: README, security notes and demo", {
      detail:
        "Document the tools, the permissions model, how approval works and the known injection risks. Record a demo of a read question and an approved write.",
      weight: 1.25,
      resources: [R.mcpSpec],
      projectId: "oms-mcp-server",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w13-agent-in-ci", "Run your coding agent in CI", {
      detail:
        "Set up the agent's GitHub Action to review pull requests or answer @-mentions on one of your repos. Limit what it can do and check what it costs per run.",
      weight: 1,
      resources: [R.claudeCodeGithubActions, R.claudeCodeHeadless],
      projectId: "oms-mcp-server",
    }),
    assisted("w13-headless-script", "Headless runs: use the agent from a script", {
      detail:
        "Write a small script that runs the agent non-interactively for one repeatable job (for example 'update the API docs from the code') and saves its output.",
      weight: 0.5,
      resources: [R.claudeCodeHeadless],
    }),

    // --- System design (3 h) ---
    design("w13-sd-outbox", "Transactional outbox and idempotent consumers", {
      detail:
        "Why 'save to the database, then publish a message' loses messages, and how the outbox fixes it. Pair it with idempotent consumers so duplicates do no harm.",
      weight: 1,
      resources: [R.transactionalOutbox, R.idempotentConsumer],
    }),
    design("w13-sd-sagas", "Sagas: multi-step changes without distributed transactions", {
      detail:
        "Learn orchestration versus choreography and compensating actions. Design the saga for 'cancel order, release stock, refund payment'.",
      weight: 1.25,
      resources: [R.patternSaga, R.ddia],
    }),
    design("w13-sd-p3-final", "Project 3: final design doc with the approval flow", {
      detail:
        "Update the design with the write tools, the approval sequence diagram, idempotency and the audit log.",
      weight: 0.75,
      resources: [R.mcpSecurity],
      projectId: "oms-mcp-server",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w13-race-conditions", "Race conditions and locks in plain words", {
      detail:
        "Learn what a race condition is, then compare locks, optimistic concurrency and database constraints as fixes. Find one race in your projects.",
      weight: 0.75,
      resources: [R.dotnetThreadingBestPractices, R.pgMvcc],
    }),
    fundamentals("w13-optimistic-concurrency", "Optimistic concurrency in EF Core", {
      detail:
        "Add a concurrency token to orders and handle the conflict when two writes race. Test it with two parallel requests.",
      weight: 0.75,
      resources: [R.efCoreConcurrency],
      projectId: "oms-mcp-server",
    }),
  ],
});
