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
} satisfies Record<string, Resource>;
