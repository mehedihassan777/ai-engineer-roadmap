import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week22 = defineWeek({
  number: 22,
  phaseId: "production-ai",
  title: "Shipping safely: containers, CI/CD and gradual rollout",
  summary:
    "Deploy the capstone with Docker and a CI/CD pipeline that runs tests, evals and attack suites before every release, and roll out prompt and model changes behind flags with a canary.",
  projectId: "order-exception-agent",
  dsa: patternWeek("dp-2d", [
    ["Longest Increasing Path in a Matrix", "Edit Distance"],
    ["Distinct Subsequences", "Burst Balloons"],
    ["Regular Expression Matching"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w22-containers", "Production containers for every capstone service", {
      detail:
        "Small multi-stage images, a non-root user, health and readiness checks, and configuration only through environment variables and secrets.",
      weight: 1.25,
      resources: [R.dotnetContainer, R.aspnetHealthChecks],
      projectId: "order-exception-agent",
    }),
    ai("w22-pipeline", "CI/CD pipeline: build, test, eval, attack suite, deploy", {
      detail:
        "One pipeline that builds images, runs unit and integration tests, the fast and full evals and the red-team suite, then deploys to a test environment. Production deploys need a manual approval.",
      weight: 1.75,
      resources: [R.githubActions, R.azureContainerApps],
      projectId: "order-exception-agent",
    }),
    ai("w22-prompt-flags", "Prompts and models behind feature flags", {
      detail:
        "Version prompts and model choices as configuration and switch them with a flag per tenant or a percentage of runs. Record the prompt and model version on every trace.",
      weight: 1.25,
      resources: [R.featureToggles],
      projectId: "order-exception-agent",
    }),
    ai("w22-canary", "Canary a prompt change and compare quality live", {
      detail:
        "Send 10% of runs to a new prompt version. Compare approval rate, eval score and cost between versions on the dashboard, then promote or roll back.",
      weight: 1.25,
      resources: [R.canaryRelease, R.langfuse],
      projectId: "order-exception-agent",
    }),
    ai("w22-runbook", "Runbook: what to do when the model or a tool misbehaves", {
      detail:
        "Write short steps for the common incidents: provider outage, cost spike, quality drop, a tool causing wrong changes. Include how to switch the agent to 'propose only' mode.",
      weight: 1.25,
      resources: [R.sreBook],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w22-measure-impact", "Measure what AI assistance changed in your work", {
      detail:
        "Compare a few similar tasks with and without the agent: time, review effort and bugs found later. Be honest about where it slowed you down.",
      weight: 1,
      resources: [R.claudeCodeMonitoring],
    }),
    assisted("w22-agent-pipeline-work", "Use the agent for pipeline and infrastructure files, carefully", {
      detail:
        "Let the agent draft the deploy workflow. Review every permission, secret reference and trigger before you merge it.",
      weight: 0.5,
      resources: [R.claudeCodeSecurity, R.githubActions],
      projectId: "order-exception-agent",
    }),

    // --- System design (3 h) ---
    design("w22-sd-deployment-strategies", "Deployment strategies: rolling, blue-green, canary", {
      detail:
        "Compare the strategies, how each rolls back, and what database changes need to look like so old and new versions can run side by side.",
      weight: 1,
      resources: [R.blueGreen, R.canaryRelease],
    }),
    design("w22-sd-ai-rollout", "Design rollout for AI changes: prompts, models and tools", {
      detail:
        "A prompt or model change is a deploy that unit tests cannot fully check. Design the path from offline eval to canary to full rollout, with the metrics that stop it.",
      weight: 1,
      resources: [R.featureToggles, R.hamelEvals],
    }),
    design("w22-sd-capstone-scale", "Capstone scalability review", {
      detail:
        "Find the first bottleneck at 10x load (model rate limits, database, queue) using your load tests, and write how you would remove it.",
      weight: 1,
      resources: [R.k6, R.patternQueueLoadLeveling],
      projectId: "order-exception-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w22-networking-deploy", "Networking for deploys: DNS, load balancers and TLS", {
      detail:
        "Follow a request to your deployed app: DNS lookup, load balancer, TLS termination, container. Explain where each timeout is set.",
      weight: 0.75,
      resources: [R.hpbn, R.azureContainerApps],
    }),
    fundamentals("w22-db-migrations", "Safe database migrations in a pipeline", {
      detail:
        "Run EF Core migrations as a separate step, make them backward compatible (add first, remove later) and test a rollback.",
      weight: 0.75,
      resources: [R.efCoreGettingStarted, R.blueGreen],
      projectId: "order-exception-agent",
    }),
  ],
});
