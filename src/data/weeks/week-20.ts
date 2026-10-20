import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week20 = defineWeek({
  number: 20,
  phaseId: "production-ai",
  title: "Guardrails and AI security",
  summary:
    "Threat-model the capstone and defend it: prompt injection through orders and documents, data leaking through retrieval, tools used beyond their purpose. Add input and output guardrails, per-tool permissions and an audit log, then attack it yourself.",
  projectId: "order-exception-agent",
  dsa: patternWeek("dp-1d", [
    ["Decode Ways", "Coin Change"],
    ["Maximum Product Subarray", "Word Break"],
    ["Longest Increasing Subsequence", "Partition Equal Subset Sum"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w20-llm-risks", "The main LLM application risks and how they apply to you", {
      detail:
        "Go through the OWASP Top 10 for LLM applications and mark each risk as high, medium or low for the capstone, with a reason.",
      weight: 1,
      resources: [R.owaspLlmTop10, R.nistAiRmf],
    }),
    ai("w20-injection-defenses", "Prompt injection defenses in depth", {
      detail:
        "Combine several layers: untrusted content clearly marked, a classifier or check for injected instructions, narrow tools, approval on writes and no way to send data out. Measure how many of your attacks each layer stops.",
      weight: 1.5,
      resources: [R.claudeMitigateJailbreaks, R.willisonPromptInjection],
      projectId: "order-exception-agent",
    }),
    ai("w20-tool-permissions-audit", "Per-tool permissions and an audit log", {
      detail:
        "Each tool declares what it needs; each run gets only the tools its job type needs. Write every tool call, approval and result to an append-only audit log you can search by order and by user.",
      weight: 1.5,
      resources: [R.aspnetAuthorization, R.mcpSecurity],
      projectId: "order-exception-agent",
    }),
    ai("w20-output-guardrails", "Output guardrails: validation, PII checks and refusals", {
      detail:
        "Validate every proposal against business rules (a refund can never exceed the order total). Check customer-facing text for personal data it should not contain. Block and log when a check fails.",
      weight: 1.25,
      resources: [R.claudeReduceHallucinations, R.owaspGenAi],
      projectId: "order-exception-agent",
    }),
    ai("w20-red-team", "Red-team the capstone with an automated attack suite", {
      detail:
        "Write 30 attack cases (injection, data extraction, tool misuse, jailbreaks) and run them in CI next to the evals. Any new pass of an attack fails the build.",
      weight: 1.5,
      resources: [R.promptfoo, R.owaspLlmTop10],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w20-agent-security", "Security of coding agents: injection through repos and tools", {
      detail:
        "Learn how a coding agent can be attacked through files, issues, web pages and MCP servers it reads. Review which MCP servers and permissions you have enabled and remove what you do not need.",
      weight: 1,
      resources: [R.claudeCodeSecurity, R.mcpSecurity],
    }),
    assisted("w20-secret-hygiene", "Keep secrets out of agent sessions", {
      detail:
        "Check that your agent cannot read .env files or keys, and that nothing secret is in your CLAUDE.md, prompts or logs.",
      weight: 0.5,
      resources: [R.claudeCodeSettings, R.aspnetAppSecrets],
    }),

    // --- System design (3 h) ---
    design("w20-sd-threat-model", "Threat modeling with STRIDE", {
      detail:
        "Learn the STRIDE categories and how to draw trust boundaries on a data-flow diagram. Practise on a simple login service first.",
      weight: 1,
      resources: [R.msThreatModelingStride, R.owaspThreatModeling],
    }),
    design("w20-sd-capstone-threat-model", "Threat-model the capstone", {
      detail:
        "Draw the capstone's data flow with trust boundaries (users, model provider, MCP server, documents, database). List threats per boundary, including RAG data leakage between users and tool permission abuse, with the mitigation for each.",
      weight: 1.5,
      resources: [R.msThreatModelingStride, R.owaspLlmTop10],
      projectId: "order-exception-agent",
    }),
    design("w20-sd-data-privacy", "Data privacy: what goes to the model, what is stored, for how long", {
      detail:
        "Decide what data is sent to the model provider, what is logged, how long it is kept and how it is deleted.",
      weight: 0.5,
      resources: [R.nistAiRmf],
      projectId: "order-exception-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w20-owasp-api", "Web and API security basics", {
      detail:
        "Go through the OWASP API Security Top 10 and check your APIs for broken object-level authorization, the most common one.",
      weight: 0.75,
      resources: [R.owaspApiTop10, R.owaspCheatSheets],
    }),
    fundamentals("w20-secrets-management", "Secrets management: development, CI and production", {
      detail:
        "Move every secret out of config files: user secrets locally, CI secrets in the pipeline, a secret store in production. Rotate one key to test the process.",
      weight: 0.75,
      resources: [R.aspnetAppSecrets, R.owaspCheatSheets],
    }),
  ],
});
