/**
 * @fileoverview Global auth setup — runs once before all dependent projects.
 *
 * Caches browser session to storageState so tests never re-authenticate.
 * Referenced by the 'auth-setup' project in playwright.config.ts.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page }) => {
  if (!process.env.RUN_GLOBAL_AUTH) {
    console.log("[global.setup] RUN_GLOBAL_AUTH not set — skipping global auth.");
    return;
  }

  const username = process.env.USERNAME ?? "admin";
  const password = process.env.PASSWORD ?? "password";
  const authUrl = process.env.AUTH_URL ?? "/login";

  // Navigate to login
  await page.goto(authUrl);

  // Fill credentials
  await page.getByTestId("username-input").fill(username);
  await page.getByTestId("password-input").fill(password);
  await page.getByTestId("login-btn").click();

  // Assert successful login — not still on login page
  await expect(page).not.toHaveURL(/login/);

  // Save signed-in state
  await page.context().storageState({ path: AUTH_FILE });
});
