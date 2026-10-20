import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week14 = defineWeek({
  number: 14,
  phaseId: "mcp-agents",
  title: "Agent loops and workflows",
  summary:
    "Learn when you need an agent and when a fixed workflow is better, then start Project 4: a support-ticket triage agent that reads synthetic tickets, looks up orders through your MCP server and proposes an action.",
  projectId: "ticket-triage-agent",
  dsa: patternWeek("graphs", [
    ["Number of Islands", "Max Area of Island", "Clone Graph"],
    ["Walls and Gates", "Rotting Oranges", "Pacific Atlantic Water Flow"],
    ["Surrounded Regions", "Word Ladder"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w14-agents-vs-workflows", "Agents vs workflows: pick the simplest thing that works", {
      detail:
        "Read Building effective agents. List the workflow patterns (prompt chaining, routing, parallel, orchestrator-workers, evaluator-optimizer) and decide which parts of ticket triage need a real agent loop.",
      weight: 1.25,
      resources: [R.buildingEffectiveAgents],
    }),
    ai("w14-agent-framework", "Build agents in .NET: Microsoft Agent Framework basics", {
      detail:
        "Read the overview and run one sample. Build a tiny agent with one tool and see how it runs the loop, keeps the conversation and calls tools. Check the docs for the current API, which still changes.",
      weight: 1.25,
      resources: [R.msAgentFramework, R.msAgentFrameworkRepo],
    }),
    ai("w14-p4-tickets", "Project 4: synthetic tickets and the triage contract", {
      detail:
        "Generate about 100 synthetic support tickets (late delivery, wrong item, refund request, angry customer, spam). Define the output: category, priority, linked order, a proposed action and a short reason.",
      weight: 1.25,
      resources: [R.claudeStructuredOutputs, R.bogus],
      projectId: "ticket-triage-agent",
    }),
    ai("w14-p4-triage-agent", "Triage agent v1 using the OMS MCP server as its tools", {
      detail:
        "The agent reads a ticket, finds the order through your MCP server and returns the triage result. Limit the steps and tokens per ticket. Log each step so you can see how it reasoned.",
      weight: 2,
      resources: [R.msAgentFramework, R.mcpCsharpSdk],
      projectId: "ticket-triage-agent",
    }),
    ai("w14-p4-eval-v0", "Eval v0 for triage: accuracy per category and steps per ticket", {
      detail:
        "Label 40 tickets by hand. Measure category accuracy, priority accuracy, wrong-order links and the average number of steps. Save the run for comparison.",
      weight: 1,
      resources: [R.claudeDevelopTests, R.hamelEvals],
      projectId: "ticket-triage-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w14-parallel-sessions", "Parallel agent sessions with git worktrees", {
      detail:
        "Run two agent sessions at once on separate worktrees (for example the eval script and the UI). Merge both and note where they got in each other's way.",
      weight: 1,
      resources: [R.claudeCodeCommonWorkflows],
      projectId: "ticket-triage-agent",
    }),
    assisted("w14-agent-sdk-look", "Look at how a coding agent is built: the Agent SDK", {
      detail:
        "Read the Agent SDK overview and compare its loop, tools and permissions with what you built this week.",
      weight: 0.5,
      resources: [R.claudeAgentSdk],
    }),

    // --- System design (3 h) ---
    design("w14-sd-durable-execution", "Durable execution: workflows that survive crashes", {
      detail:
        "Learn how durable workflow engines checkpoint each step so a crash resumes instead of restarting. Compare them with a simple job table and a worker.",
      weight: 1.25,
      resources: [R.durableFunctions, R.temporal],
    }),
    design("w14-sd-agent-reliability", "Design for agent reliability: steps, budgets, checkpoints", {
      detail:
        "For the triage agent, decide what is saved after each step, how many steps and tokens it may use, what happens on a timeout, and how a person can see and resume a stuck run.",
      weight: 1,
      resources: [R.buildingEffectiveAgents, R.contextEngineering],
      projectId: "ticket-triage-agent",
    }),
    design("w14-sd-p4-design", "Project 4 design: requirements, components and failure modes", {
      detail:
        "Write the first version of the design doc for the triage agent, including the queue, the worker and the approval step coming in week 16.",
      weight: 0.75,
      resources: [R.patternQueueLoadLeveling],
      projectId: "ticket-triage-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w14-rabbitmq", "RabbitMQ hands-on: queues, acks and redelivery", {
      detail:
        "Do the first tutorials. Kill a consumer before it acknowledges a message and watch the message come back. That is at-least-once delivery.",
      weight: 0.75,
      resources: [R.rabbitmqTutorials],
    }),
    fundamentals("w14-background-workers", "Background workers in .NET", {
      detail:
        "Build a BackgroundService that takes jobs from a queue and stops cleanly on shutdown without losing the job in progress.",
      weight: 0.75,
      resources: [R.dotnetWorkers],
      projectId: "ticket-triage-agent",
    }),
  ],
});
