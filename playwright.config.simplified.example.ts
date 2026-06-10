/**
 * EXAMPLE: Simplified single-app config.
 * Use this shape AFTER forking the boilerplate and removing the second demo app.
 * Do not use this file directly — it's a reference template.
 */
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

const envFile = process.env.ENV
  ? path.resolve(__dirname, "playwright", "environments", `.env.${process.env.ENV}`)
  : path.resolve(__dirname, ".env");

dotenv.config({ path: envFile });

export default defineConfig({
  testDir: "./playwright/tests",
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    testIdAttribute: "data-cy",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
});
