import { Page, expect } from "@playwright/test";

export class UiHelpers {
  constructor(private page: Page) {}

  async assertVisible(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toBeVisible();
  }

  async assertNotVisible(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).not.toBeVisible();
  }
}
