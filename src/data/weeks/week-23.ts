import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week23 = defineWeek({
  number: 23,
  phaseId: "production-ai",
  title: "Hardening: failure tests, security review and the eval dashboard",
  summary:
    "Break the capstone on purpose and make it survive, run a full security review, and build the eval dashboard that shows quality, cost and safety over time.",
  projectId: "order-exception-agent",
  dsa: patternWeek("greedy", [
    ["Maximum Subarray", "Jump Game", "Jump Game II"],
    ["Gas Station", "Hand of Straights", "Merge Triplets to Form Target Triplet"],
    ["Partition Labels", "Valid Parenthesis String"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w23-failure-injection", "Failure injection: provider down, slow tools, crashed workers", {
      detail:
        "Run small chaos experiments: block the model provider, make a tool slow, kill the worker mid-run, fill the queue. For each, write what happened and fix what did not degrade gracefully.",
      weight: 1.5,
      resources: [R.chaosPrinciples, R.polly],
      projectId: "order-exception-agent",
    }),
    ai("w23-security-review", "Full security review of the capstone", {
      detail:
        "Go through your threat model, the OWASP lists and the MCP security guide. Rerun the attack suite, check authorization on every endpoint and tool, and write a short security report with open risks.",
      weight: 1.75,
      resources: [R.owaspLlmTop10, R.mcpSecurity],
      projectId: "order-exception-agent",
    }),
    ai("w23-eval-dashboard", "Eval dashboard: quality, cost and safety over time", {
      detail:
        "One page showing eval scores per version, attack-suite results, cost per run and approval rate, with a line for each prompt or model change.",
      weight: 1.5,
      resources: [R.langfuse, R.msAiEvaluation],
      projectId: "order-exception-agent",
    }),
    ai("w23-load-test", "Load test the whole system with a fake model", {
      detail:
        "Replace the model with a fake that has realistic latency and run your k6 tests. Confirm budgets, rate limits and backpressure behave as designed under load.",
      weight: 1,
      resources: [R.k6],
      projectId: "order-exception-agent",
    }),
    ai("w23-fix-list", "Fix the top issues and freeze scope", {
      detail:
        "Rank everything you found this week by risk, fix the top items and write the rest down as known limits. No new features from here on.",
      weight: 1,
      resources: [R.sreBook],
      projectId: "order-exception-agent",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w23-large-refactor", "A large refactor with an agent, done safely", {
      detail:
        "Pick one cross-cutting cleanup. Plan it, split it into small steps with tests passing after each, and use a subagent to review each step.",
      weight: 1,
      resources: [R.claudeCodeSubagents, R.claudeCodeCommonWorkflows],
      projectId: "order-exception-agent",
    }),
    assisted("w23-agent-docs", "Keep docs true with the agent's help", {
      detail:
        "Ask the agent to compare the README and design doc with the code and list what is out of date. Fix it yourself.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
      projectId: "order-exception-agent",
    }),

    // --- System design (3 h) ---
    design("w23-sd-ai-platform", "Design a multi-tenant AI platform for a company", {
      detail:
        "Shared gateway, per-team keys and budgets, approved models, shared RAG and MCP servers with tenant isolation, evals and audit. 45 minutes, out loud.",
      weight: 1.5,
      resources: [R.genAiGateway, R.azureArchitecture],
    }),
    design("w23-sd-review-classics", "Review the classic designs you did", {
      detail:
        "Redo one earlier classic in 30 minutes without notes (URL shortener, rate limiter, chat, feed, notifications, payments). Compare with your first attempt.",
      weight: 1.5,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w23-explain-drills", "Explain-it-simply drills on fundamentals", {
      detail:
        "Out loud, in two minutes each: what happens when you type a URL, how an index speeds up a query, why async does not mean parallel, how a container differs from a VM. Note the ones you stumble on.",
      weight: 0.75,
      resources: [R.hpbn, R.ddia],
    }),
    fundamentals("w23-ml-basics-refresh", "Refresh the ML basics interviewers ask about", {
      detail:
        "Embeddings, attention, temperature, fine-tuning versus RAG versus prompting, and how evals differ from tests. Write a one-line answer for each.",
      weight: 0.75,
      resources: [R.hfLlmCourse, R.chipHuyenAiEngineering],
    }),
  ],
});
