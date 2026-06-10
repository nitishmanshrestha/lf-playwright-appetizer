/**
 * @fileoverview Saucedemo — Dashboard (Inventory) E2E tests.
 *
 * Validates the inventory page that the user lands on after login.
 * Confirms all required UI elements are present: image, title, description,
 * price, add-to-cart button per item, plus the sort dropdown and cart button.
 *
 * Architecture rules:
 *   ✅ Auth via storageState (saucedemo-setup dependency)
 *   ✅ Selectors via SAUCEDEMO_UI
 *   ✅ Routes via ROUTES.SAUCEDEMO
 *   ✅ No arbitrary waits
 *   ✅ Import from base.fixture.ts
 */

import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

test.describe("Saucedemo — Dashboard", { tag: ["@saucedemo", "@dashboard"] }, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitInventory();
  });

  test(
    "navigates to the inventory page after login",
    { tag: ["@smoke"] },
    async ({ page }) => {
      await expect(page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.INVENTORY}$`));
      await expect(page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
    },
  );

  test(
    "displays the sort dropdown filter",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.assertSortDropdownVisible();
    },
  );

  test(
    "displays the cart button in the header",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.assertCartLinkVisible();
    },
  );

  test("renders 6 products on the inventory page", async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.assertInventoryItemCount(6);
  });

  test(
    "each product has an image, title, description, price, and add-to-cart button",
    { tag: ["@smoke"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.assertEachItemHasRequiredElements();
    },
  );

  test("product names are not empty", async ({ page }) => {
    const names = await page
      .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_NAME)
      .allTextContents();
    for (const name of names) {
      expect(name.trim()).not.toBe("");
    }
  });

  test("product prices follow the dollar format", async ({ page }) => {
    const prices = await page
      .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)
      .allTextContents();
    for (const price of prices) {
      expect(price).toMatch(/^\$\d+\.\d{2}$/);
    }
  });

  test("product images have valid src attributes", async ({ page }) => {
    const items = page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const img = items.nth(i).locator("img");
      await expect(img).toHaveAttribute("src", /\.(jpg|jpeg|png|webp)/);
    }
  });

  test("sort dropdown has 4 filter options", async ({ page }) => {
    const options = page
      .getByTestId(SAUCEDEMO_UI.INVENTORY.SORT_DROPDOWN)
      .locator("option");
    await expect(options).toHaveCount(4);
  });
});
