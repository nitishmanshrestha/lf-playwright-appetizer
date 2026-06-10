/**
 * @fileoverview HAR network replay helpers.
 *
 * Playwright can record real API responses to a HAR file and replay them in
 * future runs — zero mocking boilerplate, zero running server required.
 *
 * ─── Modes ────────────────────────────────────────────────────────────────
 *
 * REPLAY (default, CI)
 *   Serves matching requests from the HAR file. The network never fires.
 *   Tests are deterministic, fast, and offline-safe.
 *
 * RECORD (UPDATE_HAR=1)
 *   Lets real network requests through AND writes fresh responses to the
 *   HAR file. Run this when the API has changed to refresh the HAR.
 *
 * ─── Usage ────────────────────────────────────────────────────────────────
 *
 *   // 1. In a module helper — set up HAR before navigation:
 *   async visitListWithHAR(): Promise<void> {
 *     await this.har.replayOrRecord(HAR.PAYMENTS.LIST, "**\/api/payments**");
 *     await this.page.goto(ROUTES.PAYMENTS.ROOT);
 *   }
 *
 *   // 2. Refresh when API changes:
 *   UPDATE_HAR=1 npx playwright test --grep @payments
 *
 * ─── HAR file storage ────────────────────────────────────────────────────
 *   playwright/fixtures/har/<module>/<name>.har
 *
 * ─── Security note ───────────────────────────────────────────────────────
 *   HAR files capture real responses. Run `UPDATE_HAR=1` only against
 *   non-production environments. Review HAR files for PII before committing.
 *   Never commit HAR files that were recorded against production.
 */

import { Page } from "@playwright/test";
import path from "path";

const HAR_DIR = path.resolve(process.cwd(), "playwright", "fixtures", "har");

function resolveHarPath(relativeHarPath: string): string {
  if (path.isAbsolute(relativeHarPath)) return relativeHarPath;
  return path.join(HAR_DIR, relativeHarPath);
}

const isUpdateMode = process.env.UPDATE_HAR === "1";

export class HarHelpers {
  constructor(private page: Page) {}

  /**
   * Sets up HAR replay (or recording) for a URL pattern BEFORE navigation.
   *
   * Must be called before `page.goto()` — exactly like `waitForResponse()`.
   *
   * @param harRelativePath - Path relative to `playwright/fixtures/har/`
   *                          e.g. `"payments/list.har"`
   * @param urlFilter       - Glob or regex for which requests the HAR covers
   *                          e.g. `"**\/api/payments**"`
   *
   * @example
   * await this.har.replayOrRecord("payments/list.har", "**\/api/payments**");
   * await this.page.goto(ROUTES.PAYMENTS.ROOT);
   */
  async replayOrRecord(harRelativePath: string, urlFilter: string | RegExp): Promise<void> {
    const harPath = resolveHarPath(harRelativePath);

    await this.page.routeFromHAR(harPath, {
      url: urlFilter,
      update: isUpdateMode,
      updateMode: "minimal",
    });
  }

  /**
   * Sets up HAR replay for multiple URL patterns from a single HAR file.
   *
   * @example
   * await this.har.replayOrRecordAll("payments/detail.har", [
   *   "**\/api/payments/**",
   *   "**\/api/users/**",
   * ]);
   * await this.page.goto(ROUTES.PAYMENTS.DETAIL("123"));
   */
  async replayOrRecordAll(
    harRelativePath: string,
    urlFilters: (string | RegExp)[],
  ): Promise<void> {
    const harPath = resolveHarPath(harRelativePath);
    for (const urlFilter of urlFilters) {
      await this.page.routeFromHAR(harPath, {
        url: urlFilter,
        update: isUpdateMode,
        updateMode: "minimal",
      });
    }
  }
}
