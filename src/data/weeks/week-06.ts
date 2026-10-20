import { ai, assisted, defineWeek, design, fundamentals, mockWeek } from "../helpers";
import { R } from "../resources";

export const week06 = defineWeek({
  number: 6,
  phaseId: "rag",
  title: "Embeddings and a first RAG pipeline",
  summary:
    "Start Project 2: understand embeddings and retrieval, ingest a set of synthetic internal docs, and answer questions with a simple retrieve-then-generate pipeline. DSA this week is a timed mock interview.",
  projectId: "docs-qa",
  dsa: mockWeek(["arrays-hashing", "two-pointers", "sliding-window", "stack", "binary-search"]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w06-rag-concepts", "What RAG is and when it beats a long prompt or fine-tuning", {
      detail:
        "Read the original RAG paper's introduction and a practical RAG design guide. Write down when you would use RAG, when you would just put the documents in the prompt, and when neither works.",
      weight: 1,
      resources: [R.azureRagGuide, R.ragPaper],
    }),
    ai("w06-embeddings", "Embeddings: what they are and how to call them from .NET", {
      detail:
        "Generate embeddings for 20 short sentences through the IEmbeddingGenerator abstraction. Find the nearest neighbours of a few queries by cosine similarity and look at where they surprise you.",
      weight: 1.25,
      resources: [R.msEmbeddings, R.claudeEmbeddings],
    }),
    ai("w06-p2-corpus", "Project 2: create a synthetic docs corpus and a question set", {
      detail:
        "Write or generate about 50 internal-style documents (shipping policy, returns, warehouse procedures, API docs for the demo OMS). Never use real company documents. Write 30 questions with the expected answer and the source document for each.",
      weight: 1.5,
      resources: [R.claudeDevelopTests],
      projectId: "docs-qa",
    }),
    ai("w06-p2-ingest", "Ingestion v1: load, split into chunks, embed, store", {
      detail:
        "Build an ingestion job: read the documents, split them into fixed-size chunks with overlap, embed each chunk and store text, vector and source metadata. Keep it re-runnable without duplicates.",
      weight: 1.5,
      resources: [R.msVectorStores, R.pineconeChunking],
      projectId: "docs-qa",
    }),
    ai("w06-p2-answer", "Answer v1: retrieve top-k chunks and generate an answer", {
      detail:
        "Embed the question, take the top 5 chunks, put them in the prompt as delimited sources and ask the model to answer only from them. Try your 30 questions and note the failures by type.",
      weight: 1.5,
      resources: [R.claudeReduceHallucinations],
      projectId: "docs-qa",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w06-new-repo-setup", "Set up Project 2's repo for an agent from day one", {
      detail:
        "Reuse what worked in Project 1: CLAUDE.md, the commands or skills you made and the hooks. Write down what you changed and why.",
      weight: 0.75,
      resources: [R.claudeCodeMemory, R.claudeCodeSkills],
      projectId: "docs-qa",
    }),
    assisted("w06-agent-test-data", "Use an agent to generate the synthetic corpus, then review it", {
      detail:
        "Ask the agent to draft the documents and questions. Check that answers really are in the documents and that nothing looks like real company data.",
      weight: 0.75,
      resources: [R.claudeCodeCommonWorkflows],
      projectId: "docs-qa",
    }),

    // --- System design (3 h) ---
    design("w06-sd-mock", "Mock system design interview: design a chat application", {
      detail:
        "45 minutes, timed, out loud: requirements, API, data model, real-time delivery, storage, scaling. Record yourself or ask a colleague, then list what you skipped.",
      weight: 1.5,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),
    design("w06-sd-rag-design", "Design a RAG system: ingestion, retrieval and generation paths", {
      detail:
        "Draw the two pipelines (ingest offline, answer online), the stores, and what can go stale. Write the first version of Project 2's design: requirements, components and failure modes.",
      weight: 1.5,
      resources: [R.azureRagGuide],
      projectId: "docs-qa",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w06-vectors", "Vectors for engineers: dot product, length, cosine similarity", {
      detail:
        "Learn just enough linear algebra: what a vector is, the dot product, normalising, and why cosine similarity ignores length. Compute them by hand for two small vectors, then in NumPy.",
      weight: 0.75,
      resources: [R.numpyQuickstart, R.msEmbeddings],
    }),
    fundamentals("w06-numpy-search", "Brute-force vector search in NumPy", {
      detail:
        "Store 1,000 random vectors, find the top 5 nearest to a query with a single matrix multiply, and time it. This is the baseline every vector index tries to beat.",
      weight: 0.75,
      resources: [R.numpyQuickstart],
    }),
  ],
});
