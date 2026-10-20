import type { Resource } from "./types";

/**
 * Central registry of reusable resources. Reference them from tasks, topics and projects as `R.someKey`
 * so a broken link is fixed in exactly one place. One-off resources can be written inline instead.
 *
 * Rules (see CLAUDE.md):
 * - Official docs and well-known sources first.
 * - Never invent a URL. If you are not sure a link exists, omit `url` - the UI then shows "verify link".
 * - Fast-moving tech (MCP, Agent Framework, AI SDK, coding agents): link to the docs hub, never to version-specific pages.
 * - `npm run check:links` re-verifies every URL in src/data.
 */
export const R = {
  // --- Claude / Anthropic ---------------------------------------------------
  claudeApiDocs: { title: "Claude API documentation", url: "https://platform.claude.com/docs/en/intro", kind: "docs" },
  claudeModels: { title: "Claude models overview", url: "https://platform.claude.com/docs/en/models/overview", kind: "docs" },
  claudeContextWindows: {
    title: "Context windows (Claude docs)",
    url: "https://platform.claude.com/docs/en/build-with-claude/context-windows",
    kind: "docs",
  },
  claudePromptEngineering: {
    title: "Prompt engineering overview (Claude docs)",
    url: "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview",
    kind: "docs",
  },
  claudeStructuredOutputs: {
    title: "Structured outputs (Claude docs)",
    url: "https://platform.claude.com/docs/en/build-with-claude/structured-outputs",
    kind: "docs",
  },
  claudeTokenCounting: {
    title: "Token counting (Claude docs)",
    url: "https://platform.claude.com/docs/en/build-with-claude/token-counting",
    kind: "docs",
  },
  claudePricing: { title: "Pricing (Claude docs)", url: "https://platform.claude.com/docs/en/about-claude/pricing", kind: "docs" },
  claudeApiCourse: {
    title: "Building with the Claude API (Anthropic Academy course)",
    url: "https://anthropic.skilljar.com/claude-with-the-anthropic-api",
    kind: "course",
  },
  anthropicPythonSdk: {
    title: "Anthropic Python SDK (official repo)",
    url: "https://github.com/anthropics/anthropic-sdk-python",
    kind: "repo",
  },

  // --- Claude Code (coding agent) ---------------------------------------------
  claudeCodeMemory: { title: "Claude Code: how Claude remembers your project (CLAUDE.md)", url: "https://code.claude.com/docs/en/memory", kind: "docs" },
  claudeCodeBestPractices: { title: "Claude Code: best practices", url: "https://code.claude.com/docs/en/best-practices", kind: "docs" },
  claudeCodeCommonWorkflows: { title: "Claude Code: common workflows", url: "https://code.claude.com/docs/en/common-workflows", kind: "docs" },
  claudeCodePermissionModes: { title: "Claude Code: choose a permission mode", url: "https://code.claude.com/docs/en/permission-modes", kind: "docs" },

  // --- .NET / ASP.NET Core ------------------------------------------------------
  msExtAiOverview: {
    title: "Microsoft.Extensions.AI libraries (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/dotnet/ai/microsoft-extensions-ai",
    kind: "docs",
  },
  msExtAiChatClient: {
    title: "Use the IChatClient interface (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/dotnet/ai/ichatclient",
    kind: "docs",
  },
  msBuildChatApp: {
    title: "Quickstart: build an AI chat app with .NET (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/dotnet/ai/quickstarts/build-chat-app",
    kind: "docs",
  },
  msStructuredOutputQuickstart: {
    title: "Quickstart: request a response with structured output (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/dotnet/ai/quickstarts/structured-output",
    kind: "docs",
  },
  msEShopSupport: {
    title: "eShopSupport: reference .NET app using AI for support tickets",
    url: "https://github.com/dotnet/eShopSupport",
    kind: "repo",
  },
  aspnetApisOverview: {
    title: "ASP.NET Core APIs overview (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/apis",
    kind: "docs",
  },
  aspnetMiddleware: {
    title: "ASP.NET Core middleware (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/",
    kind: "docs",
  },
  aspnetOpenApi: {
    title: "OpenAPI support in ASP.NET Core (Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview",
    kind: "docs",
  },
  dotnetDiGuidelines: {
    title: "Dependency injection guidelines (.NET, Microsoft Learn)",
    url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines",
    kind: "docs",
  },
  efCoreGettingStarted: { title: "Getting started with EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/ef/core/get-started/overview/first-app", kind: "docs" },
  bogus: { title: "Bogus: fake data generator for .NET", url: "https://github.com/bchavez/Bogus", kind: "repo" },
  xunit: { title: "xUnit.net", url: "https://xunit.net/", kind: "docs" },

  // --- Next.js / AI SDK -----------------------------------------------------------
  nextAppRouter: { title: "Next.js docs: App Router", url: "https://nextjs.org/docs/app", kind: "docs" },
  nextServerClient: {
    title: "Next.js docs: Server and Client Components",
    url: "https://nextjs.org/docs/app/getting-started/server-and-client-components",
    kind: "docs",
  },
  aiSdkDocs: { title: "AI SDK documentation", url: "https://ai-sdk.dev/docs/introduction", kind: "docs" },

  // --- System design --------------------------------------------------------------
  systemDesignPrimer: { title: "The System Design Primer", url: "https://github.com/donnemartin/system-design-primer", kind: "repo" },
  latencyNumbers: { title: "Latency numbers every programmer should know", url: "https://gist.github.com/jboner/2841832", kind: "article" },
  ddia: { title: "Designing Data-Intensive Applications (Martin Kleppmann)", url: "https://dataintensive.net/", kind: "book" },
  msApiGuidelines: { title: "Microsoft REST API Guidelines", url: "https://github.com/microsoft/api-guidelines", kind: "repo" },
  rfc9457: { title: "RFC 9457: Problem Details for HTTP APIs", url: "https://www.rfc-editor.org/rfc/rfc9457.html", kind: "docs" },
  stripeIdempotency: { title: "Idempotent requests (Stripe API reference)", url: "https://docs.stripe.com/api/idempotent_requests", kind: "docs" },

  // --- LLM background / security --------------------------------------------------------
  karpathyIntroLlms: {
    title: "Intro to Large Language Models (Andrej Karpathy)",
    url: "https://www.youtube.com/watch?v=zjkBMFhNj_g",
    kind: "video",
  },
  owaspLlmTop10: { title: "OWASP Top 10 for LLM applications", url: "https://genai.owasp.org/llm-top-10/", kind: "docs" },

  // --- Python ------------------------------------------------------------------------------
  pythonTutorial: { title: "The Python Tutorial", url: "https://docs.python.org/3/tutorial/", kind: "docs" },
  pythonVenv: { title: "Python: virtual environments and packages", url: "https://docs.python.org/3/tutorial/venv.html", kind: "docs" },
  pytest: { title: "pytest: get started", url: "https://docs.pytest.org/en/stable/getting-started.html", kind: "docs" },

  // --- DSA ---------------------------------------------------------------------------------
  neetcodeRoadmap: { title: "NeetCode 150 roadmap", url: "https://neetcode.io/roadmap", kind: "tool" },
  leetcodeProblemset: { title: "LeetCode problem set", url: "https://leetcode.com/problemset/", kind: "tool" },

  // ===== Weeks 3-24 =========================================================================

  // --- Claude API ----------------------------------------------------------------------------
  claudeStreaming: { title: "Streaming messages (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/streaming", kind: "docs" },
  claudeToolUse: { title: "Tool use with Claude (Claude docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview", kind: "docs" },
  claudeDefineTools: { title: "Define tools (Claude docs)", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools", kind: "docs" },
  claudePromptCaching: { title: "Prompt caching (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", kind: "docs" },
  claudeRateLimits: { title: "Rate limits (Claude docs)", url: "https://platform.claude.com/docs/en/api/rate-limits", kind: "docs" },
  claudeErrors: { title: "API errors (Claude docs)", url: "https://platform.claude.com/docs/en/api/errors", kind: "docs" },
  claudeEmbeddings: { title: "Embeddings (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/embeddings", kind: "docs" },
  claudeCitations: { title: "Citations (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/citations", kind: "docs" },
  claudeBatch: { title: "Batch processing (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/batch-processing", kind: "docs" },
  claudeExtendedThinking: { title: "Extended thinking (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/extended-thinking", kind: "docs" },
  claudeContextEditing: { title: "Context editing (Claude docs)", url: "https://platform.claude.com/docs/en/build-with-claude/context-editing", kind: "docs" },
  claudeChoosingModel: { title: "Choosing a model (Claude docs)", url: "https://platform.claude.com/docs/en/about-claude/models/choosing-a-model", kind: "docs" },
  claudeReduceLatency: { title: "Reduce latency (Claude docs)", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-latency", kind: "docs" },
  claudeDevelopTests: { title: "Define success criteria and build evaluations (Claude docs)", url: "https://platform.claude.com/docs/en/test-and-evaluate/develop-tests", kind: "docs" },
  claudeReduceHallucinations: { title: "Reduce hallucinations (Claude docs)", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations", kind: "docs" },
  claudeMitigateJailbreaks: { title: "Mitigate jailbreaks and prompt injections (Claude docs)", url: "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks", kind: "docs" },
  claudeAgentSdk: { title: "Claude Agent SDK overview", url: "https://code.claude.com/docs/en/agent-sdk/overview", kind: "docs" },
  anthropicAcademy: { title: "Anthropic Academy courses (incl. certification prep)", url: "https://anthropic.skilljar.com/", kind: "course" },
  anthropicMcpCourse: { title: "Introduction to Model Context Protocol (Anthropic Academy)", url: "https://anthropic.skilljar.com/introduction-to-model-context-protocol", kind: "course" },
  claudeCodeInAction: { title: "Claude Code in Action (Anthropic Academy)", url: "https://anthropic.skilljar.com/claude-code-in-action", kind: "course" },

  // --- Anthropic engineering articles ---------------------------------------------------------
  buildingEffectiveAgents: { title: "Building effective agents (Anthropic)", url: "https://www.anthropic.com/research/building-effective-agents", kind: "article" },
  contextualRetrieval: { title: "Contextual retrieval (Anthropic)", url: "https://www.anthropic.com/research/contextual-retrieval", kind: "article" },
  writingToolsForAgents: { title: "Writing effective tools for agents (Anthropic)", url: "https://www.anthropic.com/research/writing-tools-for-agents", kind: "article" },
  contextEngineering: { title: "Effective context engineering for AI agents (Anthropic)", url: "https://www.anthropic.com/research/effective-context-engineering-for-ai-agents", kind: "article" },
  multiAgentResearch: { title: "How we built our multi-agent research system (Anthropic)", url: "https://www.anthropic.com/research/multi-agent-research-system", kind: "article" },

  // --- Claude Code (more) --------------------------------------------------------------------
  claudeCodeHooks: { title: "Claude Code: hooks guide", url: "https://code.claude.com/docs/en/hooks-guide", kind: "docs" },
  claudeCodeSkills: { title: "Claude Code: skills", url: "https://code.claude.com/docs/en/skills", kind: "docs" },
  claudeCodeSubagents: { title: "Claude Code: subagents", url: "https://code.claude.com/docs/en/sub-agents", kind: "docs" },
  claudeCodeMcp: { title: "Claude Code: connect tools with MCP", url: "https://code.claude.com/docs/en/mcp", kind: "docs" },
  claudeCodeGithubActions: { title: "Claude Code: GitHub Actions", url: "https://code.claude.com/docs/en/github-actions", kind: "docs" },
  claudeCodeSettings: { title: "Claude Code: settings", url: "https://code.claude.com/docs/en/settings", kind: "docs" },
  claudeCodeSlashCommands: { title: "Claude Code: slash commands", url: "https://code.claude.com/docs/en/slash-commands", kind: "docs" },
  claudeCodeHeadless: { title: "Claude Code: run it programmatically (headless)", url: "https://code.claude.com/docs/en/headless", kind: "docs" },
  claudeCodeCosts: { title: "Claude Code: manage costs", url: "https://code.claude.com/docs/en/costs", kind: "docs" },
  claudeCodeSecurity: { title: "Claude Code: security", url: "https://code.claude.com/docs/en/security", kind: "docs" },
  claudeCodePlugins: { title: "Claude Code: plugins", url: "https://code.claude.com/docs/en/plugins", kind: "docs" },
  claudeCodeIam: { title: "Claude Code: identity and access management", url: "https://code.claude.com/docs/en/iam", kind: "docs" },
  claudeCodeMonitoring: { title: "Claude Code: monitoring usage", url: "https://code.claude.com/docs/en/monitoring-usage", kind: "docs" },
  claudeCodeChangelog: { title: "Claude Code changelog", url: "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md", kind: "docs" },

  // --- MCP (link to "latest", never to a dated revision) -------------------------------------
  mcpSpec: { title: "MCP specification (latest)", url: "https://modelcontextprotocol.io/specification/latest", kind: "docs" },
  mcpArchitecture: { title: "MCP architecture overview", url: "https://modelcontextprotocol.io/docs/learn/architecture", kind: "docs" },
  mcpTools: { title: "MCP spec: tools", url: "https://modelcontextprotocol.io/specification/latest/server/tools", kind: "docs" },
  mcpResources: { title: "MCP spec: resources", url: "https://modelcontextprotocol.io/specification/latest/server/resources", kind: "docs" },
  mcpTransports: { title: "MCP spec: transports", url: "https://modelcontextprotocol.io/specification/latest/basic/transports", kind: "docs" },
  mcpAuthorization: { title: "MCP spec: authorization", url: "https://modelcontextprotocol.io/specification/latest/basic/authorization", kind: "docs" },
  mcpElicitation: { title: "MCP spec: elicitation", url: "https://modelcontextprotocol.io/specification/latest/client/elicitation", kind: "docs" },
  mcpSecurity: { title: "MCP security best practices", url: "https://modelcontextprotocol.io/specification/latest/basic/security_best_practices", kind: "docs" },
  mcpCsharpSdk: { title: "MCP C# SDK (official repo)", url: "https://github.com/modelcontextprotocol/csharp-sdk", kind: "repo" },
  mcpInspector: { title: "MCP Inspector", url: "https://github.com/modelcontextprotocol/inspector", kind: "tool" },
  msMcpQuickstart: { title: "Quickstart: create a minimal MCP server with .NET (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/ai/quickstarts/build-mcp-server", kind: "docs" },

  // --- .NET AI and agents --------------------------------------------------------------------
  msFunctionCalling: { title: "Quickstart: function calling with .NET (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/ai/quickstarts/use-function-calling", kind: "docs" },
  msEmbeddings: { title: "Embeddings in .NET AI apps (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/ai/conceptual/embeddings", kind: "docs" },
  msVectorStores: { title: "Vector databases for .NET AI apps (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/ai/vector-stores/overview", kind: "docs" },
  msAiEvaluation: { title: "Microsoft.Extensions.AI.Evaluation libraries (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/ai/evaluation/libraries", kind: "docs" },
  msAgentFramework: { title: "Microsoft Agent Framework overview (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/agent-framework/overview/", kind: "docs" },
  msAgentFrameworkRepo: { title: "Microsoft Agent Framework (official repo)", url: "https://github.com/microsoft/agent-framework", kind: "repo" },

  // --- .NET / ASP.NET Core (more) ------------------------------------------------------------
  aspnetResponses: { title: "Create responses in minimal APIs (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses", kind: "docs" },
  dotnetCancellation: { title: "Cancellation in managed threads (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/cancellation-in-managed-threads", kind: "docs" },
  dotnetHttpResilience: { title: "Build resilient HTTP apps (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience", kind: "docs" },
  polly: { title: "Polly: the .NET resilience library", url: "https://www.pollydocs.org/", kind: "docs" },
  aspnetRateLimit: { title: "Rate limiting middleware in ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit", kind: "docs" },
  aspnetHybridCache: { title: "HybridCache in ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/performance/caching/hybrid", kind: "docs" },
  aspnetHealthChecks: { title: "Health checks in ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks", kind: "docs" },
  aspnetHttpClientFactory: { title: "HTTP requests with IHttpClientFactory (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-requests", kind: "docs" },
  aspnetLogging: { title: "Logging in .NET and ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/", kind: "docs" },
  aspnetIntegrationTests: { title: "Integration tests in ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests", kind: "docs" },
  aspnetAuthentication: { title: "ASP.NET Core authentication overview (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/security/authentication/", kind: "docs" },
  aspnetAuthorization: { title: "ASP.NET Core authorization (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction", kind: "docs" },
  aspnetAppSecrets: { title: "Safe storage of app secrets in development (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets", kind: "docs" },
  dotnetWorkers: { title: "Worker services and BackgroundService (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/workers", kind: "docs" },
  dotnetChannels: { title: "System.Threading.Channels (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/channels", kind: "docs" },
  dotnetAsync: { title: "Asynchronous programming in C# (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/", kind: "docs" },
  dotnetThreadingBestPractices: { title: "Managed threading best practices (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices", kind: "docs" },
  dotnetGc: { title: "Fundamentals of garbage collection (.NET, Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals", kind: "docs" },
  dotnetContainer: { title: "Containerize a .NET app (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/dotnet/core/docker/build-container", kind: "docs" },
  efCorePerformance: { title: "EF Core performance (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/ef/core/performance/", kind: "docs" },
  efCoreConcurrency: { title: "Handling concurrency conflicts in EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/ef/core/saving/concurrency", kind: "docs" },
  testcontainers: { title: "Testcontainers for .NET", url: "https://dotnet.testcontainers.org/", kind: "docs" },

  // --- Next.js / AI SDK / web platform -------------------------------------------------------
  aiSdkChatbot: { title: "AI SDK UI: chatbot", url: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot", kind: "docs" },
  aiSdkStreamProtocol: { title: "AI SDK UI: stream protocols", url: "https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol", kind: "docs" },
  aiSdkToolUsage: { title: "AI SDK UI: chatbot tool usage", url: "https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage", kind: "docs" },
  nextRouteHandlers: { title: "Next.js docs: route.js (route handlers)", url: "https://nextjs.org/docs/app/api-reference/file-conventions/route", kind: "docs" },
  mdnSse: { title: "Using server-sent events (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events", kind: "docs" },
  mdnAbortController: { title: "AbortController (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController", kind: "docs" },
  mdnHttpCaching: { title: "HTTP caching (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching", kind: "docs" },
  mdnHttpOverview: { title: "An overview of HTTP (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview", kind: "docs" },
  mdnCors: { title: "Cross-Origin Resource Sharing (MDN)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS", kind: "docs" },
  hpbn: { title: "High Performance Browser Networking (Ilya Grigorik)", url: "https://hpbn.co/", kind: "book" },

  // --- RAG and search ------------------------------------------------------------------------
  pgvector: { title: "pgvector: vector similarity search for Postgres", url: "https://github.com/pgvector/pgvector", kind: "repo" },
  pgvectorDotnet: { title: "pgvector support for .NET", url: "https://github.com/pgvector/pgvector-dotnet", kind: "repo" },
  elasticSearch: { title: "Search with Elasticsearch (Elastic docs)", url: "https://www.elastic.co/docs/solutions/search", kind: "docs" },
  elasticHybrid: { title: "Hybrid search (Elastic docs)", url: "https://www.elastic.co/docs/solutions/search/hybrid-search", kind: "docs" },
  elasticRrf: { title: "Reciprocal rank fusion (Elasticsearch reference)", url: "https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion", kind: "docs" },
  elasticTextAnalysis: { title: "Text analysis (Elastic docs)", url: "https://www.elastic.co/docs/manage-data/data-store/text-analysis", kind: "docs" },
  elasticDotnet: { title: "Elasticsearch .NET client (official repo)", url: "https://github.com/elastic/elasticsearch-net", kind: "repo" },
  pineconeChunking: { title: "Chunking strategies for LLM applications (Pinecone)", url: "https://www.pinecone.io/learn/chunking-strategies/", kind: "article" },
  azureRagGuide: { title: "Design and develop a RAG solution (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide", kind: "docs" },
  azureRagChunking: { title: "RAG chunking phase (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-chunking-phase", kind: "docs" },
  hnswPaper: { title: "HNSW paper: approximate nearest neighbour search (arXiv)", url: "https://arxiv.org/abs/1603.09320", kind: "article" },
  ragPaper: { title: "Retrieval-Augmented Generation paper (arXiv)", url: "https://arxiv.org/abs/2005.11401", kind: "article" },
  lostInTheMiddle: { title: "Lost in the Middle: how LLMs use long contexts (arXiv)", url: "https://arxiv.org/abs/2307.03172", kind: "article" },
  mtebLeaderboard: { title: "MTEB embedding leaderboard (Hugging Face)", url: "https://huggingface.co/spaces/mteb/leaderboard", kind: "tool" },
  ragas: { title: "Ragas: RAG evaluation docs", url: "https://docs.ragas.io/en/stable/", kind: "docs" },

  // --- LLM internals ---------------------------------------------------------------------------
  attentionPaper: { title: "Attention Is All You Need (arXiv)", url: "https://arxiv.org/abs/1706.03762", kind: "article" },
  illustratedTransformer: { title: "The Illustrated Transformer (Jay Alammar)", url: "https://jalammar.github.io/illustrated-transformer/", kind: "article" },
  karpathyTokenizer: { title: "Let's build the GPT tokenizer (Andrej Karpathy)", url: "https://www.youtube.com/watch?v=zduSFxRajkE", kind: "video" },
  hfLlmCourse: { title: "Hugging Face LLM course", url: "https://huggingface.co/learn/llm-course/chapter1/1", kind: "course" },
  tiktoken: { title: "tiktoken: a fast BPE tokenizer", url: "https://github.com/openai/tiktoken", kind: "repo" },

  // --- Evals and observability -----------------------------------------------------------------
  hamelEvals: { title: "Your AI product needs evals (Hamel Husain)", url: "https://hamel.dev/blog/posts/evals/", kind: "article" },
  eugeneYanPatterns: { title: "Patterns for building LLM-based systems (Eugene Yan)", url: "https://eugeneyan.com/writing/llm-patterns/", kind: "article" },
  promptfoo: { title: "promptfoo: test and red-team LLM apps", url: "https://www.promptfoo.dev/docs/intro/", kind: "tool" },
  langfuse: { title: "Langfuse docs (LLM tracing and evals)", url: "https://langfuse.com/docs", kind: "docs" },
  chipHuyenAiEngineering: { title: "AI Engineering (Chip Huyen, O'Reilly)", url: "https://www.oreilly.com/library/view/ai-engineering/9781098166298/", kind: "book" },
  otelConcepts: { title: "OpenTelemetry concepts", url: "https://opentelemetry.io/docs/concepts/", kind: "docs" },
  otelDotnet: { title: "OpenTelemetry for .NET", url: "https://opentelemetry.io/docs/languages/dotnet/", kind: "docs" },
  otelGenAi: { title: "OpenTelemetry semantic conventions for generative AI", url: "https://github.com/open-telemetry/semantic-conventions/blob/main/docs/gen-ai/README.md", kind: "docs" },
  sreBook: { title: "Site Reliability Engineering (Google)", url: "https://sre.google/sre-book/table-of-contents/", kind: "book" },
  sreSlos: { title: "Service level objectives (Google SRE book)", url: "https://sre.google/sre-book/service-level-objectives/", kind: "book" },
  sreMonitoring: { title: "Monitoring distributed systems (Google SRE book)", url: "https://sre.google/sre-book/monitoring-distributed-systems/", kind: "book" },
  k6: { title: "Grafana k6 load testing docs", url: "https://grafana.com/docs/k6/latest/", kind: "docs" },
  chaosPrinciples: { title: "Principles of chaos engineering", url: "https://principlesofchaos.org/", kind: "article" },

  // --- Security ------------------------------------------------------------------------------
  owaspGenAi: { title: "OWASP GenAI Security Project", url: "https://genai.owasp.org/", kind: "docs" },
  owaspApiTop10: { title: "OWASP API Security Top 10", url: "https://api-security.owasp.org/", kind: "docs" },
  owaspCheatSheets: { title: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/", kind: "docs" },
  owaspThreatModeling: { title: "Threat modeling (OWASP)", url: "https://community.owasp.org/Threat_Modeling", kind: "docs" },
  msThreatModelingStride: { title: "STRIDE threat categories (Microsoft Threat Modeling Tool)", url: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats", kind: "docs" },
  nistAiRmf: { title: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework", kind: "docs" },
  willisonPromptInjection: { title: "Prompt injection series (Simon Willison)", url: "https://simonwillison.net/series/prompt-injection/", kind: "article" },
  oauth2: { title: "OAuth 2.0 (oauth.net)", url: "https://oauth.net/2/", kind: "docs" },
  oauthSimplified: { title: "OAuth 2.0 Simplified (Aaron Parecki)", url: "https://www.oauth.com/", kind: "book" },
  jwtIntro: { title: "Introduction to JSON Web Tokens (jwt.io)", url: "https://www.jwt.io/introduction", kind: "article" },

  // --- System design (more) --------------------------------------------------------------------
  systemDesign101: { title: "System Design 101 (ByteByteGo)", url: "https://github.com/ByteByteGoHq/system-design-101", kind: "repo" },
  azureArchitecture: { title: "Azure Architecture Center", url: "https://learn.microsoft.com/en-us/azure/architecture/", kind: "docs" },
  azureWellArchitected: { title: "Azure Well-Architected Framework", url: "https://learn.microsoft.com/en-us/azure/well-architected/", kind: "docs" },
  patternRetry: { title: "Retry pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/retry", kind: "docs" },
  patternCircuitBreaker: { title: "Circuit Breaker pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker", kind: "docs" },
  patternBulkhead: { title: "Bulkhead pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead", kind: "docs" },
  patternCacheAside: { title: "Cache-Aside pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside", kind: "docs" },
  patternSaga: { title: "Saga pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/saga", kind: "docs" },
  patternCompetingConsumers: { title: "Competing Consumers pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers", kind: "docs" },
  patternQueueLoadLeveling: { title: "Queue-Based Load Leveling pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling", kind: "docs" },
  patternSharding: { title: "Sharding pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding", kind: "docs" },
  patternRateLimiting: { title: "Rate Limiting pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern", kind: "docs" },
  patternGatewayRouting: { title: "Gateway Routing pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-routing", kind: "docs" },
  patternEventSourcing: { title: "Event Sourcing pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing", kind: "docs" },
  patternCqrs: { title: "CQRS pattern (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs", kind: "docs" },
  genAiGateway: { title: "Access language models through a gateway (Azure Architecture Center)", url: "https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/generative-ai-gateway", kind: "docs" },
  transactionalOutbox: { title: "Pattern: transactional outbox (microservices.io)", url: "https://microservices.io/patterns/data/transactional-outbox.html", kind: "article" },
  idempotentConsumer: { title: "Pattern: idempotent consumer (microservices.io)", url: "https://microservices.io/patterns/communication-style/idempotent-consumer.html", kind: "article" },
  jepsenConsistency: { title: "Consistency models (Jepsen)", url: "https://jepsen.io/consistency", kind: "article" },
  awsRetriesJitter: { title: "Timeouts, retries and backoff with jitter (AWS Builders' Library)", url: "https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter", kind: "article" },
  eipMessaging: { title: "Messaging patterns (Enterprise Integration Patterns)", url: "https://www.enterpriseintegrationpatterns.com/patterns/messaging/", kind: "book" },
  serviceBusDlq: { title: "Dead-letter queues (Azure Service Bus docs)", url: "https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues", kind: "docs" },
  durableFunctions: { title: "Durable Functions overview (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview", kind: "docs" },
  temporal: { title: "Temporal documentation (durable execution)", url: "https://docs.temporal.io/", kind: "docs" },
  featureToggles: { title: "Feature toggles (Martin Fowler)", url: "https://martinfowler.com/articles/feature-toggles.html", kind: "article" },
  canaryRelease: { title: "Canary release (Martin Fowler)", url: "https://martinfowler.com/bliki/CanaryRelease.html", kind: "article" },
  blueGreen: { title: "Blue-green deployment (Martin Fowler)", url: "https://martinfowler.com/bliki/BlueGreenDeployment.html", kind: "article" },

  // --- Data stores and messaging -------------------------------------------------------------
  pgIndexes: { title: "PostgreSQL docs: indexes", url: "https://www.postgresql.org/docs/current/indexes.html", kind: "docs" },
  pgExplain: { title: "PostgreSQL docs: using EXPLAIN", url: "https://www.postgresql.org/docs/current/using-explain.html", kind: "docs" },
  pgMvcc: { title: "PostgreSQL docs: concurrency control (MVCC)", url: "https://www.postgresql.org/docs/current/mvcc.html", kind: "docs" },
  pgIsolation: { title: "PostgreSQL docs: transaction isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", kind: "docs" },
  useTheIndexLuke: { title: "Use The Index, Luke (SQL indexing for developers)", url: "https://use-the-index-luke.com/", kind: "book" },
  redisDocs: { title: "Redis docs", url: "https://redis.io/docs/latest/", kind: "docs" },
  rabbitmqTutorials: { title: "RabbitMQ tutorials", url: "https://www.rabbitmq.com/tutorials", kind: "course" },
  kafkaIntro: { title: "Apache Kafka introduction", url: "https://kafka.apache.org/intro", kind: "docs" },

  // --- Cloud, containers, CI/CD ----------------------------------------------------------------
  dockerGetStarted: { title: "Docker: get started", url: "https://docs.docker.com/get-started/", kind: "docs" },
  dockerCompose: { title: "Docker Compose docs", url: "https://docs.docker.com/compose/", kind: "docs" },
  githubActions: { title: "GitHub Actions documentation", url: "https://docs.github.com/en/actions", kind: "docs" },
  kubernetesBasics: { title: "Learn Kubernetes basics", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", kind: "course" },
  azureContainerApps: { title: "Azure Container Apps overview (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/azure/container-apps/overview", kind: "docs" },
  bicep: { title: "What is Bicep? (Microsoft Learn)", url: "https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview", kind: "docs" },
  terraform: { title: "What is Terraform (HashiCorp)", url: "https://developer.hashicorp.com/terraform/intro", kind: "docs" },

  // --- Python (more) -------------------------------------------------------------------------
  pythonAsyncio: { title: "Python asyncio", url: "https://docs.python.org/3/library/asyncio.html", kind: "docs" },
  httpx: { title: "HTTPX: HTTP client for Python", url: "https://www.python-httpx.org/", kind: "docs" },
  numpyQuickstart: { title: "NumPy quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", kind: "docs" },
} satisfies Record<string, Resource>;
