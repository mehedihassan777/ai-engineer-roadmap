import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week05 = defineWeek({
  number: 5,
  phaseId: "llm-foundations",
  title: "Cost, latency and reliability — Project 1 done",
  summary:
    "Measure and control what each request costs and how long it takes, survive provider timeouts and rate limits, add prompt caching, and finish Project 1 with a README, a demo and a retrospective.",
  projectId: "order-assistant",
  milestone: "Project 1 done",
  dsa: patternWeek("binary-search", [
    ["Binary Search", "Search a 2D Matrix", "Koko Eating Bananas"],
    ["Find Minimum in Rotated Sorted Array", "Search in Rotated Sorted Array"],
    ["Time Based Key-Value Store", "Median of Two Sorted Arrays"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w05-usage-accounting", "Record tokens, latency and cost for every request", {
      detail:
        "Store input and output tokens, time to first token, total time, tool calls and estimated cost per request. Show them in a debug drawer in the UI. Compare the real numbers with your week-2 estimate.",
      weight: 1.5,
      resources: [R.claudePricing, R.msExtAiOverview],
      projectId: "order-assistant",
    }),
    ai("w05-resilience", "Timeouts, retries with backoff and rate-limit handling", {
      detail:
        "Add a timeout per call, retry only safe failures (429, 5xx, timeouts) with exponential backoff and jitter, and respect the retry-after header. When the provider is down the dashboard keeps working and the assistant shows 'unavailable'.",
      weight: 1.5,
      resources: [R.claudeErrors, R.dotnetHttpResilience],
      projectId: "order-assistant",
    }),
    ai("w05-prompt-caching", "Prompt caching: cache the system prompt and tool definitions", {
      detail:
        "Mark the stable part of the prompt for caching, then measure cost and time to first token with and without it over 20 calls. Record the cache hit rate.",
      weight: 1,
      resources: [R.claudePromptCaching, R.claudeReduceLatency],
      projectId: "order-assistant",
    }),
    ai("w05-model-choice", "Pick the right model per endpoint using your fixtures", {
      detail:
        "Run the 15 summary fixtures on a smaller and a larger model. Compare pass rate, latency and cost, and pick per endpoint. Keep the choice in configuration, not code.",
      weight: 1,
      resources: [R.claudeChoosingModel, R.claudeModels],
      projectId: "order-assistant",
    }),
    ai("w05-p1-finish", "Finish Project 1: README, demo and retrospective", {
      detail:
        "Go through the definition of done on the project page. Write the README (architecture, how to run, how to swap providers, known limits), record a short demo and write down what surprised you and what you would change.",
      weight: 1.75,
      resources: [R.msEShopSupport],
      projectId: "order-assistant",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w05-custom-command", "Turn a repeated prompt into a slash command or skill", {
      detail:
        "Pick something you asked the agent more than twice (for example 'add an endpoint with tests and OpenAPI'). Make it a reusable command or skill in the repo and use it once.",
      weight: 1,
      resources: [R.claudeCodeSkills, R.claudeCodeSlashCommands],
      projectId: "order-assistant",
    }),
    assisted("w05-readme-with-agent", "Draft the README with the agent, then fact-check it", {
      detail:
        "Let the agent draft the README from the code. Check every command and claim by running it. Count how many lines were wrong or invented.",
      weight: 0.5,
      resources: [R.claudeCodeCommonWorkflows],
      projectId: "order-assistant",
    }),

    // --- System design (3 h) ---
    design("w05-sd-resilience-patterns", "Resilience patterns: retry, circuit breaker, bulkhead", {
      detail:
        "Learn when each pattern helps and when it makes things worse (retry storms). Read the AWS article on timeouts, retries and jitter.",
      weight: 1,
      resources: [R.patternCircuitBreaker, R.awsRetriesJitter],
    }),
    design("w05-sd-llm-app-design", "Design an LLM-backed feature: budgets, fallbacks, degraded mode", {
      detail:
        "Write a one-page design for 'add an AI assistant to an existing dashboard': latency targets, token budgets per user, what happens when the model is slow or down, and how you test it.",
      weight: 1.25,
      resources: [R.eugeneYanPatterns, R.patternBulkhead],
    }),
    design("w05-sd-p1-review", "Review the Project 1 design against what you built", {
      detail:
        "Go through the requirements, failure modes and trade-offs on the project page. Mark each as done, changed or skipped, and set the latency targets from your measurements.",
      weight: 0.75,
      resources: [R.systemDesignPrimer],
      projectId: "order-assistant",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w05-http-basics", "HTTP basics: methods, status codes, headers, keep-alive, HTTP/2", {
      detail:
        "Read the MDN overview. Then open the browser dev tools on your app and explain every header on the chat request and response.",
      weight: 0.75,
      resources: [R.mdnHttpOverview, R.hpbn],
    }),
    fundamentals("w05-tcp-tls", "TCP and TLS: what happens before the first byte", {
      detail:
        "Learn the TCP handshake, the TLS handshake and why connection reuse matters for latency. Explain why IHttpClientFactory exists.",
      weight: 0.75,
      resources: [R.hpbn, R.aspnetHttpClientFactory],
    }),
  ],
});
