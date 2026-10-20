import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week09 = defineWeek({
  number: 9,
  phaseId: "rag",
  title: "Reranking, contextual retrieval and citations",
  summary:
    "Improve what reaches the model with reranking and contextual chunk descriptions, then make every answer cite its sources and say clearly when the docs do not contain the answer.",
  projectId: "docs-qa",
  dsa: patternWeek("trees", [
    ["Binary Tree Right Side View", "Count Good Nodes in Binary Tree", "Validate Binary Search Tree"],
    ["Kth Smallest Element in a BST", "Construct Binary Tree from Preorder and Inorder Traversal"],
    ["Binary Tree Maximum Path Sum", "Serialize and Deserialize Binary Tree"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w09-reranking", "Rerank the merged results before generation", {
      detail:
        "Take the top 20 hybrid results and rerank them (a reranking model, or the LLM scoring relevance). Pass only the best 5 to the answer step. Measure recall@5 and latency before and after.",
      weight: 1.5,
      resources: [R.contextualRetrieval, R.azureRagGuide],
      projectId: "docs-qa",
    }),
    ai("w09-contextual-retrieval", "Contextual retrieval: add a short context line to each chunk", {
      detail:
        "At ingestion, ask a model to write one or two sentences that place each chunk in its document, and embed and index that with the chunk. Use prompt caching to keep the cost down. Measure the change on your eval.",
      weight: 1.5,
      resources: [R.contextualRetrieval, R.claudePromptCaching],
      projectId: "docs-qa",
    }),
    ai("w09-citations", "Answers with verifiable citations", {
      detail:
        "Return the answer with a list of cited chunks (document, section, quote). Use the provider's citations feature or a structured output, and check in code that every quote really appears in the cited chunk.",
      weight: 1.5,
      resources: [R.claudeCitations, R.claudeStructuredOutputs],
      projectId: "docs-qa",
    }),
    ai("w09-no-answer", "A clear 'not in the docs' answer instead of a guess", {
      detail:
        "Add 10 questions whose answer is not in the corpus. Make the system say so and point to the closest documents. Track the share of false answers on these questions as its own metric.",
      weight: 1.25,
      resources: [R.claudeReduceHallucinations],
      projectId: "docs-qa",
    }),
    ai("w09-context-order", "Context placement: order and number of chunks", {
      detail:
        "Try 3, 5 and 10 chunks and two orders (best first, best last). Read the 'lost in the middle' findings and check whether they show up with your model.",
      weight: 1,
      resources: [R.lostInTheMiddle],
      projectId: "docs-qa",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w09-context-management", "Manage the agent's context: clear, compact, start fresh", {
      detail:
        "Learn when to clear or compact the conversation and when to start a new session with a short brief. Track how long sessions go before quality drops.",
      weight: 0.75,
      resources: [R.claudeCodeBestPractices, R.contextEngineering],
    }),
    assisted("w09-agent-costs", "Know what your coding agent costs", {
      detail:
        "Check your usage for a week of work. Find the most expensive sessions and what made them expensive.",
      weight: 0.75,
      resources: [R.claudeCodeCosts],
    }),

    // --- System design (3 h) ---
    design("w09-sd-consistency", "Consistency models, CAP and PACELC", {
      detail:
        "Learn strong, eventual and read-your-writes consistency with examples. Explain where Project 2 is eventually consistent (a document edited but not yet re-indexed) and whether that is acceptable.",
      weight: 1,
      resources: [R.jepsenConsistency, R.ddia],
    }),
    design("w09-sd-notification-system", "Classic: design a notification system", {
      detail:
        "Email, push and in-app channels, user preferences, retries, rate limits per user and de-duplication. Keep it to 45 minutes.",
      weight: 1.25,
      resources: [R.systemDesign101, R.systemDesignPrimer],
    }),
    design("w09-sd-rag-latency", "Latency budget for a RAG answer", {
      detail:
        "Break one answer into steps (rewrite, two searches, rerank, generate) with measured times. Decide which steps can run in parallel and which could be cached.",
      weight: 0.75,
      resources: [R.claudeReduceLatency],
      projectId: "docs-qa",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w09-pg-mvcc", "PostgreSQL MVCC: how reads and writes avoid blocking", {
      detail:
        "Learn how PostgreSQL keeps row versions, what vacuum does, and why long transactions hurt. Show two sessions reading different versions of the same row.",
      weight: 0.75,
      resources: [R.pgMvcc],
    }),
    fundamentals("w09-pg-isolation", "Transaction isolation levels and the anomalies they prevent", {
      detail:
        "Reproduce a lost update with two sessions at Read Committed, then prevent it with Repeatable Read or a row lock. Write down which one you would use for stock reservations.",
      weight: 0.75,
      resources: [R.pgIsolation, R.efCoreConcurrency],
    }),
  ],
});
