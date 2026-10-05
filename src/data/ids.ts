/**
 * Closed sets of ids used to cross-reference roadmap content.
 * Typing them as unions gives editor autocompletion and compile-time checks
 * when you reference a track, phase, project, DSA pattern or stack page.
 * Adding a new one = add it here, then add the matching content file.
 */

export const TRACK_IDS = ["ai", "assisted", "design", "fundamentals", "dsa"] as const;
export type TrackId = (typeof TRACK_IDS)[number];

export const PHASE_IDS = ["llm-foundations", "rag", "mcp-agents", "production-ai"] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

export const PROJECT_IDS = [
  "order-assistant",
  "docs-qa",
  "oms-mcp-server",
  "ticket-triage-agent",
  "order-exception-agent",
] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

/**
 * Project titles live here (not only in the project files) so small UI pieces such as week headers can show
 * a project name without importing the full project content. Each project file reuses its title from here.
 */
export const PROJECT_TITLES: Record<ProjectId, string> = {
  "order-assistant": "Order Assistant",
  "docs-qa": "Docs Q&A with citations",
  "oms-mcp-server": "OMS MCP server",
  "ticket-triage-agent": "Support-ticket triage agent",
  "order-exception-agent": "Capstone: order-exception agent",
};

export const DSA_PATTERN_IDS = [
  "arrays-hashing",
  "two-pointers",
  "sliding-window",
  "stack",
  "binary-search",
  "linked-list",
  "trees",
  "tries",
  "heap",
  "backtracking",
  "graphs",
  "topological-sort",
  "union-find",
  "intervals",
  "dp-1d",
  "dp-2d",
  "greedy",
] as const;
export type DsaPatternId = (typeof DSA_PATTERN_IDS)[number];

export const STACK_SLUGS = ["dotnet", "angular", "nextjs", "mcp", "ai-assisted"] as const;
export type StackSlug = (typeof STACK_SLUGS)[number];
