import { defineConfig } from "@playwright/test";

// Uses the Chrome already installed on the machine (no browser download).
export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: "http://localhost:3000", channel: "chrome" },
  // The API is unreachable on purpose: the suite checks the app's own pages and its API-down states, so it
  // gives the same result with or without a local `docker compose` stack. Never reuse a running dev server,
  // which would be talking to a real API.
  webServer: {
    command: "corepack pnpm dev",
    url: "http://localhost:3000",
    env: { API_URL: "http://127.0.0.1:9" },
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
