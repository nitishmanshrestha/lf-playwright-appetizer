import { Page, expect } from "@playwright/test";

export class NavigationHelpers {
  constructor(private page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async assertUrl(path: string): Promise<void> {
    const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    await expect(this.page).toHaveURL(new RegExp(escaped));
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
