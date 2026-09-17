import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep AGENTS.md at the repo root as the only project source of truth.
  agentRules: false,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
