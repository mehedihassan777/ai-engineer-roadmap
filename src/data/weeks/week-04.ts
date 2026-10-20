import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week04 = defineWeek({
  number: 4,
  phaseId: "llm-foundations",
  title: "Tool calling",
  summary:
    "Let the model fetch real data: define read-only tools, run the tool loop through Microsoft.Extensions.AI, render tool results as UI components, and run the whole stack with Docker Compose.",
  projectId: "order-assistant",
  dsa: patternWeek("stack", [
    ["Valid Parentheses", "Min Stack", "Evaluate Reverse Polish Notation"],
    ["Generate Parentheses", "Daily Temperatures"],
    ["Car Fleet", "Largest Rectangle in Histogram"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w04-tool-use-concepts", "How tool use works: definitions, tool calls, results, the loop", {
      detail:
        "Read how a model asks for a tool, how you send the result back, and how the loop ends. Write the message sequence for 'Is order 1042 delayed and is the SKU back in stock?' by hand before writing any code.",
      weight: 1,
      resources: [R.claudeToolUse, R.claudeDefineTools],
    }),
    ai("w04-dotnet-tools", "Add get_order, search_orders and get_inventory as .NET functions", {
      detail:
        "Create the three tools as thin typed wrappers over your application services (not the database). Register them with function invocation on the IChatClient pipeline. Validate arguments, cap the result size and return an explicit 'not found' instead of an empty object.",
      weight: 2,
      resources: [R.msFunctionCalling, R.msExtAiChatClient],
      projectId: "order-assistant",
    }),
    ai("w04-tool-descriptions", "Write tool names and descriptions the model can use well", {
      detail:
        "Rewrite each tool description as if for a new colleague: when to use it, what each argument means, and what comes back. Run ten questions and count wrong or unneeded tool calls before and after.",
      weight: 1,
      resources: [R.writingToolsForAgents],
      projectId: "order-assistant",
    }),
    ai("w04-tool-ui", "Render tool calls and results as UI components", {
      detail:
        "Stream tool calls as structured parts and show them in the chat: an order card for get_order, a small table for search results, a stock badge for inventory. Show a 'looking up order…' state while a tool runs.",
      weight: 1.5,
      resources: [R.aiSdkToolUsage],
      projectId: "order-assistant",
    }),
    ai("w04-loop-limits", "Guard the loop: max iterations, result size and a token budget", {
      detail:
        "Set a maximum number of tool rounds and a per-request token budget. Write a test with a fake client that keeps asking for tools and prove the loop stops with a clear message.",
      weight: 1.25,
      resources: [R.msExtAiOverview, R.xunit],
      projectId: "order-assistant",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w04-hooks", "Hooks: run format and tests automatically after agent edits", {
      detail:
        "Add a hook that runs the formatter after every edit and one that blocks edits to migration files. Check that the agent sees the hook output and fixes what it broke.",
      weight: 1,
      resources: [R.claudeCodeHooks, R.claudeCodeSettings],
      projectId: "order-assistant",
    }),
    assisted("w04-review-tool-code", "Review agent-written tool code for missing validation", {
      detail:
        "Ask the agent to add a fourth read-only tool, then review it only for input validation, authorization and result size. List what it missed and add those points to CLAUDE.md.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
      projectId: "order-assistant",
    }),

    // --- System design (3 h) ---
    design("w04-sd-databases", "Databases: SQL vs NoSQL, replication and read replicas", {
      detail:
        "Learn when a relational database is the right default, what leader-follower replication gives you, and what replication lag does to 'read your own writes'. Read the replication chapter summary in DDIA.",
      weight: 1,
      resources: [R.ddia, R.systemDesignPrimer],
    }),
    design("w04-sd-partitioning", "Partitioning and sharding: keys, hot spots and rebalancing", {
      detail:
        "Compare range and hash partitioning, find the hot-spot risk in each, and decide how you would shard orders if one PostgreSQL server were not enough.",
      weight: 1,
      resources: [R.patternSharding, R.ddia],
    }),
    design("w04-sd-rate-limiter", "Classic: design a rate limiter", {
      detail:
        "Token bucket versus sliding window, where the limiter lives (gateway or service), and how to share counts across instances. You will reuse this for LLM token budgets in week 19.",
      weight: 1,
      resources: [R.patternRateLimiting, R.systemDesign101],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w04-docker-basics", "Docker basics: images, containers, layers, volumes", {
      detail:
        "Work through the getting-started guide. Write a multi-stage Dockerfile for the API and check the final image size.",
      weight: 0.75,
      resources: [R.dockerGetStarted, R.dotnetContainer],
    }),
    fundamentals("w04-docker-compose", "Docker Compose for Project 1: database, API and web", {
      detail:
        "One docker compose up should start PostgreSQL with seed data, the API and the web app. Add health checks so the API waits for the database.",
      weight: 0.75,
      resources: [R.dockerCompose, R.aspnetHealthChecks],
      projectId: "order-assistant",
    }),
  ],
});
