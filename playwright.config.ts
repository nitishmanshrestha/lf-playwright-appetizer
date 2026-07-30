import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { FRAMEWORK_EVIDENCE } from "@configs/app/framework-evidence";

/**
 * Load environment-specific config.
 * Usage: ENV=qa npx playwright test
 */
const envFile = process.env.ENV
  ? path.resolve(
      __dirname,
      "playwright",
      "environments",
      `.env.${process.env.ENV}`,
    )
  : path.resolve(__dirname, ".env");

dotenv.config({ path: envFile });

const TRACE_MODE = process.env.PW_TRACE ?? "on-first-retry";

export default defineConfig({
  testDir: "./playwright/tests",
  outputDir: FRAMEWORK_EVIDENCE.TESTS.PLAYWRIGHT_OUTPUT_DIR,
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ["html", { outputFolder: FRAMEWORK_EVIDENCE.TESTS.HTML_REPORT_DIR }],
    ["json", { outputFile: FRAMEWORK_EVIDENCE.TESTS.JSON_REPORT_FILE }],
    ["junit", { outputFile: FRAMEWORK_EVIDENCE.TESTS.JUNIT_REPORT_FILE }],
    ["list"],
  ],
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    testIdAttribute: "data-testid",
    trace: TRACE_MODE as any,
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: /.*global\.setup\.ts$/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: process.env.RUN_GLOBAL_AUTH
          ? "playwright/.auth/user.json"
          : undefined,
      },
      dependencies: ["auth-setup"],
    },
  ],
});
