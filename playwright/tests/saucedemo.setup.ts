/**
 * @fileoverview Saucedemo auth setup — runs once before saucedemo tests.
 *
 * Caches storageState for reuse across all saucedemo specs.
 */

import { test as setup, expect } from "@playwright/test";
import path from "path";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

const AUTH_FILE = path.join(__dirname, "../.auth/saucedemo.json");

setup("authenticate saucedemo", async ({ page }) => {
  const username = process.env.SAUCEDEMO_USERNAME ?? "standard_user";
  const password = process.env.SAUCEDEMO_PASSWORD ?? "secret_sauce";

  // Navigate to login
  await page.goto(ROUTES.SAUCEDEMO.LOGIN);

  // Fill credentials
  await page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT).fill(username);
  await page.getByTestId(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT).fill(password);
  await page.getByTestId(SAUCEDEMO_UI.LOGIN.LOGIN_BTN).click();

  // Confirm successful login — landing on inventory page
  await expect(page).toHaveURL(/inventory/);

  // Save signed-in state
  await page.context().storageState({ path: AUTH_FILE });
});
