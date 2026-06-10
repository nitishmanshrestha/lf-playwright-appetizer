/**
 * @fileoverview Base test fixture — extends Playwright's test with custom helpers.
 *
 * Tests destructure helpers from the fixture rather than importing them directly:
 *   test('example', async ({ exampleHelpers }) => { ... });
 *
 * Architecture:
 *   Config → Helpers (via fixtures) → Tests
 *
 * Every helper module is registered here as a fixture.
 * Tests import `test` and `expect` from this file, not from '@playwright/test'.
 */

import { test as base, expect } from "@playwright/test";
import { ExampleHelpers } from "../support/helpers/modules/example.helpers";
import { SaucedemoHelpers } from "../support/helpers/modules/saucedemo.helpers";
import { ApiHelpers } from "../support/helpers/common/api.helpers";
import { HarHelpers } from "../support/helpers/common/har.helpers";
import { NavigationHelpers } from "../support/helpers/common/navigation.helpers";
import { UiHelpers } from "../support/helpers/common/ui.helpers";

// ─── Fixture Types ───────────────────────────────────────────────────────────

type CustomFixtures = {
  api: ApiHelpers;
  har: HarHelpers;
  nav: NavigationHelpers;
  ui: UiHelpers;
  evidence: void;
  exampleHelpers: ExampleHelpers;
  saucedemoHelpers: SaucedemoHelpers;
};

// ─── Extended Test ───────────────────────────────────────────────────────────

export const test = base.extend<CustomFixtures>({
  evidence: async ({ page }, use, testInfo) => {
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];

    page.on("console", (message) => {
      consoleMessages.push(`[${message.type()}] ${message.text()}`);
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "request failed";
      failedRequests.push(`${request.method()} ${request.url()} :: ${failure}`);
    });

    await use();

    if (testInfo.status === testInfo.expectedStatus) {
      return;
    }

    const payload = {
      title: testInfo.title,
      file: testInfo.file,
      project: testInfo.project.name,
      status: testInfo.status,
      expectedStatus: testInfo.expectedStatus,
      url: page.url(),
      consoleMessages,
      pageErrors,
      failedRequests,
    };

    await testInfo.attach("failure-evidence.json", {
      body: Buffer.from(JSON.stringify(payload, null, 2), "utf8"),
      contentType: "application/json",
    });

    await testInfo.attach("failure-evidence.txt", {
      body: Buffer.from(
        [
          `Test: ${testInfo.title}`,
          `File: ${testInfo.file}`,
          `Project: ${testInfo.project.name}`,
          `Status: ${testInfo.status}`,
          `URL: ${page.url()}`,
          "",
          "Console messages:",
          ...(consoleMessages.length > 0 ? consoleMessages : ["(none)"]),
          "",
          "Page errors:",
          ...(pageErrors.length > 0 ? pageErrors : ["(none)"]),
          "",
          "Failed requests:",
          ...(failedRequests.length > 0 ? failedRequests : ["(none)"]),
        ].join("\n"),
        "utf8",
      ),
      contentType: "text/plain",
    });
  },

  api: async ({ page }, use) => {
    await use(new ApiHelpers(page));
  },

  har: async ({ page }, use) => {
    await use(new HarHelpers(page));
  },

  nav: async ({ page }, use) => {
    await use(new NavigationHelpers(page));
  },

  ui: async ({ page }, use) => {
    await use(new UiHelpers(page));
  },

  exampleHelpers: async ({ page }, use) => {
    await use(new ExampleHelpers(page));
  },

  saucedemoHelpers: async ({ page }, use) => {
    await use(new SaucedemoHelpers(page));
  },
});

export { expect };
