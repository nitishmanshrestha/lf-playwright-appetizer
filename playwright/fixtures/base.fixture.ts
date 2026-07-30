import { test as base, expect } from "@playwright/test";
import { ApiHelpers } from "../support/helpers/common/api.helpers";
import { HarHelpers } from "../support/helpers/common/har.helpers";
import { NavigationHelpers } from "../support/helpers/common/navigation.helpers";
import { UiHelpers } from "../support/helpers/common/ui.helpers";

type CustomFixtures = {
  api: ApiHelpers;
  har: HarHelpers;
  nav: NavigationHelpers;
  ui: UiHelpers;
  evidence: void;
};

export const test = base.extend<CustomFixtures>({
  evidence: [
    async ({ page }, use, testInfo) => {
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

      if (testInfo.status === testInfo.expectedStatus) return;

      await testInfo.attach("failure-evidence.json", {
        body: Buffer.from(
          JSON.stringify(
            {
              title: testInfo.title,
              file: testInfo.file,
              project: testInfo.project.name,
              status: testInfo.status,
              expectedStatus: testInfo.expectedStatus,
              url: page.url(),
              consoleMessages,
              pageErrors,
              failedRequests,
            },
            null,
            2,
          ),
          "utf8",
        ),
        contentType: "application/json",
      });
    },
    { auto: true },
  ],

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
});

export { expect };
