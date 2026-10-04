import { defineConfig } from "@playwright/test";

// Uses the Chrome already installed on the machine (no browser download).
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000", channel: "chrome" },
  webServer: { command: "corepack pnpm dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000 },
});
