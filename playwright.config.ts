import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { FRAMEWORK_EVIDENCE } from "@configs/app/framework-evidence";

/**
 * Load environment-specific config.
 * Usage: ENV=qa npx playwright test
 */
const envFile = process.env.ENV
  ? path.resolve(__dirname, "playwright", "environments", `.env.${process.env.ENV}`)
  : path.resolve(__dirname, ".env");

dotenv.config({ path: envFile });

// Allow overriding Playwright trace mode via environment variable `PW_TRACE`.
// Examples: PW_TRACE=on | PW_TRACE=off | PW_TRACE=on-first-retry
const TRACE_MODE = process.env.PW_TRACE ?? "on-first-retry";

export default defineConfig({
  // ── Test Directory ──
  testDir: "./playwright/tests",

  // ── Evidence Directories ──
  outputDir: FRAMEWORK_EVIDENCE.TESTS.PLAYWRIGHT_OUTPUT_DIR,

  // ── Parallelism ──
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // ── Retries ──
  retries: process.env.CI ? 2 : 0,

  // ── Reporter ──
  reporter: [
    ["html", { outputFolder: FRAMEWORK_EVIDENCE.TESTS.HTML_REPORT_DIR }],
    ["json", { outputFile: FRAMEWORK_EVIDENCE.TESTS.JSON_REPORT_FILE }],
    ["junit", { outputFile: FRAMEWORK_EVIDENCE.TESTS.JUNIT_REPORT_FILE }],
    ["list"],
  ],

  // ── Global Timeouts ──
  timeout: 30_000,
  expect: { timeout: 10_000 },

  // ── Shared Settings ──
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    testIdAttribute: "data-testid",
    trace: TRACE_MODE as any,
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  // ── Projects ──
  projects: [
    // Auth setup — runs before all dependent projects
    // {
    //   name: "auth-setup",
    // },

    // Main test project — real app only; ignored until BASE_URL points to a real app
    {
      name: "chromium",
      testIgnore: /.*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      grep: process.env.RUN_GLOBAL_AUTH ? undefined : /^$/,
    },

    // Saucedemo — standalone project (different baseURL, own auth)
    {
      name: "saucedemo",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "https://www.saucedemo.com",
        testIdAttribute: "data-test",
        storageState: "playwright/.auth/saucedemo.json",
      },
      // testMatch: /.*saucedemo.*\.setup\.ts$/,
      dependencies: ["saucedemo-setup"],
    },
    {
      name: "saucedemo-setup",
      use: {
        baseURL: "https://www.saucedemo.com",
        testIdAttribute: "data-test",
      },
      testMatch: /.*saucedemo.*\.setup\.ts$/,
    },
    // (no lightweight experiment projects configured)
  ],
});
