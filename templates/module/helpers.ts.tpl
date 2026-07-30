/**
 * {{MODULE}} module helpers.
 */

import { Page, expect } from "@playwright/test";
import { ROUTES } from "@configs/app/routes";
import { {{MODULE_UPPER}}_UI } from "@configs/ui/modules/{{MODULE}}/{{MODULE}}.ui";

export class {{MODULE_UPPER}}Helpers {
  constructor(private page: Page) {}

  async gotoRoot(): Promise<void> {
    await this.page.goto(ROUTES.{{MODULE_UPPER}}.ROOT);
  }

  async createItem(name: string): Promise<void> {
    await this.page.getByTestId({{MODULE_UPPER}}_UI.FORM.NAME_INPUT_TEST_ID).fill(name);
    await this.page.getByTestId({{MODULE_UPPER}}_UI.FORM.SUBMIT_BUTTON_TEST_ID).click();
    await expect(
      this.page.getByTestId({{MODULE_UPPER}}_UI.LIST.ITEM_TEST_ID).filter({ hasText: name }).first(),
    ).toBeVisible();
  }
}
