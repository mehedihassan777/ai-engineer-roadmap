import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week19 = defineWeek({
  number: 19,
  phaseId: "production-ai",
  title: "Cost control: gateway, caching, limits and fallback",
  summary:
    "Put a small LLM gateway in front of every model call: per-user and global budgets with alerts, rate limits, response and prompt caching, model fallback, and batch processing for work that can wait.",
  projectId: "order-exception-agent",
  dsa: patternWeek("dp-1d", [
    ["Climbing Stairs", "Min Cost Climbing Stairs"],
    ["House Robber", "House Robber II"],
    ["Longest Palindromic Substring", "Palindromic Substrings"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w19-gateway", "A small LLM gateway as IChatClient middleware", {
      detail:
        "Every model call goes through one layer that records usage, enforces limits and picks the model. Build it as middleware in the IChatClient pipeline so the agent code does not change.",
      weight: 1.5,
      resources: [R.genAiGateway, R.msExtAiOverview],
      projectId: "order-exception-agent",
    }),
    ai("w19-budgets", "Token budgets per user and per day, with alerts", {
      detail:
        "Enforce a per-run, per-user and global daily budget server-side. Alert at 80% and stop new non-urgent runs at 100%. Test it by setting a tiny budget.",
      weight: 1.25,
      resources: [R.aspnetRateLimit, R.claudeRateLimits],
      projectId: "order-exception-agent",
    }),
    ai("w19-caching", "Caching: prompt caching and caching whole responses", {
      detail:
        "Measure prompt-cache hits for the agent's system prompt and tool list. Add a response cache only where the same input really gives a reusable answer (for example classifying identical exception types), and measure the hit rate.",
      weight: 1.25,
      resources: [R.claudePromptCaching, R.aspnetHybridCache],
      projectId: "order-exception-agent",
    }),
    ai("w19-fallback", "Model fallback and graceful degradation", {
      detail:
        "When the main model is rate-limited or down, fall back to another model for low-risk steps, or queue the run. Check with your evals that the fallback model is good enough for each step you allow it on.",
      weight: 1.5,
      resources: [R.patternCircuitBreaker, R.claudeChoosingModel],
      projectId: "order-exception-agent",
    }),
    ai("w19-batch", "Batch processing for nightly work", {
      detail:
        "Move the nightly scan of all open orders to the batch API. Compare cost and handle results that come back hours later.",
      weight: 1.25,
      resources: [R.claudeBatch],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w19-spec-first", "Spec first: write the gateway spec, then let the agent build it", {
      detail:
        "Write a one-page spec with interfaces, limits and test cases. Let the agent implement it, and compare the result with work you started from a short prompt.",
      weight: 1,
      resources: [R.claudeCodeCommonWorkflows, R.claudeCodeBestPractices],
      projectId: "order-exception-agent",
    }),
    assisted("w19-right-model-for-task", "Pick the right model and effort for each coding task", {
      detail:
        "Try a smaller model for routine edits and a stronger one for design and debugging. Note where the cheaper choice was fine and where it cost you time.",
      weight: 0.5,
      resources: [R.claudeCodeCosts, R.claudeChoosingModel],
    }),

    // --- System design (3 h) ---
    design("w19-sd-multi-tenant-quotas", "Design multi-tenant quotas and fair usage", {
      detail:
        "Many teams share one model budget. Design quotas, burst limits, priorities and what each team sees when it hits a limit. Reuse your rate-limiter design from week 4.",
      weight: 1.25,
      resources: [R.patternRateLimiting, R.genAiGateway],
    }),
    design("w19-sd-cost-model", "A cost model for the capstone at 10x and 100x scale", {
      detail:
        "From your real metrics, estimate monthly cost at 10x and 100x volume. Find the biggest cost driver and two ways to cut it.",
      weight: 1,
      resources: [R.claudePricing],
      projectId: "order-exception-agent",
    }),
    design("w19-sd-semantic-cache", "Semantic caching: when it saves money and when it gives wrong answers", {
      detail:
        "Design a cache keyed by embedding similarity. Work out how a similar-but-different question gets a wrong cached answer, and how you would limit that.",
      weight: 0.75,
      resources: [R.eugeneYanPatterns, R.patternCacheAside],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w19-load-testing", "Load testing with k6", {
      detail:
        "Write a k6 script for the capstone API (with a fake model) and find where it breaks. Watch latency percentiles, not the average.",
      weight: 1,
      resources: [R.k6],
      projectId: "order-exception-agent",
    }),
    fundamentals("w19-percentiles", "Latency percentiles and why averages lie", {
      detail:
        "Learn p50, p95 and p99 and why tail latency grows when one request calls many services. Look at the percentiles from your load test.",
      weight: 0.5,
      resources: [R.sreMonitoring],
    }),
  ],
});
