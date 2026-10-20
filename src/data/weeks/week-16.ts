import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week16 = defineWeek({
  number: 16,
  phaseId: "mcp-agents",
  title: "Human in the loop — Project 4 done, exam prep",
  summary:
    "Put a person in charge of every irreversible step, look at when multiple agents help, finish the triage agent, and prepare for the Claude Certified Architect - Foundations exam.",
  projectId: "ticket-triage-agent",
  milestone: "Project 4 done · Claude Certified Architect - Foundations prep",
  dsa: patternWeek("union-find", [
    ["Number of Connected Components in an Undirected Graph", "Graph Valid Tree"],
    ["Redundant Connection", "Min Cost to Connect All Points"],
    ["Swim in Rising Water"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w16-hitl-approval", "Approval queue: the agent proposes, a person decides", {
      detail:
        "Refunds and order changes wait in an approval queue with the agent's reason and evidence. A person approves, edits or rejects; only then does the job continue. Track how often people change the proposal.",
      weight: 1.75,
      resources: [R.buildingEffectiveAgents, R.mcpElicitation],
      projectId: "ticket-triage-agent",
    }),
    ai("w16-multi-agent", "When multiple agents help, and when they just cost more", {
      detail:
        "Read how a multi-agent research system was built and what it cost. Decide whether triage would gain anything from a separate 'customer reply' agent, and write down why.",
      weight: 1,
      resources: [R.multiAgentResearch],
    }),
    ai("w16-p4-eval", "Eval v1 for triage and comparison with week 14", {
      detail:
        "Rerun the eval on all labelled tickets, add hostile tickets with injected instructions, and compare with v0. Write the results into the README.",
      weight: 1,
      resources: [R.hamelEvals, R.claudeMitigateJailbreaks],
      projectId: "ticket-triage-agent",
    }),
    ai("w16-p4-finish", "Finish Project 4: README, demo and retrospective", {
      detail:
        "Document the job lifecycle, the approval flow, the failure handling and the eval numbers. Record a demo with one approved and one rejected action.",
      weight: 1.25,
      resources: [R.msAgentFramework],
      projectId: "ticket-triage-agent",
    }),
    ai("w16-exam-prep", "Exam prep: Claude Certified Architect - Foundations", {
      detail:
        "Find the current exam guide and practice material on Anthropic Academy (check for the latest version). Map each exam area to what you built in Projects 1-4 and study the gaps.",
      weight: 1.75,
      resources: [R.anthropicAcademy, R.claudeApiDocs],
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w16-claude-code-course", "Take the Claude Code in Action course", {
      detail:
        "Go through the course and note anything you have not used yet. Try one of them on Project 4.",
      weight: 1,
      resources: [R.claudeCodeInAction],
    }),
    assisted("w16-assisted-retro", "Retrospective on 16 weeks of agent-assisted work", {
      detail:
        "What does the agent do well for you, where does it waste time, and what do you never delegate? Update your review checklist.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
    }),

    // --- System design (3 h) ---
    design("w16-sd-approval-flows", "Design approval flows for AI actions", {
      detail:
        "Which actions need approval, who approves, timeouts and escalation, what the approver sees, and how every decision is audited. Compare with a four-eyes rule in finance.",
      weight: 1.25,
      resources: [R.buildingEffectiveAgents, R.nistAiRmf],
    }),
    design("w16-sd-exam-scenarios", "Practise architecture scenarios for the exam", {
      detail:
        "Take three scenarios (a RAG assistant, a tool-using agent, a batch pipeline) and for each write the architecture, the model choice, the evals and the safety controls in under 20 minutes.",
      weight: 1.25,
      resources: [R.anthropicAcademy, R.claudeBatch],
    }),
    design("w16-sd-p4-final", "Project 4: final design doc", {
      detail:
        "Update the design with the job lifecycle diagram, approval flow, retries, outbox and dead letters as built.",
      weight: 0.5,
      resources: [R.transactionalOutbox],
      projectId: "ticket-triage-agent",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w16-cloud-basics", "Cloud basics: compute, storage, networking, identity", {
      detail:
        "Read the Well-Architected pillars. Map each piece of your projects to a managed cloud service and note the cost drivers.",
      weight: 0.75,
      resources: [R.azureWellArchitected, R.azureArchitecture],
    }),
    fundamentals("w16-container-apps", "Run a container in the cloud", {
      detail:
        "Deploy one of your APIs as a container to a managed container service, with secrets from the platform rather than in the image. Delete it afterwards to avoid costs.",
      weight: 0.75,
      resources: [R.azureContainerApps, R.aspnetAppSecrets],
    }),
  ],
});
