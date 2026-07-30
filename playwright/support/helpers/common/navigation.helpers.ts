/**
 * @fileoverview Navigation helpers.
 *
 * Provides:
 *   nav.goto(path)            — Navigate using route constant
 *   nav.assertUrl(path)       — Assert current URL contains path
 */

import { Page, expect } from "@playwright/test";

export class NavigationHelpers {
  constructor(private page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async assertUrl(path: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
  }
}
