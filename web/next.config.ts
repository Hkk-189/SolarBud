import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't let `next dev` write AGENTS.md / CLAUDE.md into web/.
  agentRules: false,
};

export default nextConfig;
