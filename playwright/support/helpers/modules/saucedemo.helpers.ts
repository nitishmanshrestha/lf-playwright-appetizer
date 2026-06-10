/**
 * @fileoverview Saucedemo module helpers.
 *
 * Demonstrates the helper-first pattern against a real publicly accessible demo site.
 * All selectors come from SAUCEDEMO_UI, all routes from ROUTES.
 *
 * Available methods:
 *   saucedemoHelpers.visitInventory()           — navigate to /inventory.html
 *   saucedemoHelpers.visitCart()                — navigate to /cart.html
 *   saucedemoHelpers.addToCart(productName)     — add a product by kebab-case name
 *   saucedemoHelpers.removeFromCart(name)       — remove while on inventory page
 *   saucedemoHelpers.assertCartBadge(count)     — assert the header cart badge count
 *   saucedemoHelpers.assertCartIsEmpty()        — assert no badge visible
 *   saucedemoHelpers.proceedToCheckout()        — clicks Checkout button in cart
 *   saucedemoHelpers.fillCheckoutInfo(info)     — fills step-one personal info form
 *   saucedemoHelpers.finishOrder()              — clicks Finish on order overview
 *   saucedemoHelpers.assertOrderConfirmed()     — asserts confirmation page message
 *   saucedemoHelpers.sortInventoryBy(option)    — selects a sort option
 *   saucedemoHelpers.logout()                   — opens menu and clicks Logout
 */

import { Locator, Page, expect } from "@playwright/test";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

export class SaucedemoHelpers {
  constructor(private page: Page) {}

  private byTestIdOrRole(
    testId: string,
    role: "button" | "link" | "combobox",
    name: string | RegExp,
  ): Locator {
    return this.page.getByTestId(testId).or(this.page.getByRole(role, { name }));
  }

  private byTestIdOrLabel(testId: string, label: string | RegExp): Locator {
    return this.page.getByTestId(testId).or(this.page.getByLabel(label));
  }

  // ─── Login ───────────────────────────────────────────────────────────────

  async visitLogin(): Promise<void> {
    await this.page.goto(ROUTES.SAUCEDEMO.LOGIN);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.LOGIN.LOGIN_BTN)).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.byTestIdOrLabel(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT, /user ?name/i)
      .first()
      .fill(username);
    await this.byTestIdOrLabel(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT, /password/i)
      .first()
      .fill(password);
    await this.byTestIdOrRole(SAUCEDEMO_UI.LOGIN.LOGIN_BTN, "button", /login/i).first().click();
  }

  async assertLoginSucceeded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html$/);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
  }

  async assertLoginError(message: string | RegExp): Promise<void> {
    const error = this.page.getByTestId(SAUCEDEMO_UI.LOGIN.ERROR_MSG);
    await expect(error).toBeVisible();
    await expect(error).toContainText(message);
    await expect(this.page).not.toHaveURL(/inventory/);
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  async visitInventory(): Promise<void> {
    await this.page.goto(ROUTES.SAUCEDEMO.INVENTORY);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
  }

  async visitCart(): Promise<void> {
    await this.page.goto(ROUTES.SAUCEDEMO.CART);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.CART.CONTAINER)).toBeVisible();
  }

  // ─── Dashboard / Inventory Assertions ────────────────────────────────────

  async assertInventoryItemCount(count: number): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM)).toHaveCount(count);
  }

  async assertEachItemHasRequiredElements(): Promise<void> {
    const items = this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM);
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      await expect(item.locator("img")).toBeVisible();
      await expect(item.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_NAME)).toBeVisible();
      await expect(item.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_DESC)).toBeVisible();
      await expect(item.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)).toBeVisible();
      await expect(item.getByRole("button", { name: /add to cart/i })).toBeVisible();
    }
  }

  async assertSortDropdownVisible(): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.SORT_DROPDOWN)).toBeVisible();
  }

  async assertCartLinkVisible(): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.HEADER.CART_LINK)).toBeVisible();
  }

  // ─── Inventory Interactions ──────────────────────────────────────────────

  async addToCart(productName: string): Promise<void> {
    const addButton = this.page.getByTestId(SAUCEDEMO_UI.PRODUCT_ITEM.ADD_TO_CART_BTN(productName));

    if (await addButton.count()) {
      await addButton.click();
      return;
    }

    await this.page.getByRole("button", { name: /add to cart/i }).click();
  }

  async removeFromCart(productName: string): Promise<void> {
    const removeButton = this.page.getByTestId(SAUCEDEMO_UI.PRODUCT_ITEM.REMOVE_BTN(productName));

    if (await removeButton.count()) {
      await removeButton.click();
      return;
    }

    await this.page.getByRole("button", { name: /remove/i }).click();
  }

  async sortInventoryBy(option: string): Promise<void> {
    await this.byTestIdOrRole(SAUCEDEMO_UI.INVENTORY.SORT_DROPDOWN, "combobox", /sort/i)
      .first()
      .selectOption(option);
  }

  // ─── Cart Assertions ─────────────────────────────────────────────────────

  async assertCartBadge(expectedCount: number): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.HEADER.CART_BADGE)).toBeVisible();
    await expect(this.page.getByTestId(SAUCEDEMO_UI.HEADER.CART_BADGE)).toHaveText(
      String(expectedCount),
    );
  }

  async assertCartIsEmpty(): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.HEADER.CART_BADGE)).not.toBeVisible();
  }

  // ─── Checkout ────────────────────────────────────────────────────────────

  async proceedToCheckout(): Promise<void> {
    await this.byTestIdOrRole(SAUCEDEMO_UI.CART.CHECKOUT_BTN, "button", /checkout/i)
      .first()
      .click();
  }

  async fillCheckoutInfo(info: {
    firstName: string;
    lastName: string;
    postalCode: string;
  }): Promise<void> {
    await this.byTestIdOrLabel(SAUCEDEMO_UI.CHECKOUT.FIRST_NAME, /first ?name/i)
      .first()
      .fill(info.firstName);
    await this.byTestIdOrLabel(SAUCEDEMO_UI.CHECKOUT.LAST_NAME, /last ?name/i)
      .first()
      .fill(info.lastName);
    await this.byTestIdOrLabel(SAUCEDEMO_UI.CHECKOUT.POSTAL_CODE, /(zip|postal)/i)
      .first()
      .fill(info.postalCode);
    await this.byTestIdOrRole(SAUCEDEMO_UI.CHECKOUT.CONTINUE_BTN, "button", /continue/i)
      .first()
      .click();
  }

  async finishOrder(): Promise<void> {
    await this.byTestIdOrRole(SAUCEDEMO_UI.CHECKOUT.FINISH_BTN, "button", /finish/i)
      .first()
      .click();
  }

  async assertOrderConfirmed(): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.CHECKOUT.COMPLETE_HEADER)).toBeVisible();
    await expect(this.page.getByTestId(SAUCEDEMO_UI.CHECKOUT.COMPLETE_HEADER)).toContainText(
      "Thank you",
    );
  }

  // ─── Cart Page Assertions ─────────────────────────────────────────────────

  async assertCartContains(expectedItems: { name: string; price: string }[]): Promise<void> {
    await expect(this.page).toHaveURL(/cart\.html$/);
    for (const expected of expectedItems) {
      const item = this.page.getByTestId(SAUCEDEMO_UI.CART.ITEM).filter({
        has: this.page.getByTestId(SAUCEDEMO_UI.CART.ITEM_NAME).filter({ hasText: expected.name }),
      });
      await expect(item.getByTestId(SAUCEDEMO_UI.CART.ITEM_NAME)).toHaveText(expected.name);
      await expect(item.getByTestId(SAUCEDEMO_UI.CART.ITEM_PRICE)).toHaveText(expected.price);
      await expect(item.getByTestId(SAUCEDEMO_UI.CART.ITEM_QTY)).toHaveText("1");
    }
  }

  // ─── Checkout Summary Assertions ─────────────────────────────────────────

  async getOrderSummaryTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html$/);
    const subtotalText = await this.page
      .getByTestId(SAUCEDEMO_UI.CHECKOUT.SUBTOTAL_LABEL)
      .textContent();
    const taxText = await this.page.getByTestId(SAUCEDEMO_UI.CHECKOUT.TAX_LABEL).textContent();
    const totalText = await this.page.getByTestId(SAUCEDEMO_UI.CHECKOUT.TOTAL_LABEL).textContent();
    const parse = (text: string | null) => parseFloat((text ?? "").replace(/[^0-9.]/g, ""));
    return { subtotal: parse(subtotalText), tax: parse(taxText), total: parse(totalText) };
  }

  async assertOrderTotalsAreCorrect(expectedItemPrices: number[]): Promise<void> {
    const { subtotal, tax, total } = await this.getOrderSummaryTotals();
    const expectedSubtotal = parseFloat(expectedItemPrices.reduce((a, b) => a + b, 0).toFixed(2));
    const expectedTotal = parseFloat((subtotal + tax).toFixed(2));
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(total).toBeCloseTo(expectedTotal, 2);
  }

  async assertOrderSummaryContains(
    expectedItems: { name: string; price: string }[],
  ): Promise<void> {
    await expect(this.page.getByTestId(SAUCEDEMO_UI.CHECKOUT.SUMMARY_CONTAINER)).toBeVisible();
    for (const expected of expectedItems) {
      const item = this.page.getByTestId(SAUCEDEMO_UI.CART.ITEM).filter({
        has: this.page.getByTestId(SAUCEDEMO_UI.CART.ITEM_NAME).filter({ hasText: expected.name }),
      });
      await expect(item.getByTestId(SAUCEDEMO_UI.CART.ITEM_NAME)).toHaveText(expected.name);
      await expect(item.getByTestId(SAUCEDEMO_UI.CART.ITEM_PRICE)).toHaveText(expected.price);
    }
  }

  // ─── Auth ────────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    await this.page
      .getByRole("button", { name: /open menu/i })
      .or(this.page.getByTestId(SAUCEDEMO_UI.HEADER.MENU_BTN))
      .first()
      .click();
    await this.byTestIdOrRole(SAUCEDEMO_UI.HEADER.LOGOUT_LINK, "link", /logout/i)
      .first()
      .click();
    await expect(this.page).not.toHaveURL(/inventory/);
  }

  async assertLoggedOut(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${ROUTES.SAUCEDEMO.LOGIN}$`));
    await expect(this.page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT)).toBeVisible();
    await expect(this.page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT)).toHaveValue("");
    await expect(this.page.getByTestId(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT)).toHaveValue("");
  }
}
