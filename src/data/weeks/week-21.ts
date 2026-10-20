import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week21 = defineWeek({
  number: 21,
  phaseId: "production-ai",
  title: "Capstone features complete and online quality monitoring",
  summary:
    "Finish the capstone's core flows, manage the agent's context on long runs, and watch quality after release: sample real runs, score them, and turn bad ones into new eval cases.",
  projectId: "order-exception-agent",
  dsa: patternWeek("dp-2d", [
    ["Unique Paths", "Longest Common Subsequence"],
    ["Best Time to Buy and Sell Stock with Cooldown", "Coin Change II"],
    ["Target Sum", "Interleaving String"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w21-capstone-flows", "Complete the capstone's exception flows end to end", {
      detail:
        "Every exception type in your scope goes from detection to proposal to approval to action, with the audit log and traces. Run the full eval and fix the weakest flow.",
      weight: 2,
      resources: [R.buildingEffectiveAgents, R.msAgentFramework],
      projectId: "order-exception-agent",
    }),
    ai("w21-context-engineering", "Context engineering for long agent runs", {
      detail:
        "For runs with many tool calls, keep only what matters in context: summarise old tool results, drop what is no longer needed, and keep notes outside the context. Measure tokens per run before and after.",
      weight: 1.25,
      resources: [R.contextEngineering, R.claudeContextEditing],
      projectId: "order-exception-agent",
    }),
    ai("w21-online-monitoring", "Online quality monitoring: sample, score, alert", {
      detail:
        "Score a sample of runs every day with your checked LLM judge and with signals like approval and edit rate. Alert when quality drops.",
      weight: 1.25,
      resources: [R.hamelEvals, R.langfuse],
      projectId: "order-exception-agent",
    }),
    ai("w21-feedback-loop", "Turn bad runs into new eval cases", {
      detail:
        "Add a 'this was wrong' button for approvers. Each flagged run becomes a new eval case with the correct outcome after review. Track how the eval set grows.",
      weight: 1.25,
      resources: [R.claudeDevelopTests],
      projectId: "order-exception-agent",
    }),
    ai("w21-reasoning-effort", "When extended thinking helps, and what it costs", {
      detail:
        "Turn on extended thinking for the hardest exception type only. Compare eval score, latency and cost with and without it.",
      weight: 1,
      resources: [R.claudeExtendedThinking],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w21-team-rollout", "Write a team rollout plan for AI-assisted engineering", {
      detail:
        "As if for your team: tool setup, shared CLAUDE.md and skills, review rules for AI-written code, security settings, cost limits and how you will measure whether it helps.",
      weight: 1,
      resources: [R.claudeCodeIam, R.claudeCodeBestPractices],
    }),
    assisted("w21-onboarding-demo", "Run a 20-minute demo of your agent workflow", {
      detail:
        "Show a colleague (or record) one real task from plan to merged change. Write down the questions they ask.",
      weight: 0.5,
      resources: [R.claudeCodeCommonWorkflows],
    }),

    // --- System design (3 h) ---
    design("w21-sd-payment-system", "Classic: design a payment system", {
      detail:
        "Idempotent payment requests, a ledger, reconciliation with the payment provider, retries and refunds. Keep it to 45 minutes.",
      weight: 1.25,
      resources: [R.stripeIdempotency, R.systemDesign101],
    }),
    design("w21-sd-event-sourcing", "Event sourcing and CQRS for audit-heavy systems", {
      detail:
        "Learn when storing events instead of current state helps (a complete audit trail) and what it costs. Decide whether the capstone's audit log should be the source of truth.",
      weight: 1,
      resources: [R.patternEventSourcing, R.patternCqrs],
    }),
    design("w21-sd-capstone-v2", "Capstone design doc v2", {
      detail:
        "Update the design with gateway, tracing, guardrails, the audit log and online monitoring as built. Mark open risks.",
      weight: 0.75,
      resources: [R.azureWellArchitected],
      projectId: "order-exception-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w21-iac", "Infrastructure as code: Bicep or Terraform", {
      detail:
        "Learn the idea of declaring infrastructure in files. Describe the capstone's cloud resources (container app, database, secrets) in one of the two tools.",
      weight: 1,
      resources: [R.bicep, R.terraform],
      projectId: "order-exception-agent",
    }),
    fundamentals("w21-gc-memory", ".NET memory and garbage collection basics", {
      detail:
        "Learn generations and the large object heap. Check whether streaming large tool results creates memory pressure in your worker.",
      weight: 0.5,
      resources: [R.dotnetGc],
    }),
  ],
});
