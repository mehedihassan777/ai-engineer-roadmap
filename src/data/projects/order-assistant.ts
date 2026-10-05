import { PROJECT_TITLES } from "../ids";
import { R } from "../resources";
import type { Project } from "../types";

export const orderAssistant: Project = {
  id: "order-assistant",
  title: PROJECT_TITLES["order-assistant"],
  phaseId: "llm-foundations",
  weeks: [1, 5],
  tagline:
    "An AI assistant inside an order-management dashboard: it summarizes orders, answers questions and calls tools to fetch data.",
  goal: "Ship a small but real LLM-integrated feature end to end — Next.js UI, ASP.NET Core backend, provider-agnostic model access, structured output, streaming and tool use — and learn where the costs, latencies and failure modes actually are. The demo OMS you build here is reused by every later project.",
  stack: {
    frontend: "Next.js (App Router) with AI SDK UI for the chat panel",
    backend: "ASP.NET Core minimal APIs with Microsoft.Extensions.AI (IChatClient)",
    data: "PostgreSQL + EF Core with synthetic seed data",
    infra: "Docker Compose (database, API, web)",
  },
  features: [
    "Orders dashboard: list and search, order detail, inventory lookup (the demo OMS API)",
    "Order summary: structured JSON (summary, risk flags, suggested next action) from a single endpoint",
    "Chat panel that answers questions about orders and inventory",
    "Streaming answers with a working Stop button — cancellation must reach the model provider",
    "Tool calling: get_order, search_orders and get_inventory (read-only), with results rendered as UI components",
    "Per-request token, cost and latency accounting in a debug drawer",
    "Provider swap by configuration only (a cloud model or a local one)",
  ],
  architectureNotes: [
    "Put the model behind IChatClient and compose behavior as middleware (logging now; OpenTelemetry, caching and limits in later phases). Business code never sees a provider SDK.",
    "Prompts are versioned files with tests, not string literals inside handlers.",
    "Tools are thin, typed wrappers over application services — never over the database directly — so the model gets the same validation and authorization as a human user.",
    "The chat endpoint streams; the summary endpoint returns a typed result. Keep them separate: different latency budgets and different failure handling.",
    "Treat everything the model reads from the OMS (notes, comments, product names) as untrusted input.",
    "Use synthetic data only. No real client or customer data goes into a prompt, a log or a test fixture.",
  ],
  systemDesign: {
    requirements: {
      functional: [
        "Users ask free-text questions about orders and inventory and receive grounded answers",
        "Users request a structured summary of any order",
        "The assistant fetches data through tools and cannot modify anything",
        "Answers stream, and users can cancel a response mid-stream",
        "Each answer shows which tool calls and data it used",
      ],
      nonFunctional: [
        "Responsive: a clear time-to-first-token target for chat and a full-response target for summaries (set the numbers in week 5 from measurements)",
        "Bounded cost: per-request token budget and a per-user daily cap, enforced server-side",
        "Resilient: a provider outage or rate limit never breaks the dashboard — the assistant degrades to 'unavailable'",
        "Private: prompts are redacted before logging; synthetic data only in development",
        "Cancellable end to end: browser abort, then the ASP.NET Core request-aborted token, then the provider request",
      ],
    },
    components: [
      { name: "Next.js web app", responsibility: "Dashboard pages and the chat panel; renders streamed messages and tool-result components" },
      { name: "ASP.NET Core API", responsibility: "Demo OMS endpoints (orders, inventory) plus the assistant endpoints (chat stream, order summary)" },
      { name: "Assistant service", responsibility: "Builds context, owns prompt versions, enforces the token budget and runs the tool loop through IChatClient" },
      { name: "Tool layer", responsibility: "Typed functions over application services with argument validation and result-size limits" },
      { name: "Model provider", responsibility: "External or local model reached only through IChatClient" },
      { name: "PostgreSQL", responsibility: "Orders, inventory and per-request usage records (tokens, latency, cost, tool calls)" },
    ],
    dataFlow: [
      "The user sends a message; the web app posts the conversation to the chat endpoint with a request id",
      "The API validates the request, loads the system prompt version and applies the token budget",
      "The IChatClient pipeline sends messages and tool definitions to the model and streaming starts",
      "If the model asks for a tool, the function-invocation step validates the arguments, runs the tool through the application service and feeds back a size-limited result",
      "Text deltas stream to the browser as they arrive; tool calls and results are streamed as structured parts so the UI can render them",
      "On completion, cancellation or error the API records usage (tokens, latency, cost, tool calls) and closes the stream",
      "The web app shows the final message, the tool trace and the usage in the debug drawer",
    ],
    failureModes: [
      { failure: "Provider timeout, 429 or 5xx", mitigation: "Bounded retries with backoff and jitter for safe calls, then an explicit 'assistant unavailable' state; the dashboard keeps working" },
      { failure: "The model invents an order id or SKU", mitigation: "Tools return an explicit 'not found'; the prompt requires answers to cite tool results; fixtures that tempt hallucination are part of the tests" },
      { failure: "Invalid structured output", mitigation: "Validate, make one repair attempt that includes the validation error, then fail with a typed error" },
      { failure: "Stream cut mid-answer", mitigation: "Mark the message incomplete and allow a retry; tools are read-only so there is nothing to roll back" },
      { failure: "Prompt injection hidden in order notes", mitigation: "Treat notes as delimited data, expose read-only tools only, never let model output trigger actions, and test with hostile fixtures" },
      { failure: "Runaway tool loop or huge tool result", mitigation: "Maximum iterations, maximum tool-result size and a per-request token budget" },
      { failure: "Cost spike", mitigation: "Per-user and global budgets plus usage records now; alerts and gateway-level limits in week 19" },
    ],
    tradeoffs: [
      {
        decision: "How the browser gets the stream",
        options: "A Next.js route handler as a thin BFF, or the .NET API emitting the AI SDK UI stream protocol directly",
        choice: "Decide in week 3 from measurements: prefer fewer hops if CORS and auth stay simple, otherwise keep the BFF",
      },
      {
        decision: "Tool granularity",
        options: "A few coarse tools versus many fine-grained ones",
        choice: "Start with three fine-grained read-only tools; merge only if round trips hurt latency",
      },
      {
        decision: "Model choice",
        options: "One strong model everywhere versus a smaller model for simple tasks",
        choice: "Pick per endpoint behind IChatClient; use the fixtures to decide whether the summary can use a cheaper model",
      },
      {
        decision: "What goes into the prompt",
        options: "The full order JSON versus a curated projection",
        choice: "A curated projection: fewer tokens, less leakage, easier tests",
      },
    ],
  },
  stretchGoals: [
    "Persist conversations and let users reopen them",
    "Build an Angular version of the chat panel as review-level practice",
    "Run the same fixtures against two providers and compare cost, latency and quality",
    "Add prompt caching and measure the savings",
    "Run against a local model for offline development",
  ],
  definitionOfDone: [
    { id: "seed", text: "The demo OMS API runs locally from a clean checkout with synthetic seed data" },
    { id: "summary", text: "The order summary endpoint returns validated typed JSON; invalid model output is repaired once or fails with a typed error" },
    { id: "golden", text: "At least 15 prompt fixtures run in CI against a fake IChatClient and on demand against a real model" },
    { id: "stream", text: "Chat streams end to end and the Stop button cancels the provider request (verified, not assumed)" },
    { id: "tools", text: "Three read-only tools work with argument validation and result-size limits, and their results render in the UI" },
    { id: "limits", text: "Timeouts, bounded retries and a per-request token budget are in place; provider failure degrades gracefully" },
    { id: "cost", text: "Token, latency and cost per request are recorded and visible, and the week-2 cost estimate is compared with reality" },
    { id: "injection", text: "Hostile order-note fixtures are tested and the mitigation is documented" },
    { id: "claude-md", text: "CLAUDE.md exists, was tested with a fresh agent session and lists the never-do rules" },
    { id: "readme", text: "The README explains the architecture, how to run it, how to swap providers and the known limitations" },
    { id: "retro", text: "A short demo and a retrospective (what surprised you, what you would change) are written down" },
  ],
  resources: [R.msExtAiOverview, R.aiSdkDocs, R.msEShopSupport],
};
