/**
 * @fileoverview Saucedemo — Cart Negative Cases (Error Scenarios).
 *
 * Covers edge cases and error paths:
 *   1. Checkout with missing form fields (first name, last name, postal code)
 *   2. Cart operations with quantity edge cases
 *   3. Cancel button behavior during checkout
 *   4. Badge updates when removing items
 *
 * Architecture rules:
 *   ✅ Auth via storageState (saucedemo-setup dependency)
 *   ✅ All selectors via SAUCEDEMO_UI
 *   ✅ All routes via ROUTES.SAUCEDEMO
 *   ✅ No arbitrary waits — all assertions are deterministic
 *   ✅ Import from base.fixture.ts
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";

const PRODUCTS = {
  BACKPACK: {
    slug: "sauce-labs-backpack",
    name: "Sauce Labs Backpack",
    price: "$29.99",
  },
  BIKE_LIGHT: {
    slug: "sauce-labs-bike-light",
    name: "Sauce Labs Bike Light",
    price: "$9.99",
  },
} as const;

test.describe("Saucedemo — Cart Negative Cases", { tag: ["@cart"] }, () => {
  // ─── Checkout Form Validation Errors ──────────────────────────────────────

  test.describe("Checkout form validation", () => {
    test.beforeEach(async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.visitInventory();
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
    });

    test(
      "shows error when First Name is empty",
      { tag: ["@checkout", "@negative"] },
      async ({ saucedemoHelpers }) => {
        await saucedemoHelpers.assertCheckoutErrorWhenFirstNameEmpty();
      },
    );

    test(
      "shows error when Last Name is empty",
      { tag: ["@checkout", "@negative"] },
      async ({ saucedemoHelpers }) => {
        await saucedemoHelpers.assertCheckoutErrorWhenLastNameEmpty();
      },
    );

    test(
      "shows error when Postal Code is empty",
      { tag: ["@checkout", "@negative"] },
      async ({ saucedemoHelpers }) => {
        await saucedemoHelpers.assertCheckoutErrorWhenPostalCodeEmpty();
      },
    );

    test(
      "cancel button returns to cart page without completing order",
      { tag: ["@checkout", "@negative"] },
      async ({ saucedemoHelpers }) => {
        await saucedemoHelpers.assertCancelCheckoutReturnsToCart();
      },
    );
  });

  // ─── Cart Operations & Edge Cases ─────────────────────────────────────────

  test.describe("Cart operations with multiple items", () => {
    test.beforeEach(async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.visitInventory();
    });

    test(
      "removing all items hides the cart badge",
      { tag: ["@negative"] },
      async ({ saucedemoHelpers }) => {
        // Add one item
        await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
        await saucedemoHelpers.assertCartBadge(1);

        // Remove the item
        await saucedemoHelpers.removeFromCart(PRODUCTS.BACKPACK.slug);

        // Badge should be gone
        await saucedemoHelpers.assertCartIsEmpty();
      },
    );

    test(
      "removing a specific item decreases badge correctly",
      { tag: ["@negative"] },
      async ({ page, saucedemoHelpers }) => {
        // Add two different items
        await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
        await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
        await saucedemoHelpers.assertCartBadge(2);

        // Remove one item
        await saucedemoHelpers.removeFromCart(PRODUCTS.BACKPACK.slug);

        // Badge should show 1
        await saucedemoHelpers.assertCartBadge(1);

        // Verify remaining item is bike light
        await saucedemoHelpers.visitCart();
        await expect(page.getByTestId(SAUCEDEMO_UI.CART.ITEM_NAME)).toContainText("Bike Light");
      },
    );

    test(
      "checkout button is still visible on empty cart (app allows navigation)",
      { tag: ["@checkout", "@negative"] },
      async ({ saucedemoHelpers }) => {
        // Navigate to cart without adding items
        await saucedemoHelpers.visitCart();

        // Checkout button is visible (app allows navigating even with empty cart)
        await saucedemoHelpers.assertCheckoutIsVisibleOnEmptyCart();
      },
    );
  });

  // ─── Inventory Interaction Edge Cases ─────────────────────────────────────

  test.describe("Inventory and cart state consistency", () => {
    test(
      "adding and removing same item toggles button state",
      { tag: ["@inventory", "@negative"] },
      async ({ page, saucedemoHelpers }) => {
        await saucedemoHelpers.visitInventory();

        // Get the add button (should be visible)
        let button = page.getByTestId(
          SAUCEDEMO_UI.PRODUCT_ITEM.ADD_TO_CART_BTN(PRODUCTS.BACKPACK.slug),
        );
        let buttonText = await button.textContent();
        expect(buttonText).toContain("Add to cart");

        // Add to cart
        await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);

        // Button should now say "Remove"
        button = page.getByTestId(SAUCEDEMO_UI.PRODUCT_ITEM.REMOVE_BTN(PRODUCTS.BACKPACK.slug));
        buttonText = await button.textContent();
        expect(buttonText).toContain("Remove");

        // Remove from cart
        await saucedemoHelpers.removeFromCart(PRODUCTS.BACKPACK.slug);

        // Button should be back to "Add to cart"
        button = page.getByTestId(
          SAUCEDEMO_UI.PRODUCT_ITEM.ADD_TO_CART_BTN(PRODUCTS.BACKPACK.slug),
        );
        buttonText = await button.textContent();
        expect(buttonText).toContain("Add to cart");
      },
    );

    test(
      "cart badge persists when navigating between pages",
      { tag: ["@navigation", "@negative"] },
      async ({ saucedemoHelpers }) => {
        await saucedemoHelpers.visitInventory();
        await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
        await saucedemoHelpers.assertCartBadge(1);

        // Navigate away and back
        await saucedemoHelpers.visitCart();
        await saucedemoHelpers.visitInventory();

        // Badge should still be 1
        await saucedemoHelpers.assertCartBadge(1);
      },
    );
  });
});
