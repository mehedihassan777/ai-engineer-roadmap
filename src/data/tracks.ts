import type { Track } from "./types";

export const TRACKS: Track[] = [
  {
    id: "ai",
    name: "AI engineering + projects",
    shortName: "AI",
    description: "LLM APIs, RAG, MCP, agents and production AI - built through five Next.js + .NET projects.",
    color: "violet",
  },
  {
    id: "assisted",
    name: "AI-assisted engineering",
    shortName: "AI-assisted",
    description: "Using coding agents well: CLAUDE.md, plan-then-implement, skills, subagents, hooks, MCP, CI and team rollout.",
    color: "sky",
  },
  {
    id: "design",
    name: "System design",
    shortName: "Design",
    description: "Classic distributed-systems design plus AI-specific design: RAG, LLM gateway, agent reliability, approval flows.",
    color: "amber",
  },
  {
    id: "fundamentals",
    name: "Fundamentals",
    shortName: "Fundamentals",
    description: "Python basics, vectors, HTTP and networking, concurrency, database internals, cloud, Docker and CI/CD.",
    color: "emerald",
  },
  {
    id: "dsa",
    name: "DSA (LeetCode)",
    shortName: "DSA",
    description: "Pattern-based practice following the NeetCode 150 structure, with a mock-interview week every six weeks.",
    color: "rose",
  },
];
