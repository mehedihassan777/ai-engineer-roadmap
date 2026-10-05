import type { Phase } from "./types";

export const PHASES: Phase[] = [
  {
    id: "llm-foundations",
    number: 1,
    title: "LLM foundations",
    weeks: [1, 5],
    summary:
      "How LLM APIs really behave - tokens, context, prompting, structured output, streaming, tool use, cost and latency - through an AI assistant inside an order-management dashboard.",
    outcomes: [
      "Explain tokens, context windows and sampling well enough to reason about cost and latency",
      "Call an LLM through Microsoft.Extensions.AI and swap providers without touching business code",
      "Get reliable structured outputs: schema, validation, repair",
      "Stream answers end to end (.NET to Next.js) with working cancellation",
      "Let a model call tools safely and render tool results in the UI",
      "Budget cost and latency; handle timeouts, retries and rate limits",
    ],
    projectIds: ["order-assistant"],
  },
  {
    id: "rag",
    number: 2,
    title: "RAG done properly",
    weeks: [6, 10],
    summary:
      "Retrieval that you can measure: embeddings, chunking, pgvector, hybrid search with Elasticsearch, reranking, citations and an eval set - through document Q&A over internal docs.",
    outcomes: [
      "Choose chunking, embedding and index settings with evidence instead of defaults",
      "Build hybrid retrieval (pgvector + Elasticsearch) with reranking",
      "Ship answers with verifiable citations and a clear 'no answer' behaviour",
      "Measure retrieval and answer quality with an eval set and catch regressions",
    ],
    projectIds: ["docs-qa"],
  },
  {
    id: "mcp-agents",
    number: 3,
    title: "MCP and agents",
    weeks: [11, 16],
    summary:
      "Expose your systems to models safely with MCP, then build agents that are reliable enough to run unattended - with approval before anything irreversible. Ends with exam preparation.",
    outcomes: [
      "Build and secure MCP servers with the official C# SDK against the current spec revision",
      "Design least-privilege tools with approval before writes",
      "Build agent loops and workflows with checkpoints and human-in-the-loop approval",
      "Make agents reliable with idempotent calls, retries, queue-based jobs, outbox, dead letters and streamed progress",
      "Be ready to sit the Claude Certified Architect - Foundations exam",
    ],
    projectIds: ["oms-mcp-server", "ticket-triage-agent"],
  },
  {
    id: "production-ai",
    number: 4,
    title: "Production AI and capstone",
    weeks: [17, 24],
    summary:
      "Everything that separates a demo from a system you can run: evals, tracing, cost control, guardrails and security - applied to a capstone order-exception agent.",
    outcomes: [
      "Gate changes with evals and regression tests in CI",
      "Trace, meter and budget every LLM and tool call",
      "Add caching, rate limits, model fallback, guardrails, per-tool permissions and audit logs",
      "Threat-model an agent system: prompt injection, RAG data leakage, tool permission abuse",
      "Ship the capstone with Docker, CI/CD, an eval dashboard, tracing and a security review",
    ],
    projectIds: ["order-exception-agent"],
  },
];
