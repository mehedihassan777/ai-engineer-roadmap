import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week03 = defineWeek({
  number: 3,
  phaseId: "llm-foundations",
  title: "Streaming and cancellation end to end",
  summary:
    "Stream answers from the model through ASP.NET Core to the Next.js chat panel, make the Stop button really stop the provider call, and decide how the browser should reach the stream.",
  projectId: "order-assistant",
  dsa: patternWeek("sliding-window", [
    ["Best Time to Buy and Sell Stock", "Longest Substring Without Repeating Characters"],
    ["Longest Repeating Character Replacement", "Permutation in String"],
    ["Minimum Window Substring", "Sliding Window Maximum"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w03-streaming-concepts", "How streaming works: events, deltas, time to first token", {
      detail:
        "Read how your provider streams a response: the event types, text deltas, and the final message with usage. Measure time to first token and total time for a short and a long answer, and write down why streaming changes how fast the app feels but not the cost.",
      weight: 1,
      resources: [R.claudeStreaming, R.mdnSse],
    }),
    ai("w03-dotnet-stream-endpoint", "Streaming chat endpoint in .NET with GetStreamingResponseAsync", {
      detail:
        "Add POST /assistant/chat that calls the streaming method on IChatClient and writes each update to the response as it arrives. Flush after each chunk, send a final event with token usage, and return a clear error event if the model fails mid-stream.",
      weight: 1.75,
      resources: [R.msExtAiChatClient, R.aspnetResponses],
      projectId: "order-assistant",
    }),
    ai("w03-next-chat-panel", "Wire the Next.js chat panel with AI SDK UI", {
      detail:
        "Replace the placeholder panel with a real chat built on the AI SDK UI hooks. Show partial text as it streams, a typing state, and an error state with a retry button.",
      weight: 1.5,
      resources: [R.aiSdkChatbot, R.aiSdkStreamProtocol],
      projectId: "order-assistant",
    }),
    ai("w03-cancellation", "Make Stop really stop: browser abort to provider request", {
      detail:
        "Pass HttpContext.RequestAborted into the chat call so a browser abort cancels the provider request. Prove it: watch the provider's usage or your own logs and confirm tokens stop being generated after you press Stop.",
      weight: 1.25,
      resources: [R.dotnetCancellation, R.mdnAbortController],
      projectId: "order-assistant",
    }),
    ai("w03-bff-decision", "Decide the stream path: Next.js route handler as BFF, or direct to .NET", {
      detail:
        "Build both paths quickly and measure time to first token, then compare CORS, auth and deployment effort. Write the decision and the numbers into the project README. This closes the open trade-off in the Project 1 design.",
      weight: 1.25,
      resources: [R.nextRouteHandlers, R.mdnCors],
      projectId: "order-assistant",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w03-test-first-agent", "Test-first with an agent: write the failing test, then let it implement", {
      detail:
        "Write a test for the stream's final usage event yourself, then ask the agent to make it pass without changing the test. Compare the result with letting the agent write both the test and the code.",
      weight: 1,
      resources: [R.claudeCodeCommonWorkflows, R.claudeCodeBestPractices],
      projectId: "order-assistant",
    }),
    assisted("w03-debug-with-agent", "Debug with an agent: give it the evidence, not a guess", {
      detail:
        "When cancellation does not work the first time, give the agent the logs, the request and what you expected. Note how much better the answer is with real evidence than with a vague description.",
      weight: 0.5,
      resources: [R.claudeCodeCommonWorkflows],
    }),

    // --- System design (3 h) ---
    design("w03-sd-caching", "Caching: cache-aside, TTLs, invalidation and CDNs", {
      detail:
        "Learn where caches sit (browser, CDN, application, database) and the cache-aside pattern. List three things that can go wrong: stale data, a thundering herd when a hot key expires, and a cache that hides a slow database.",
      weight: 1,
      resources: [R.patternCacheAside, R.mdnHttpCaching],
    }),
    design("w03-sd-url-shortener-2", "Classic: URL shortener (2/2) with caching and storage", {
      detail:
        "Finish last week's design: choose the database and key layout, add a read cache for hot links, and handle analytics without slowing redirects. Explain what happens when the cache is down.",
      weight: 1.25,
      resources: [R.systemDesignPrimer, R.systemDesign101],
    }),
    design("w03-sd-streaming-tradeoffs", "Long-lived connections: what streaming does to your servers", {
      detail:
        "Streams keep a connection open for seconds. Work out how many open connections Project 1 needs at 100 and 1,000 users, and what that means for timeouts on proxies and load balancers.",
      weight: 0.75,
      resources: [R.hpbn],
      projectId: "order-assistant",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w03-py-async", "Python async basics: asyncio and an async HTTP client", {
      detail:
        "Learn async def, await and asyncio.gather. Use an async HTTP client to call three URLs at once and compare the time with calling them one by one.",
      weight: 0.75,
      resources: [R.pythonAsyncio, R.httpx],
    }),
    fundamentals("w03-py-stream", "Stream a model response from Python", {
      detail:
        "Use the Python SDK's streaming helper to print tokens as they arrive, then cancel after one second. Compare the events you see with what your .NET endpoint sends.",
      weight: 0.75,
      resources: [R.anthropicPythonSdk, R.claudeStreaming],
    }),
  ],
});
