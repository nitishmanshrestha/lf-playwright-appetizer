/**
 * @fileoverview Global auth setup — runs once before all dependent projects.
 *
 * Caches browser session to storageState so tests never re-authenticate.
 * Referenced by the 'auth-setup' project in playwright.config.ts.
 * Enable by setting RUN_GLOBAL_AUTH=true in .env and uncommenting auth-setup project.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import { AUTH_UI } from "@configs/ui/shared/auth.ui";

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page }) => {
  if (!process.env.RUN_GLOBAL_AUTH) {
    console.log(
      "[global.setup] RUN_GLOBAL_AUTH not set — skipping global auth.",
    );
    return;
  }

  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  if (!username || !password) {
    throw new Error("[global.setup] USERNAME and PASSWORD must be set in .env");
  }
  const authUrl = process.env.AUTH_URL ?? "/login";

  await page.goto(authUrl);

  await page.getByTestId(AUTH_UI.USERNAME_INPUT).fill(username);
  await page.getByTestId(AUTH_UI.PASSWORD_INPUT).fill(password);
  await page.getByTestId(AUTH_UI.LOGIN_BUTTON).click();

  await expect(page).not.toHaveURL(/login/);

  await page.context().storageState({ path: AUTH_FILE });
});
