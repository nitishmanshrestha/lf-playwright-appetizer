/**
 * Example module helpers — small set of actions used by tests.
 */

import { Page, expect } from "@playwright/test";
import { ROUTES } from "@configs/app/routes";
import { EXAMPLE_UI } from "@configs/ui/modules/example/example.ui";

export class ExampleHelpers {
  constructor(private page: Page) {}

  async gotoList(): Promise<void> {
    await this.page.goto(ROUTES.EXAMPLE.ROOT);
  }

  async createItem(name: string): Promise<void> {
    await this.page.getByTestId(EXAMPLE_UI.FORM.NAME_INPUT_TEST_ID).fill(name);
    await this.page.getByTestId(EXAMPLE_UI.FORM.SUBMIT_BUTTON_TEST_ID).click();
    // Wait for the item to appear in the list
    await expect(
      this.page
        .getByTestId(EXAMPLE_UI.LIST.ITEM_TEST_ID)
        .filter({ hasText: name })
        .first(),
    ).toBeVisible();
  }

  async assertItemVisible(name: string): Promise<void> {
    await expect(
      this.page
        .getByTestId(EXAMPLE_UI.LIST.ITEM_TEST_ID)
        .filter({ hasText: name })
        .first(),
    ).toBeVisible();
  }
}
