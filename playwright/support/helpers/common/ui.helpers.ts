/**
 * @fileoverview UI utility helpers.
 * locator-strategy: legacy-file
 *
 * Provides:
 *   ui.assertVisible(testId)       — Assert element with test-id is visible
 *   ui.assertNotVisible(testId)    — Assert element with test-id is not visible
 *   ui.assertToast(message)        — Assert toast/notification text
 *   ui.assertLoadingComplete()     — Wait for loading spinners to disappear
 *   ui.closeModal()                — Close an open modal dialog
 */

import { FEEDBACK_UI } from "@configs/ui/shared/feedback.ui";
import { Locator, Page, expect } from "@playwright/test";

export class UiHelpers {
  constructor(private page: Page) {}

  private getByAnyTestId(testIds: readonly string[]): Locator {
    const pattern = testIds
      .map((testId) => testId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    return this.page.getByTestId(new RegExp(`^(?:${pattern})$`, "i"));
  }

  async assertVisible(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).toBeVisible();
  }

  async assertNotVisible(testId: string): Promise<void> {
    await expect(this.page.getByTestId(testId)).not.toBeVisible();
  }

  async assertToast(message: string): Promise<void> {
    const toast = this.getByAnyTestId(FEEDBACK_UI.TOAST.TEST_IDS)
      .or(this.page.getByRole(FEEDBACK_UI.TOAST.ROLE))
      .filter({ hasText: message });
    await expect(toast.first()).toBeVisible();
  }

  async assertLoadingComplete(): Promise<void> {
    await expect(this.page.getByTestId(FEEDBACK_UI.LOADING.TEST_ID_PATTERN)).toHaveCount(0, {
      timeout: FEEDBACK_UI.LOADING.TIMEOUT_MS,
    });
  }

  async closeModal(): Promise<void> {
    await this.getByAnyTestId(FEEDBACK_UI.MODAL.CLOSE_BUTTON_TEST_IDS)
      .or(
        this.page.getByRole("button", {
          name: FEEDBACK_UI.MODAL.CLOSE_BUTTON_NAME_PATTERN,
        }),
      )
      .first()
      .click();
    const modal = this.getByAnyTestId(FEEDBACK_UI.MODAL.CONTAINER_TEST_IDS).or(
      this.page.getByRole(FEEDBACK_UI.MODAL.CONTAINER_ROLE),
    );
    await expect(modal.first()).not.toBeVisible();
  }
}
