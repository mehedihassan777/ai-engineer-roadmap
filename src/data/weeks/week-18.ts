import { ai, assisted, defineWeek, design, fundamentals, mockWeek } from "../helpers";
import { R } from "../resources";

export const week18 = defineWeek({
  number: 18,
  phaseId: "production-ai",
  title: "Tracing every model and tool call",
  summary:
    "Trace each capstone run end to end with OpenTelemetry: every model call, tool call, approval and job step, with tokens and cost on the spans. DSA this week is a timed mock interview.",
  projectId: "order-exception-agent",
  dsa: mockWeek(["backtracking", "graphs", "topological-sort", "union-find", "intervals", "trees"]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w18-otel-dotnet", "OpenTelemetry in the .NET services", {
      detail:
        "Add traces, metrics and logs to the API, the MCP server and the worker, exported to a local collector and viewer. Check that one ticket shows up as one trace across all three.",
      weight: 1.5,
      resources: [R.otelDotnet, R.otelConcepts],
      projectId: "order-exception-agent",
    }),
    ai("w18-genai-spans", "Model and tool spans with the GenAI conventions", {
      detail:
        "Turn on the OpenTelemetry support in the IChatClient pipeline and follow the generative-AI semantic conventions for model, tokens and tool calls. Do not record prompt text by default; make it an opt-in setting with redaction.",
      weight: 1.5,
      resources: [R.otelGenAi, R.msExtAiOverview],
      projectId: "order-exception-agent",
    }),
    ai("w18-llm-tracing-tool", "Try an LLM tracing tool and compare with plain OpenTelemetry", {
      detail:
        "Send the same traces to an LLM-focused tracing tool. Compare what it shows (prompts, costs, eval scores per trace) with your generic viewer and decide what you need.",
      weight: 1.25,
      resources: [R.langfuse],
      projectId: "order-exception-agent",
    }),
    ai("w18-cost-metrics", "Cost and quality metrics on a dashboard", {
      detail:
        "Record tokens, cost, latency, steps per run, approval rate and eval score as metrics. Build one dashboard with these and set two alerts.",
      weight: 1.25,
      resources: [R.otelDotnet, R.sreMonitoring],
      projectId: "order-exception-agent",
    }),
    ai("w18-debug-with-traces", "Debug three bad runs using only the traces", {
      detail:
        "Pick three failed or wrong runs and find the cause from traces and logs alone. Add whatever was missing to the instrumentation.",
      weight: 1.25,
      resources: [R.otelConcepts],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w18-agent-usage-monitoring", "Monitor your own coding-agent usage", {
      detail:
        "Set up usage monitoring for your coding agent (it can export OpenTelemetry too). Look at a week of data: sessions, cost and which tasks were worth it.",
      weight: 1,
      resources: [R.claudeCodeMonitoring, R.claudeCodeCosts],
    }),
    assisted("w18-agent-instrumentation", "Let the agent add instrumentation, then check the spans", {
      detail:
        "Ask the agent to instrument one service. Open the traces and check names, attributes and that no secret or prompt text leaks.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
      projectId: "order-exception-agent",
    }),

    // --- System design (3 h) ---
    design("w18-sd-mock-classic", "Mock system design interview: design a ride-sharing backend", {
      detail:
        "45 minutes, timed, out loud: location updates, matching, pricing, trip state and scaling hot regions. List what you skipped.",
      weight: 1.5,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),
    design("w18-sd-mock-ai", "Mock AI system design: RAG over 10 million documents for many tenants", {
      detail:
        "45 minutes: ingestion at scale, tenant isolation in the index, hybrid retrieval, evals, cost per query and caching.",
      weight: 1.5,
      resources: [R.azureRagGuide, R.patternSharding],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w18-kubernetes", "Kubernetes basics: pods, deployments, services", {
      detail:
        "Do the basics tutorial. Explain what Kubernetes gives you over Docker Compose and when a managed container service is enough.",
      weight: 1,
      resources: [R.kubernetesBasics],
    }),
    fundamentals("w18-structured-logging", "Structured logging and correlation ids", {
      detail:
        "Make every log line structured and carry the trace id. Find one ticket's logs across all services with a single query.",
      weight: 0.5,
      resources: [R.aspnetLogging],
      projectId: "order-exception-agent",
    }),
  ],
});
