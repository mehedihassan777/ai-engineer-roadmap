import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week07 = defineWeek({
  number: 7,
  phaseId: "rag",
  title: "pgvector, chunking and a first eval set",
  summary:
    "Move vectors into PostgreSQL with pgvector, compare chunking strategies with numbers instead of opinions, and build the retrieval eval that every later change is measured against.",
  projectId: "docs-qa",
  dsa: patternWeek("linked-list", [
    ["Reverse Linked List", "Merge Two Sorted Lists", "Linked List Cycle", "Reorder List"],
    ["Remove Nth Node From End of List", "Copy List with Random Pointer", "Add Two Numbers", "Find the Duplicate Number"],
    ["LRU Cache", "Merge k Sorted Lists", "Reverse Nodes in k-Group"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w07-pgvector", "Store and query vectors in PostgreSQL with pgvector", {
      detail:
        "Add the pgvector extension, a chunks table with a vector column and source metadata, and query it from .NET. Compare exact search with an HNSW index on your corpus: speed and whether the top 5 change.",
      weight: 1.5,
      resources: [R.pgvector, R.pgvectorDotnet],
      projectId: "docs-qa",
    }),
    ai("w07-retrieval-eval", "Retrieval eval v0: recall@k and MRR on your 30 questions", {
      detail:
        "For each question you know the source document. Write a script that reports recall@5, recall@10 and mean reciprocal rank. Save the results to a file so you can compare runs.",
      weight: 1.5,
      resources: [R.claudeDevelopTests, R.hamelEvals],
      projectId: "docs-qa",
    }),
    ai("w07-chunking-experiments", "Chunking experiments: size, overlap, and splitting by headings", {
      detail:
        "Try three strategies (small fixed chunks, large fixed chunks, split on headings and paragraphs). Run the eval for each and keep the numbers in a table. Pick one with evidence.",
      weight: 1.5,
      resources: [R.azureRagChunking, R.pineconeChunking],
      projectId: "docs-qa",
    }),
    ai("w07-embedding-model-choice", "Compare two embedding models on your eval", {
      detail:
        "Look at the leaderboard, pick two models, re-embed and compare recall, cost and vector size. Note that leaderboard rank does not equal rank on your data.",
      weight: 1,
      resources: [R.mtebLeaderboard, R.msEmbeddings],
      projectId: "docs-qa",
    }),
    ai("w07-metadata-filters", "Metadata filters: restrict search by document type and date", {
      detail:
        "Store document type, owner team and last-updated date with each chunk. Let the API filter on them and check that filtering happens in the query, not after retrieving.",
      weight: 1.25,
      resources: [R.msVectorStores],
      projectId: "docs-qa",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w07-subagents", "Subagents: hand off research and review to a separate context", {
      detail:
        "Create a subagent that reviews diffs for SQL and data-access problems. Use it on the pgvector change and compare its notes with your own review.",
      weight: 1,
      resources: [R.claudeCodeSubagents],
      projectId: "docs-qa",
    }),
    assisted("w07-agent-experiments", "Let the agent run the chunking experiments while you read", {
      detail:
        "Write a clear brief (strategies, eval command, output table) and let the agent run it. Check the numbers by rerunning one experiment yourself.",
      weight: 0.5,
      resources: [R.claudeCodeBestPractices],
      projectId: "docs-qa",
    }),

    // --- System design (3 h) ---
    design("w07-sd-queues", "Message queues and async processing", {
      detail:
        "Why put work on a queue: smoothing load, retries, decoupling. Learn competing consumers, at-least-once delivery and why consumers must be idempotent.",
      weight: 1.25,
      resources: [R.patternQueueLoadLeveling, R.patternCompetingConsumers],
    }),
    design("w07-sd-ingestion-pipeline", "Design the document ingestion pipeline", {
      detail:
        "Documents change. Design re-ingestion: detect changed documents, re-chunk and re-embed only those, delete stale chunks, and keep queries working during a full re-index.",
      weight: 1,
      resources: [R.azureRagGuide],
      projectId: "docs-qa",
    }),
    design("w07-sd-kafka-vs-rabbit", "Log-based vs queue-based messaging: Kafka and RabbitMQ", {
      detail:
        "Compare a log (Kafka) with a broker queue (RabbitMQ): ordering, replay, retention and consumer groups. Pick one for ingestion events and explain why.",
      weight: 0.75,
      resources: [R.kafkaIntro, R.rabbitmqTutorials],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w07-ann-indexes", "How vector indexes work: HNSW and IVF in plain words", {
      detail:
        "Read the pgvector index section and skim the HNSW paper's idea. Explain in your own words why approximate search is fast and what you give up.",
      weight: 0.75,
      resources: [R.pgvector, R.hnswPaper],
    }),
    fundamentals("w07-py-eval-script", "Python: a small eval script with JSON output", {
      detail:
        "Write the recall@k and MRR calculations in Python as well, with pytest tests for the maths. You will reuse this style for RAG and agent evals.",
      weight: 0.75,
      resources: [R.pytest, R.pythonTutorial],
      projectId: "docs-qa",
    }),
  ],
});
