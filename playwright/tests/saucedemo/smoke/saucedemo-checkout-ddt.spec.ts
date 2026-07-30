/**
 * @fileoverview Saucedemo Checkout Tests — Data-Driven Parameterization
 *
 * These tests demonstrate parameterized testing patterns using test data
 * loaded from JSON files in the testdata folder.
 *
 * Architecture:
 *   ✅ Test data in JSON (playwright/testdata/saucedemo/)
 *   ✅ Assertion values included in test data
 *   ✅ Tests parameterized via for loops
 *   ✅ Helpers remain data-agnostic
 *   ✅ No hardcoded assertions
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import validCheckoutUsers from "../../../testdata/saucedemo/checkout-valid-users.json";
import invalidCheckoutUsers from "../../../testdata/saucedemo/checkout-invalid-users.json";

test.describe("Saucedemo — Checkout (Parameterized)", () => {
  // ─── Data-Driven Checkout (Happy Path) ──────────────────────────────────────

  for (const user of validCheckoutUsers) {
    test(
      `completes checkout for ${user.firstName} ${user.lastName}`,
      { tag: ["@smoke", "@checkout"] },
      async ({ saucedemoHelpers, page }) => {
        // Setup
        await saucedemoHelpers.visitInventory();
        await saucedemoHelpers.addToCart("sauce-labs-backpack");
        await saucedemoHelpers.visitCart();
        await saucedemoHelpers.proceedToCheckout();

        // Execute
        await saucedemoHelpers.fillCheckoutInfo({
          firstName: user.firstName,
          lastName: user.lastName,
          postalCode: user.postalCode,
        });
        await saucedemoHelpers.finishOrder();

        // Assert — using data from testdata
        const confirmationText = await page
          .getByTestId(SAUCEDEMO_UI.CHECKOUT.COMPLETE_HEADER)
          .textContent();
        expect(confirmationText).toContain(user.expectedConfirmationText);
      },
    );
  }

  // ─── Data-Driven Checkout (Validation Failures) ────────────────────────────

  for (const userData of invalidCheckoutUsers) {
    test(
      `rejects checkout when ${userData.expectedErrorText}`,
      { tag: ["@smoke", "@checkout", "@validation"] },
      async ({ saucedemoHelpers, page }) => {
        // Setup
        await saucedemoHelpers.visitInventory();
        await saucedemoHelpers.addToCart("sauce-labs-backpack");
        await saucedemoHelpers.visitCart();
        await saucedemoHelpers.proceedToCheckout();

        // Execute
        await saucedemoHelpers.fillCheckoutInfo({
          firstName: userData.firstName,
          lastName: userData.lastName,
          postalCode: userData.postalCode,
        });
        await saucedemoHelpers.finishOrder();

        // Assert — expect error message from testdata
        const errorMessage = await page.locator('[data-test="error"]').textContent();
        expect(errorMessage).toContain(userData.expectedErrorText);
      },
    );
  }
});
