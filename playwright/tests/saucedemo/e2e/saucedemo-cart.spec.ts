/**
 * @fileoverview Saucedemo — Add to Cart & Checkout E2E tests.
 *
 * Covers the full cart → checkout workflow:
 *   1. Add item(s) to cart — badge, button state validation
 *   2. Cart page — correct items, names, prices, quantities
 *   3. Checkout step one — form validation
 *   4. Checkout step two (order summary) — item list, subtotal, tax, total calculation
 *   5. Order confirmation — complete header and text
 *
 * Calculation contract (from MCP exploration):
 *   subtotal = sum of item prices
 *   total    = subtotal + tax  (verified to 2 decimal places)
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
import { ROUTES } from "@configs/app/routes";

const PRODUCTS = {
  BACKPACK: {
    slug: "sauce-labs-backpack",
    name: "Sauce Labs Backpack",
    price: "$29.99",
    priceNum: 29.99,
  },
  BIKE_LIGHT: {
    slug: "sauce-labs-bike-light",
    name: "Sauce Labs Bike Light",
    price: "$9.99",
    priceNum: 9.99,
  },
  BOLT_SHIRT: {
    slug: "sauce-labs-bolt-t-shirt",
    name: "Sauce Labs Bolt T-Shirt",
    price: "$15.99",
    priceNum: 15.99,
  },
} as const;

const CHECKOUT_INFO = { firstName: "Test", lastName: "User", postalCode: "12345" };

test.describe("Saucedemo — Cart & Checkout", { tag: ["@cart", "@checkout"] }, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitInventory();
  });

  // ─── Add to Cart ──────────────────────────────────────────────────────────

  test(
    "add to cart button changes to Remove after adding an item",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await expect(
        page.getByTestId(SAUCEDEMO_UI.PRODUCT_ITEM.REMOVE_BTN(PRODUCTS.BACKPACK.slug)),
      ).toBeVisible();
      await expect(
        page.getByTestId(SAUCEDEMO_UI.PRODUCT_ITEM.ADD_TO_CART_BTN(PRODUCTS.BACKPACK.slug)),
      ).not.toBeVisible();
    },
  );

  test(
    "cart badge reflects the number of items added",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.assertCartIsEmpty();
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.assertCartBadge(1);
      await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
      await saucedemoHelpers.assertCartBadge(2);
      await saucedemoHelpers.addToCart(PRODUCTS.BOLT_SHIRT.slug);
      await saucedemoHelpers.assertCartBadge(3);
    },
  );

  test(
    "adds an item, removes it, and leaves the cart empty",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.assertCartIsEmpty();
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.assertCartBadge(1);

      await saucedemoHelpers.removeFromCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.assertCartIsEmpty();

      await page.getByTestId(SAUCEDEMO_UI.HEADER.CART_LINK).click();
      await expect(page.getByTestId(SAUCEDEMO_UI.CART.ITEM)).toHaveCount(0);
    },
  );

  // ─── Cart Page ────────────────────────────────────────────────────────────

  test(
    "cart page shows the correct items with name, price, and quantity",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
      await page.getByTestId(SAUCEDEMO_UI.HEADER.CART_LINK).click();

      await saucedemoHelpers.assertCartContains([
        { name: PRODUCTS.BACKPACK.name, price: PRODUCTS.BACKPACK.price },
        { name: PRODUCTS.BIKE_LIGHT.name, price: PRODUCTS.BIKE_LIGHT.price },
      ]);
    },
  );

  test("cart page has a Checkout and Continue Shopping button", async ({
    page,
    saucedemoHelpers,
  }) => {
    await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
    await page.getByTestId(SAUCEDEMO_UI.HEADER.CART_LINK).click();
    await expect(page.getByTestId(SAUCEDEMO_UI.CART.CHECKOUT_BTN)).toBeVisible();
    await expect(page.getByTestId(SAUCEDEMO_UI.CART.CONTINUE_SHOPPING_BTN)).toBeVisible();
  });

  // ─── Checkout Step One ────────────────────────────────────────────────────

  test("checkout form requires all fields before proceeding", async ({
    page,
    saucedemoHelpers,
  }) => {
    await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
    await saucedemoHelpers.visitCart();
    await saucedemoHelpers.proceedToCheckout();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.CHECKOUT_STEP_ONE}$`));

    // Submit empty form
    await page.getByTestId(SAUCEDEMO_UI.CHECKOUT.CONTINUE_BTN).click();
    await expect(page.getByTestId(SAUCEDEMO_UI.LOGIN.ERROR_MSG)).toContainText(
      "First Name is required",
    );
  });

  test(
    "navigates to order summary after filling checkout form",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);
      await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.CHECKOUT_STEP_TWO}$`));
    },
  );

  // ─── Checkout Step Two — Order Summary & Calculations ────────────────────

  test(
    "order summary lists all selected items with correct names and prices",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);

      await saucedemoHelpers.assertOrderSummaryContains([
        { name: PRODUCTS.BACKPACK.name, price: PRODUCTS.BACKPACK.price },
        { name: PRODUCTS.BIKE_LIGHT.name, price: PRODUCTS.BIKE_LIGHT.price },
      ]);
    },
  );

  test(
    "subtotal equals sum of selected item prices",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);

      await saucedemoHelpers.assertOrderTotalsAreCorrect([
        PRODUCTS.BACKPACK.priceNum,
        PRODUCTS.BIKE_LIGHT.priceNum,
      ]);
    },
  );

  test("total equals subtotal plus tax", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
    await saucedemoHelpers.addToCart(PRODUCTS.BIKE_LIGHT.slug);
    await saucedemoHelpers.addToCart(PRODUCTS.BOLT_SHIRT.slug);
    await saucedemoHelpers.visitCart();
    await saucedemoHelpers.proceedToCheckout();
    await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);

    const { subtotal, tax, total } = await saucedemoHelpers.getOrderSummaryTotals();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test("summary page displays subtotal, tax, and total labels", async ({
    page,
    saucedemoHelpers,
  }) => {
    await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
    await saucedemoHelpers.visitCart();
    await saucedemoHelpers.proceedToCheckout();
    await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);

    await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.SUBTOTAL_LABEL)).toContainText(
      "Item total:",
    );
    await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.TAX_LABEL)).toContainText("Tax:");
    await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.TOTAL_LABEL)).toContainText("Total:");
  });

  // ─── Order Confirmation ───────────────────────────────────────────────────

  test(
    "completes checkout and shows order confirmation",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
      await saucedemoHelpers.visitCart();
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);
      await saucedemoHelpers.finishOrder();

      await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.CHECKOUT_COMPLETE}$`));
      await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.COMPLETE_HEADER)).toContainText(
        "Thank you for your order!",
      );
      await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.COMPLETE_TEXT)).toContainText(
        "dispatched",
      );
      await expect(page.getByTestId(SAUCEDEMO_UI.CHECKOUT.BACK_HOME_BTN)).toBeVisible();
    },
  );

  test("Back Home button returns to inventory after order", async ({ page, saucedemoHelpers }) => {
    await saucedemoHelpers.addToCart(PRODUCTS.BACKPACK.slug);
    await saucedemoHelpers.visitCart();
    await saucedemoHelpers.proceedToCheckout();
    await saucedemoHelpers.fillCheckoutInfo(CHECKOUT_INFO);
    await saucedemoHelpers.finishOrder();
    await page.getByTestId(SAUCEDEMO_UI.CHECKOUT.BACK_HOME_BTN).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.INVENTORY}$`));
  });
});
