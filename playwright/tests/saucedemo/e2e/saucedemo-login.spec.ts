/**
 * @fileoverview Saucedemo — Login E2E Tests (Data-Driven)
 *
 * Covers the login surface with data-driven test scenarios.
 * Each scenario is parameterized from JSON test data.
 *
 * Architecture rules:
 *   ✅ Test data in playwright/testdata/saucedemo/login-*.json
 *   ✅ Assertion values from testdata (no hardcoding)
 *   ✅ Selectors via SAUCEDEMO_UI
 *   ✅ Routes via ROUTES.SAUCEDEMO
 *   ✅ Parameterized via for...of loops
 *   ✅ Negative cases marked with @negative tag
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";
import validCredentials from "../../../testdata/saucedemo/login-valid-credentials.json";
import invalidCredentials from "../../../testdata/saucedemo/login-invalid-credentials.json";
import validationErrors from "../../../testdata/saucedemo/login-validation-errors.json";

// Run every login scenario from a clean, signed-out session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Saucedemo — Login (Parameterized)", { tag: ["@login", "@e2e"] }, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitLogin();
  });

  // ─── Valid Credentials (Happy Path) ──────────────────────────────────────

  for (const creds of validCredentials) {
    test(
      `logs in successfully as ${creds.username}`,
      { tag: ["@smoke"] },
      async ({ page, saucedemoHelpers }) => {
        // Execute
        await saucedemoHelpers.login(creds.username, creds.password);

        // Assert — using testdata values
        await saucedemoHelpers.assertLoginSucceeded();
        await expect(page).toHaveURL(new RegExp(`${creds.expectedUrl}$`));
      },
    );
  }

  // ─── Invalid Credentials (Negative Cases) ───────────────────────────────

  for (const creds of invalidCredentials) {
    test(
      `rejects login for ${creds.username} with wrong credentials`,
      { tag: ["@negative"] },
      async ({ saucedemoHelpers }) => {
        // Execute
        await saucedemoHelpers.login(creds.username, creds.password);

        // Assert — using testdata error message
        await saucedemoHelpers.assertLoginError(creds.expectedErrorText);
      },
    );
  }

  // ─── Validation Errors (Empty/Missing Fields) ────────────────────────────

  for (const validation of validationErrors) {
    test(
      `requires ${validation.expectedErrorText.toLowerCase()}`,
      { tag: ["@negative", "@validation"] },
      async ({ page, saucedemoHelpers }) => {
        // Execute
        await saucedemoHelpers.login(validation.username, validation.password);

        // Assert — using testdata error message
        await saucedemoHelpers.assertLoginError(validation.expectedErrorText);
        await expect(page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT)).toBeVisible();
      },
    );
  }

  // ─── Logout (Single Test) ───────────────────────────────────────────────

  test(
    "logout redirects to login page with empty form",
    { tag: ["@logout", "@smoke"] },
    async ({ saucedemoHelpers }) => {
      const validUser = validCredentials[0];
      await saucedemoHelpers.login(validUser.username, validUser.password);
      await saucedemoHelpers.assertLoginSucceeded();
      await saucedemoHelpers.logout();
      await saucedemoHelpers.assertLoggedOut();
    },
  );
});
