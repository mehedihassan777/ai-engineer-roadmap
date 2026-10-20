import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week08 = defineWeek({
  number: 8,
  phaseId: "rag",
  title: "Hybrid search with Elasticsearch",
  summary:
    "Add keyword search next to vector search, merge the two with reciprocal rank fusion, and measure whether hybrid retrieval actually beats either one on your eval set.",
  projectId: "docs-qa",
  dsa: patternWeek("trees", [
    ["Invert Binary Tree", "Maximum Depth of Binary Tree", "Diameter of Binary Tree"],
    ["Balanced Binary Tree", "Same Tree", "Subtree of Another Tree"],
    ["Lowest Common Ancestor of a Binary Search Tree", "Binary Tree Level Order Traversal"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w08-keyword-search", "Why keyword search still matters: BM25, exact terms, ids and SKUs", {
      detail:
        "Find five questions in your set where vector search fails because of an exact term (an error code, a SKU, a policy number). Learn the basic idea of BM25 and analyzers.",
      weight: 1,
      resources: [R.elasticSearch, R.elasticTextAnalysis],
    }),
    ai("w08-elastic-index", "Index the chunks in Elasticsearch from .NET", {
      detail:
        "Run Elasticsearch in Docker Compose, create an index with a sensible analyzer, and index the same chunks with the same ids as in pgvector. Keep both in sync from the ingestion job.",
      weight: 1.5,
      resources: [R.elasticDotnet, R.dockerCompose],
      projectId: "docs-qa",
    }),
    ai("w08-hybrid-rrf", "Merge keyword and vector results with reciprocal rank fusion", {
      detail:
        "Get top 20 from each source and merge them with RRF in your own code (it is a few lines). Then try Elasticsearch's built-in hybrid search and compare.",
      weight: 1.75,
      resources: [R.elasticRrf, R.elasticHybrid],
      projectId: "docs-qa",
    }),
    ai("w08-hybrid-eval", "Measure: vector only vs keyword only vs hybrid", {
      detail:
        "Run your eval for all three and add 10 new questions that use exact terms. Keep the table in the README. If hybrid does not win, find out why before moving on.",
      weight: 1.25,
      resources: [R.hamelEvals],
      projectId: "docs-qa",
    }),
    ai("w08-query-rewrite", "Query rewriting: turn chatty questions into good search queries", {
      detail:
        "Use a small model to rewrite the user's question into one or two search queries before retrieval. Measure whether recall improves and what it adds to latency and cost.",
      weight: 1.25,
      resources: [R.claudePromptEngineering],
      projectId: "docs-qa",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w08-mcp-in-agent", "Give your coding agent tools through MCP", {
      detail:
        "Connect an MCP server to your coding agent (for example one for your database or for the docs of a library you use). Use it for one real task and decide whether it was worth it.",
      weight: 1,
      resources: [R.claudeCodeMcp],
      projectId: "docs-qa",
    }),
    assisted("w08-agent-unknown-api", "Working with an agent on an API you do not know yet", {
      detail:
        "Elasticsearch's .NET client changes between versions. Make the agent read the current docs or source before writing code, and check one generated call against the docs yourself.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
    }),

    // --- System design (3 h) ---
    design("w08-sd-search-systems", "How search engines work: inverted index, ranking, sharding", {
      detail:
        "Learn the inverted index, how relevance scores are computed, and how a search cluster splits an index into shards and replicas.",
      weight: 1,
      resources: [R.elasticSearch, R.systemDesignPrimer],
    }),
    design("w08-sd-typeahead", "Classic: design search autocomplete (typeahead)", {
      detail:
        "Requirements, latency target, a trie or prefix index, ranking by popularity, caching and updating suggestions. Keep it to 45 minutes.",
      weight: 1.25,
      resources: [R.systemDesign101, R.systemDesignPrimer],
    }),
    design("w08-sd-two-stores", "Keeping two stores in sync: pgvector and Elasticsearch", {
      detail:
        "What happens when one write succeeds and the other fails? Compare dual writes, an outbox with a worker, and rebuilding from the source documents.",
      weight: 0.75,
      resources: [R.transactionalOutbox],
      projectId: "docs-qa",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w08-pg-indexes", "PostgreSQL indexes: B-tree, GIN, and when an index is not used", {
      detail:
        "Read the indexes chapter and the first chapters of Use The Index, Luke. Create an index on orders and show with EXPLAIN when it is used and when it is not.",
      weight: 0.75,
      resources: [R.pgIndexes, R.useTheIndexLuke],
    }),
    fundamentals("w08-pg-explain", "Read query plans with EXPLAIN ANALYZE", {
      detail:
        "Take your three slowest queries in Project 1 or 2, read their plans and fix one of them.",
      weight: 0.75,
      resources: [R.pgExplain, R.efCorePerformance],
    }),
  ],
});
