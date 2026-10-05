import { defineConfig, devices } from "@playwright/test";

/**
 * Accessibility checks run against the BUILT, prerendered site (what crawlers
 * and users get), served statically. Build first: `npm run build:site` (or
 * `npm run build` when Storybook is not needed).
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4310",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node scripts/serve-static.mjs dist/docs/browser 4310",
    url: "http://127.0.0.1:4310/",
    reuseExistingServer: !process.env["CI"],
  },
});
