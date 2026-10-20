import { ai, assisted, defineWeek, design, fundamentals, mockWeek } from "../helpers";
import { R } from "../resources";

export const week12 = defineWeek({
  number: 12,
  phaseId: "mcp-agents",
  title: "MCP over HTTP with authorization",
  summary:
    "Move the OMS MCP server from stdio to the HTTP transport, protect it with OAuth-based authorization, and make sure each call runs with the calling user's permissions. DSA this week is a timed mock interview.",
  projectId: "oms-mcp-server",
  dsa: mockWeek(["linked-list", "trees", "tries", "heap", "sliding-window", "binary-search"]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w12-mcp-transports", "MCP transports: stdio vs Streamable HTTP", {
      detail:
        "Read the transports section of the latest spec. Write down when each fits: local tools on a developer's machine versus a shared server for a team.",
      weight: 1,
      resources: [R.mcpTransports],
    }),
    ai("w12-mcp-http-server", "Host the OMS MCP server in ASP.NET Core over HTTP", {
      detail:
        "Switch to the HTTP transport inside an ASP.NET Core app, add health checks and logging, and run it in Docker Compose next to the OMS API.",
      weight: 1.5,
      resources: [R.mcpCsharpSdk, R.aspnetHealthChecks],
      projectId: "oms-mcp-server",
    }),
    ai("w12-mcp-authorization", "Protect the server with MCP authorization", {
      detail:
        "Follow the authorization section of the current spec: the server checks access tokens from an authorization server you trust. Use a local identity provider in development. Reject tokens meant for other services.",
      weight: 2,
      resources: [R.mcpAuthorization, R.aspnetAuthentication],
      projectId: "oms-mcp-server",
    }),
    ai("w12-mcp-user-permissions", "Run every tool call with the user's own permissions", {
      detail:
        "Map the token to a user and pass that user to the application services, so a warehouse user cannot read finance data through the model. Write tests for two users with different rights.",
      weight: 1.25,
      resources: [R.aspnetAuthorization, R.mcpSecurity],
      projectId: "oms-mcp-server",
    }),
    ai("w12-mcp-security-review", "Read the MCP security best practices and check your server", {
      detail:
        "Go through each risk in the security guide (token passthrough, confused deputy, session hijacking and others) and write how your server handles it or why it does not apply.",
      weight: 1,
      resources: [R.mcpSecurity, R.owaspGenAi],
      projectId: "oms-mcp-server",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w12-agent-security-code", "Security code with an agent: review twice", {
      detail:
        "Let the agent write the token validation, then review it line by line against the spec and the ASP.NET Core docs. Add a test for every check (issuer, audience, expiry, signature).",
      weight: 1,
      resources: [R.claudeCodeSecurity, R.claudeCodeBestPractices],
      projectId: "oms-mcp-server",
    }),
    assisted("w12-agent-permissions", "Tighten your coding agent's own permissions", {
      detail:
        "Review what your agent is allowed to run and edit. Deny reading secrets files and running destructive commands; allow the safe commands you use every day.",
      weight: 0.5,
      resources: [R.claudeCodeSettings, R.claudeCodeIam],
    }),

    // --- System design (3 h) ---
    design("w12-sd-mock-classic", "Mock system design interview: design a news feed", {
      detail:
        "45 minutes, timed, out loud: fan-out on write versus read, ranking, caching and storage. Record it and list what you skipped.",
      weight: 1.5,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),
    design("w12-sd-mock-ai", "Mock AI system design: a customer-support assistant over company docs", {
      detail:
        "45 minutes: requirements, RAG pipeline, tools for order lookup, evals, cost and failure handling. Use what you built in Projects 1 and 2 as evidence.",
      weight: 1.5,
      resources: [R.azureRagGuide, R.genAiGateway],
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w12-dotnet-async", "Concurrency in .NET: async/await, the thread pool, and blocking", {
      detail:
        "Learn what really happens at an await, why .Result and .Wait() can starve the thread pool, and how to spot it. Fix any sync-over-async in your projects.",
      weight: 0.75,
      resources: [R.dotnetAsync, R.dotnetThreadingBestPractices],
    }),
    fundamentals("w12-dotnet-channels", "Producer and consumer in .NET with channels", {
      detail:
        "Build a small bounded channel with one producer and two consumers. See what happens when the channel is full. You will use this pattern for agent jobs.",
      weight: 0.75,
      resources: [R.dotnetChannels],
    }),
  ],
});
