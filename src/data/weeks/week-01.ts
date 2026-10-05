import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week01 = defineWeek({
  number: 1,
  phaseId: "llm-foundations",
  title: "LLM mental model and your first call",
  summary:
    "Learn what an LLM call really is — tokens in, tokens out, inside a context window — make your first call through Microsoft.Extensions.AI, and scaffold Project 1: a demo order-management API and a Next.js shell.",
  projectId: "order-assistant",
  dsa: patternWeek("arrays-hashing", [
    ["Contains Duplicate", "Valid Anagram", "Two Sum"],
    ["Group Anagrams", "Top K Frequent Elements", "Product of Array Except Self"],
    ["Valid Sudoku", "Longest Consecutive Sequence", "Encode and Decode Strings"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w01-llm-mental-model", "LLM mental model: tokens, context windows, sampling, stop reasons", {
      detail:
        "Watch the talk, then read how context windows work in your provider's docs. Write a one-page note in your own words: what is a token, what happens when the context fills up, what do temperature and top-p change, and why do two identical calls give different answers?",
      weight: 1.25,
      resources: [R.karpathyIntroLlms, R.claudeContextWindows],
    }),
    ai("w01-first-chat-client", "First call from .NET through Microsoft.Extensions.AI (IChatClient)", {
      detail:
        "Create a console app, register an IChatClient for your provider and send one prompt. Print the response text, the token usage and the stop reason. Then swap in a second provider or a local model by changing only the registration — that is the point of the abstraction.",
      weight: 1.5,
      resources: [R.msBuildChatApp, R.msExtAiChatClient],
    }),
    ai("w01-p1-scaffold-api", "Project 1 scaffold: demo OMS API with synthetic seed data", {
      detail:
        "ASP.NET Core minimal API + PostgreSQL + EF Core. Orders, order lines, customers, products, warehouses and inventory, seeded with generated data (never real client data). Endpoints: list/search orders, get order, inventory by SKU, health. Run PostgreSQL in a container for now; full Docker Compose comes in week 4.",
      weight: 1.75,
      resources: [R.aspnetApisOverview, R.bogus],
      projectId: "order-assistant",
    }),
    ai("w01-p1-scaffold-web", "Project 1 scaffold: Next.js shell with orders table and an empty chat panel", {
      detail:
        "App Router app with an orders list and order detail pages that read from your API, plus a placeholder chat panel. No AI yet — the goal is a working skeleton you extend every week.",
      weight: 1,
      resources: [R.nextAppRouter],
      projectId: "order-assistant",
    }),
    ai("w01-dotnet-pipeline-di", ".NET deep-dive: ASP.NET Core pipeline and DI lifetimes", {
      detail:
        "Draw the request pipeline of your API and mark where each middleware runs. Then list your services with their lifetimes and look for captive dependencies (a singleton holding a scoped service). Chat clients are usually singletons — know why before you add one.",
      weight: 0.75,
      resources: [R.aspnetMiddleware, R.dotnetDiGuidelines],
    }),
    ai("w01-next-server-client", "Next.js deep-dive: Server vs Client Components on the shell", {
      detail:
        "For every component in the shell decide Server or Client and write down why. Test the rule of thumb 'fetch on the server, interact on the client' — what will the chat panel need to be interactive?",
      weight: 0.5,
      resources: [R.nextServerClient],
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w01-claude-md", "Write CLAUDE.md for the Project 1 repo", {
      detail:
        "Cover architecture (layers and folders), build/test/run commands, conventions (naming, error handling, CQRS if you use it), the outbox and idempotency rules you will need later, and a 'never do' list: no destructive migrations, no real data, no committed secrets. Keep it short enough that the agent actually follows it.",
      weight: 1,
      resources: [R.claudeCodeMemory, R.claudeCodeBestPractices],
      projectId: "order-assistant",
    }),
    assisted("w01-claude-md-test", "Test your CLAUDE.md with a fresh agent session", {
      detail:
        "Start a new session and ask for a small change, for example a new endpoint. Note every wrong assumption — each one is a missing or unclear instruction. Fix CLAUDE.md and repeat once.",
      weight: 0.5,
      resources: [R.claudeCodeCommonWorkflows],
      projectId: "order-assistant",
    }),

    // --- System design (3 h) ---
    design("w01-sd-framework", "System design framework and back-of-envelope estimation", {
      detail:
        "Learn the flow: requirements, API, data model, high-level design, deep dives, trade-offs. Practise estimation: turn '100k daily users' into requests per second, storage and bandwidth using the latency numbers.",
      weight: 1,
      resources: [R.systemDesignPrimer, R.latencyNumbers],
    }),
    design("w01-sd-api-design", "API design: REST contracts, pagination, idempotency keys, error model", {
      detail:
        "Read the guidelines on resource naming, pagination, filtering and errors. Then study how idempotency keys make retried POSTs safe — you will need this for tool calls and agent side effects later.",
      weight: 1.25,
      resources: [R.msApiGuidelines, R.stripeIdempotency],
    }),
    design("w01-sd-p1-contract", "Apply it: write the Project 1 API contract", {
      detail:
        "Write the OpenAPI description (or equivalent) for orders, inventory and the future assistant endpoints with pagination, filtering, a consistent error shape (Problem Details) and idempotency on any POST. Review it against the guidelines before you build more.",
      weight: 0.75,
      resources: [R.aspnetOpenApi, R.rfc9457],
      projectId: "order-assistant",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w01-py-setup-basics", "Python setup and basics", {
      detail:
        "Install Python, create a virtual environment and work through the tutorial sections on data structures, functions, modules and errors. You are not becoming a Python developer — you are making AI-ecosystem examples readable.",
      weight: 1,
      resources: [R.pythonTutorial, R.pythonVenv],
    }),
    fundamentals("w01-py-first-llm-call", "Call an LLM from Python and compare it with your .NET call", {
      detail:
        "Install your provider's Python SDK, make the same call you made in .NET and compare the code, the response shape and the token-usage fields.",
      weight: 0.5,
      resources: [R.anthropicPythonSdk, R.claudeApiDocs],
    }),
  ],
});
