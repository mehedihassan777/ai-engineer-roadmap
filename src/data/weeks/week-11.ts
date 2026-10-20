import { ai, assisted, defineWeek, design, fundamentals, patternWeek } from "../helpers";
import { R } from "../resources";

export const week11 = defineWeek({
  number: 11,
  phaseId: "mcp-agents",
  title: "MCP fundamentals and a read-only OMS server",
  summary:
    "Learn the Model Context Protocol from the current spec, then start Project 3: an MCP server in C# that exposes the demo OMS as read-only tools and resources, tested with the MCP Inspector.",
  projectId: "oms-mcp-server",
  dsa: patternWeek("heap", [
    ["Kth Largest Element in a Stream", "Last Stone Weight", "K Closest Points to Origin"],
    ["Kth Largest Element in an Array", "Task Scheduler"],
    ["Design Twitter", "Find Median from Data Stream"],
  ]),
  tasks: [
    // --- AI engineering + projects (6.75 h) ---
    ai("w11-mcp-concepts", "MCP concepts: hosts, clients, servers, tools, resources, prompts", {
      detail:
        "Read the architecture overview and take the introductory course. Write down the difference between a tool, a resource and a prompt, with one OMS example of each. Note which spec revision is current — it changes, so always check the latest.",
      weight: 1.25,
      resources: [R.mcpArchitecture, R.anthropicMcpCourse],
    }),
    ai("w11-mcp-csharp-server", "Project 3: an MCP server in C# with the official SDK", {
      detail:
        "Follow the .NET quickstart, then build a server with get_order, search_orders and get_inventory as tools, calling the same application services as Project 1. Start with the stdio transport.",
      weight: 2,
      resources: [R.mcpCsharpSdk, R.msMcpQuickstart],
      projectId: "oms-mcp-server",
    }),
    ai("w11-mcp-resources", "Expose order and product data as MCP resources", {
      detail:
        "Add resources for a single order and the product catalogue, with clear URIs. Decide what is a resource (data the user picks) and what is a tool (an action the model chooses).",
      weight: 1,
      resources: [R.mcpResources, R.mcpTools],
      projectId: "oms-mcp-server",
    }),
    ai("w11-mcp-inspector", "Test the server with the MCP Inspector and a real client", {
      detail:
        "List and call every tool from the Inspector, including bad arguments. Then connect the server to a desktop or coding-agent client and ask three real questions.",
      weight: 1.25,
      resources: [R.mcpInspector, R.claudeCodeMcp],
      projectId: "oms-mcp-server",
    }),
    ai("w11-mcp-tool-design", "Tool design for MCP: names, schemas, errors the model can act on", {
      detail:
        "Return errors that tell the model what to do next ('order not found — try search_orders'). Keep results small and paginated. Review your tools against the advice on writing tools for agents.",
      weight: 1.25,
      resources: [R.writingToolsForAgents, R.mcpTools],
      projectId: "oms-mcp-server",
    }),

    // --- AI-assisted engineering (1.5 h) ---
    assisted("w11-agent-from-spec", "Build against a fast-moving spec with an agent", {
      detail:
        "Give the agent the link to the latest spec and SDK docs and ask it to check them before writing code. Catch at least one place where it used an outdated API and fix your instructions.",
      weight: 1,
      resources: [R.mcpSpec, R.claudeCodeMemory],
      projectId: "oms-mcp-server",
    }),
    assisted("w11-changelog-habit", "Habit: check the changelogs of your fast-moving tools", {
      detail:
        "Read the recent changelog entries for your coding agent and the MCP SDK. Write down one new feature you will try and one change that affects your projects.",
      weight: 0.5,
      resources: [R.claudeCodeChangelog, R.mcpCsharpSdk],
    }),

    // --- System design (3 h) ---
    design("w11-sd-api-gateway-auth", "API gateways and authentication between services", {
      detail:
        "What a gateway does (routing, auth, rate limits), and how services trust each other: API keys, OAuth 2 client credentials, JWTs. Draw where Project 3 checks who is calling.",
      weight: 1.25,
      resources: [R.patternGatewayRouting, R.aspnetAuthentication],
    }),
    design("w11-sd-tool-access", "Design safe tool access for models", {
      detail:
        "Which user is the model acting for? Design how the MCP server gets the user's identity and permissions, and why the model must never get more access than the user has.",
      weight: 1,
      resources: [R.mcpSecurity, R.owaspApiTop10],
      projectId: "oms-mcp-server",
    }),
    design("w11-sd-p3-design", "Project 3 design: requirements, components and failure modes", {
      detail:
        "Write the first version of the design doc for the OMS MCP server, including what is read-only now and what will be a write tool with approval later.",
      weight: 0.75,
      resources: [R.mcpArchitecture],
      projectId: "oms-mcp-server",
    }),

    // --- Fundamentals (1.5 h) ---
    fundamentals("w11-oauth", "OAuth 2 in plain words: roles, flows, tokens, scopes", {
      detail:
        "Learn the four roles, the authorization code flow with PKCE, client credentials, access and refresh tokens and scopes. Draw the authorization code flow from memory.",
      weight: 1,
      resources: [R.oauthSimplified, R.oauth2],
    }),
    fundamentals("w11-jwt", "JWTs: what is inside and how they are checked", {
      detail:
        "Decode a JWT by hand, then list what a server must check: signature, issuer, audience, expiry. Name two common mistakes.",
      weight: 0.5,
      resources: [R.jwtIntro],
    }),
  ],
});
