import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js from generating/overwriting CLAUDE.md — that file is this
  // workspace's hand-written project memory.
  agentRules: false,
};

export default nextConfig;
