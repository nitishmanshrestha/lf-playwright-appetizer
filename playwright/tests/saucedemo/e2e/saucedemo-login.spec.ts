/**
 * @fileoverview Saucedemo — Login feature E2E tests.
 *
 * Covers the login surface only. These tests deliberately bypass the cached
 * saucedemo storageState so each scenario starts from a signed-out session.
 *
 * Architecture rules:
 *   ✅ Selectors via SAUCEDEMO_UI
 *   ✅ Routes via ROUTES.SAUCEDEMO
 *   ✅ Credentials via env (SAUCEDEMO_USERNAME / SAUCEDEMO_PASSWORD)
 *   ✅ All assertions deterministic — no waitForTimeout
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

// Run every login scenario from a clean, signed-out session.
test.use({ storageState: { cookies: [], origins: [] } });

const VALID_USERNAME = process.env.SAUCEDEMO_USERNAME ?? "standard_user";
const VALID_PASSWORD = process.env.SAUCEDEMO_PASSWORD ?? "secret_sauce";

test.describe("Saucedemo — Login", { tag: ["@saucedemo", "@login"] }, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitLogin();
  });

  test(
    "logs in successfully with valid credentials",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.login(VALID_USERNAME, VALID_PASSWORD);
      await saucedemoHelpers.assertLoginSucceeded();
      await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.INVENTORY}$`));
    },
  );

  test("blocks login for a locked-out user", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.login("locked_out_user", VALID_PASSWORD);
    await saucedemoHelpers.assertLoginError("Sorry, this user has been locked out");
  });

  test("rejects an invalid password", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.login(VALID_USERNAME, "wrong_password");
    await saucedemoHelpers.assertLoginError(
      "Username and password do not match any user in this service",
    );
  });

  test("rejects an unknown username", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.login("ghost_user", VALID_PASSWORD);
    await saucedemoHelpers.assertLoginError(
      "Username and password do not match any user in this service",
    );
  });

  test("requires username when submitting empty form", async ({ page, saucedemoHelpers }) => {
    await saucedemoHelpers.login("", "");
    await saucedemoHelpers.assertLoginError("Username is required");
    await expect(page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT)).toBeVisible();
  });

  test("requires password when username is provided alone", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.login(VALID_USERNAME, "");
    await saucedemoHelpers.assertLoginError("Password is required");
  });

  test(
    "logout redirects to login page with empty form",
    { tag: ["@logout"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.login(VALID_USERNAME, VALID_PASSWORD);
      await saucedemoHelpers.assertLoginSucceeded();
      await saucedemoHelpers.logout();
      await saucedemoHelpers.assertLoggedOut();
    },
  );
});
