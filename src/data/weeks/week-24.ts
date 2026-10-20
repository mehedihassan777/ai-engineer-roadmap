import { ai, assisted, defineWeek, design, fundamentals, mockWeek } from "../helpers";
import { R } from "../resources";

export const week24 = defineWeek({
  number: 24,
  phaseId: "production-ai",
  title: "Ship the capstone and prepare for interviews",
  summary:
    "Release the capstone, write it up with the evidence (evals, traces, costs, security review), turn all five projects into a portfolio, and practise interviews. DSA this week is a final timed mock interview.",
  projectId: "order-exception-agent",
  milestone: "Capstone shipped",
  dsa: mockWeek(["dp-1d", "dp-2d", "greedy", "graphs", "intervals", "heap"]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w24-release", "Release the capstone and check the definition of done", {
      detail:
        "Deploy the final version, run the full eval and attack suites against it and go through the project's definition of done. Anything not done goes into known limits.",
      weight: 1.5,
      resources: [R.githubActions, R.azureContainerApps],
      projectId: "order-exception-agent",
    }),
    ai("w24-write-up", "Write up the capstone: problem, design, evidence, lessons", {
      detail:
        "A short case study: the problem, the architecture, the eval results, cost per run, the security review and what you would do next. Use numbers, not adjectives.",
      weight: 1.5,
      resources: [R.chipHuyenAiEngineering],
      projectId: "order-exception-agent",
    }),
    ai("w24-demo", "Record a five-minute demo", {
      detail:
        "Show an exception being detected, the proposal, the approval, the trace and the eval dashboard. Keep it short and rehearse once.",
      weight: 0.75,
      resources: [R.langfuse],
      projectId: "order-exception-agent",
    }),
    ai("w24-portfolio", "Portfolio: all five projects in one place", {
      detail:
        "One page with each project's goal, stack, a diagram, the key numbers and a link. Check every repo runs from a clean clone and contains only synthetic data.",
      weight: 1.5,
      resources: [R.githubActions],
    }),
    ai("w24-ai-interview-prep", "Practise AI engineering interview questions", {
      detail:
        "Prepare answers with examples from your projects: how you evaluate a RAG system, how you stop prompt injection, how you control cost, how you make agents reliable, when not to use an agent.",
      weight: 1.5,
      resources: [R.eugeneYanPatterns, R.buildingEffectiveAgents],
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w24-workflow-doc", "Write down your personal AI-assisted workflow", {
      detail:
        "One page: how you plan, delegate, review and verify; your never-delegate list; the skills and hooks you rely on. This is also a good interview answer.",
      weight: 1,
      resources: [R.claudeCodeBestPractices, R.claudeCodeSkills],
    }),
    assisted("w24-whats-new", "Check what changed in your tools during these 24 weeks", {
      detail:
        "Skim the changelogs of your coding agent, the MCP spec and the AI libraries you used. Note what you should update in your projects.",
      weight: 0.5,
      resources: [R.claudeCodeChangelog, R.mcpSpec],
    }),

    // --- System design (3 h) ---
    design("w24-sd-final-mock-classic", "Final mock system design interview: a classic problem", {
      detail:
        "45 minutes, timed, ideally with someone else as interviewer, on a problem you have not practised (for example a file-sharing service). Write down the feedback.",
      weight: 1.5,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),
    design("w24-sd-final-mock-ai", "Final mock AI system design: an agent that changes real data", {
      detail:
        "45 minutes: design an agent that handles order exceptions for a large retailer. Cover tools and permissions, approvals, reliability, evals, cost and security, with your capstone as evidence.",
      weight: 1.5,
      resources: [R.buildingEffectiveAgents, R.genAiGateway],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w24-fundamentals-review", "Review the fundamentals you found weakest", {
      detail:
        "Go back to the drills from week 23 and spend this time on the two weakest topics.",
      weight: 1,
      resources: [R.ddia, R.hpbn],
    }),
    fundamentals("w24-next-plan", "Plan what comes after the roadmap", {
      detail:
        "Write down the next three things to learn or build, based on the gaps you found, and how you will keep practising DSA and system design.",
      weight: 0.5,
      resources: [R.anthropicAcademy],
    }),
  ],
});
