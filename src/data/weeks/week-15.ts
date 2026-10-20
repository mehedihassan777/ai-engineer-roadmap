import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week15 = defineWeek({
  number: 15,
  phaseId: "mcp-agents",
  title: "Reliable agents: queues, retries, outbox and progress",
  summary:
    "Make the triage agent safe to run unattended: queue-based jobs, idempotent tool calls, bounded retries, an outbox for side effects, a dead-letter queue for what keeps failing, and live progress in the UI.",
  projectId: "ticket-triage-agent",
  dsa: patternWeek("topological-sort", [
    ["Course Schedule", "Course Schedule II"],
    ["Alien Dictionary", "Network Delay Time"],
    ["Reconstruct Itinerary", "Cheapest Flights Within K Stops"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w15-queue-jobs", "Run each triage as a queued job with saved state", {
      detail:
        "New tickets go on a queue; a worker runs the agent and saves state after each step. Restart the worker in the middle of a run and check that the job continues instead of starting again.",
      weight: 1.5,
      resources: [R.patternQueueLoadLeveling, R.dotnetWorkers],
      projectId: "ticket-triage-agent",
    }),
    ai("w15-idempotent-tools", "Idempotent tool calls and safe retries", {
      detail:
        "Give every side-effecting tool call a key built from the job and step, so a retry cannot hold an order twice. Retry only errors that are safe to retry, with backoff and a limit.",
      weight: 1.25,
      resources: [R.idempotentConsumer, R.patternRetry],
      projectId: "ticket-triage-agent",
    }),
    ai("w15-outbox", "Outbox for side effects such as customer emails", {
      detail:
        "When the agent decides to notify a customer, write the message to an outbox table in the same transaction as the triage result. A separate worker sends it. Prove nothing is sent twice or lost when the worker crashes.",
      weight: 1.25,
      resources: [R.transactionalOutbox],
      projectId: "ticket-triage-agent",
    }),
    ai("w15-dead-letters", "Dead-letter queue and a screen to inspect failed jobs", {
      detail:
        "After N failures a job moves to a dead-letter queue with the error and the last saved state. Build a small page to view, retry or close these jobs.",
      weight: 1.25,
      resources: [R.serviceBusDlq, R.eipMessaging],
      projectId: "ticket-triage-agent",
    }),
    ai("w15-streamed-progress", "Stream agent progress to the UI", {
      detail:
        "Show each step as it happens ('reading ticket', 'looking up order 1042', 'proposing refund'). Use server-sent events and make the page recover if the connection drops.",
      weight: 1.5,
      resources: [R.mdnSse, R.aiSdkStreamProtocol],
      projectId: "ticket-triage-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w15-share-setup", "Share your agent setup with a team: plugins and project settings", {
      detail:
        "Package your best commands, skills, subagents and hooks so a teammate gets them by cloning the repo or installing a plugin. Write a short 'how we use the agent here' note.",
      weight: 1,
      resources: [R.claudeCodePlugins, R.claudeCodeSettings],
    }),
    assisted("w15-agent-failure-tests", "Ask the agent to write failure tests, then add the ones it missed", {
      detail:
        "Ask for tests for crash, retry and duplicate scenarios. Then add at least two cases it did not think of.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
      projectId: "ticket-triage-agent",
    }),

    // --- System design (3 h) ---
    design("w15-sd-job-scheduler", "Classic: design a distributed job scheduler", {
      detail:
        "Scheduled and on-demand jobs, at-least-once execution, leases so two workers do not run the same job, retries and visibility of stuck jobs.",
      weight: 1.25,
      resources: [R.systemDesign101, R.patternCompetingConsumers],
    }),
    design("w15-sd-exactly-once", "'Exactly once' is a myth: at-least-once plus idempotency", {
      detail:
        "Explain why exactly-once delivery is so hard, and how at-least-once plus idempotent handlers gives the same result in practice.",
      weight: 1,
      resources: [R.ddia, R.idempotentConsumer],
    }),
    design("w15-sd-backpressure", "Backpressure and load shedding for LLM work", {
      detail:
        "When 1,000 tickets arrive at once and you can make 50 model calls a minute, what happens? Design the queue limits, priorities and what users see.",
      weight: 0.75,
      resources: [R.patternQueueLoadLeveling, R.claudeRateLimits],
      projectId: "ticket-triage-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w15-redis", "Redis basics: data types, expiry, and what it is good for", {
      detail:
        "Try strings, hashes, sorted sets and expiry. Use it for a simple distributed lock and a rate-limit counter, and note the lock's limits.",
      weight: 0.75,
      resources: [R.redisDocs],
    }),
    fundamentals("w15-hybrid-cache", "Caching in .NET with HybridCache", {
      detail:
        "Add HybridCache in front of one slow read in your projects, with an expiry and protection against many requests filling the cache at once.",
      weight: 0.75,
      resources: [R.aspnetHybridCache],
    }),
  ],
});
