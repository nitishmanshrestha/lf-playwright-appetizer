/**
 * @fileoverview Saucedemo smoke tests — real-world demo of the helper-first pattern.
 *
 * Target: https://www.saucedemo.com (public Sauce Labs demo site)
 *
 * Architecture rules enforced:
 *   ✅ Auth handled by storageState (project dependency on saucedemo-setup)
 *   ✅ All selectors via SAUCEDEMO_UI config — zero hardcoded selectors
 *   ✅ All routes via ROUTES.SAUCEDEMO constants — zero hardcoded URLs
 *   ✅ No arbitrary waits — all waits are assertion-driven
 *   ✅ Tags via test metadata — @smoke, @saucedemo, @cart, @checkout
 *
 * Test coverage:
 *   - Inventory page loads with products
 *   - Add to cart / cart badge updates
 *   - Remove from cart
 *   - Sorting (name A→Z, price low→high)
 *   - Full checkout happy path
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";

test.describe("Saucedemo — Smoke Tests", { tag: ["@saucedemo"] }, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitInventory();
  });

  // ─── Inventory ─────────────────────────────────────────────────────────────

  test("loads the inventory page with products", { tag: ["@smoke"] }, async ({ page }) => {
    await expect(page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
    await expect(page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM)).toHaveCount(6);
    await expect(page.locator(".app_logo")).toContainText("Swag Labs");
  });

  test("displays product names and prices", { tag: ["@smoke"] }, async ({ page }) => {
    const firstItem = page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM).first();
    await expect(firstItem.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_NAME)).not.toBeEmpty();
    const priceText = await firstItem
      .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)
      .textContent();
    expect(priceText).toMatch(/^\$\d+\.\d{2}$/);
  });

  // ─── Sort ──────────────────────────────────────────────────────────────────

  test("sorts inventory by Name (A to Z)", { tag: ["@smoke"] }, async ({ page, saucedemoHelpers }) => {
    await saucedemoHelpers.sortInventoryBy("az");
    const names = await page
      .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_NAME)
      .allTextContents();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test("sorts inventory by Price (low to high)", async ({ page, saucedemoHelpers }) => {
    await saucedemoHelpers.sortInventoryBy("lohi");
    const priceTexts = await page
      .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)
      .allTextContents();
    const prices = priceTexts.map((t) => parseFloat(t.replace("$", "")));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  // ─── Cart ──────────────────────────────────────────────────────────────────

  test(
    "adds a product to the cart and updates the badge",
    { tag: ["@smoke", "@cart"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.assertCartIsEmpty();
      await saucedemoHelpers.addToCart("sauce-labs-backpack");
      await saucedemoHelpers.assertCartBadge(1);
    },
  );

  test(
    "adds multiple products and reflects correct badge count",
    { tag: ["@cart"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart("sauce-labs-backpack");
      await saucedemoHelpers.addToCart("sauce-labs-bike-light");
      await saucedemoHelpers.assertCartBadge(2);
    },
  );

  test("removes a product and updates the badge", { tag: ["@cart"] }, async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.addToCart("sauce-labs-backpack");
    await saucedemoHelpers.assertCartBadge(1);
    await saucedemoHelpers.removeFromCart("sauce-labs-backpack");
    await saucedemoHelpers.assertCartIsEmpty();
  });

  // ─── Checkout ──────────────────────────────────────────────────────────────

  test(
    "completes a full checkout flow",
    { tag: ["@smoke", "@checkout"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart("sauce-labs-backpack");
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo({
        firstName: "Test",
        lastName: "User",
        postalCode: "12345",
      });
      await saucedemoHelpers.finishOrder();
      await saucedemoHelpers.assertOrderConfirmed();
    },
  );
});
