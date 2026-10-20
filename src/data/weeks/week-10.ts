import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week10 = defineWeek({
  number: 10,
  phaseId: "rag",
  title: "RAG evals in CI — Project 2 done",
  summary:
    "Measure answer quality, not just retrieval: faithfulness, correctness and refusal behaviour, with an LLM judge you have checked by hand. Run the eval in CI so regressions block merges, then finish Project 2.",
  projectId: "docs-qa",
  milestone: "Project 2 done",
  dsa: patternWeek("tries", [
    ["Implement Trie (Prefix Tree)"],
    ["Design Add and Search Words Data Structure"],
    ["Word Search II"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w10-answer-metrics", "Answer quality metrics: faithfulness, correctness, refusals", {
      detail:
        "Define what a good answer is for your system: grounded in the sources, correct, cites the right chunk, refuses when it should. Read how RAG eval tools define these and pick three metrics.",
      weight: 1,
      resources: [R.ragas, R.claudeDevelopTests],
      projectId: "docs-qa",
    }),
    ai("w10-llm-judge", "An LLM judge you can trust: write it, then check it by hand", {
      detail:
        "Write a judge prompt with a clear rubric and structured output. Grade 30 answers by hand too and compare. Fix the rubric until you agree on at least 9 of 10.",
      weight: 1.5,
      resources: [R.hamelEvals, R.msAiEvaluation],
      projectId: "docs-qa",
    }),
    ai("w10-eval-ci", "Run the eval in CI and fail on regressions", {
      detail:
        "Add a CI job that runs retrieval and answer evals on every pull request that touches prompts, chunking or retrieval. Fail the build when a metric drops more than an agreed margin, and publish the report.",
      weight: 1.5,
      resources: [R.githubActions, R.promptfoo],
      projectId: "docs-qa",
    }),
    ai("w10-p2-ui", "Project 2 UI: answers, citations and source previews", {
      detail:
        "Show the answer with numbered citations; clicking one opens the source passage. Show the 'not in the docs' state clearly. Stream the answer as in Project 1.",
      weight: 1,
      resources: [R.aiSdkChatbot],
      projectId: "docs-qa",
    }),
    ai("w10-p2-finish", "Finish Project 2: README, eval report and retrospective", {
      detail:
        "Write the README with the architecture, the eval table for every experiment you ran and the known limits. Record a short demo and write down which change gave the biggest improvement.",
      weight: 1.75,
      resources: [R.azureRagGuide],
      projectId: "docs-qa",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w10-review-checklist", "Your checklist for reviewing AI-written code", {
      detail:
        "From ten weeks of reviews, write a personal checklist: tests that really test, error handling, security, data access, invented APIs. Add it to CLAUDE.md or a review skill.",
      weight: 1,
      resources: [R.claudeCodeBestPractices, R.claudeCodeSkills],
    }),
    assisted("w10-agent-eval-fix", "Let the agent fix a failing eval, with guardrails", {
      detail:
        "Break a prompt on purpose, then ask the agent to make the eval pass without editing the eval files. Check how it fixed it.",
      weight: 0.5,
      resources: [R.claudeCodePermissionModes],
      projectId: "docs-qa",
    }),

    // --- System design (3 h) ---
    design("w10-sd-llm-gateway", "Design an LLM gateway: routing, quotas, fallback, caching", {
      detail:
        "One service between your apps and model providers. Design routing by model, per-team quotas, provider fallback, response caching, logging with redaction and cost reporting. Read the gateway guide first.",
      weight: 1.5,
      resources: [R.genAiGateway, R.patternGatewayRouting],
    }),
    design("w10-sd-p2-design-doc", "Write Project 2's final design doc", {
      detail:
        "Requirements, components, data flow, failure modes and trade-offs, updated with what you measured. Include the eval numbers that justify each choice.",
      weight: 1.5,
      resources: [R.azureRagGuide, R.systemDesignPrimer],
      projectId: "docs-qa",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w10-transformers", "How transformers work: attention in plain words", {
      detail:
        "Read The Illustrated Transformer. Explain in five sentences what attention does and why the context window has a limit and a cost that grows with length.",
      weight: 0.75,
      resources: [R.illustratedTransformer, R.attentionPaper],
    }),
    fundamentals("w10-tokenizers", "Tokenizers: how text becomes tokens", {
      detail:
        "Watch part of the tokenizer video and try a tokenizer library on English, code, JSON and Bengali or another language you use. Note which ones cost more tokens.",
      weight: 0.75,
      resources: [R.karpathyTokenizer, R.tiktoken],
    }),
  ],
});
