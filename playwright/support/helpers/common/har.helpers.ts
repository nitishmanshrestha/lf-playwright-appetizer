/**
 * @fileoverview HAR network replay helpers.
 *
 * Modes:
 *   REPLAY (default) — serves matching requests from the HAR file
 *   RECORD (UPDATE_HAR=1) — lets real network requests through and writes fresh responses
 *
 * Usage:
 *   await this.har.replayOrRecord("payments/list.har", "**\/api/payments**");
 *   await this.page.goto(ROUTES.PAYMENTS.ROOT);
 *
 *   Refresh when API changes: UPDATE_HAR=1 npx playwright test --grep @payments
 *
 * Security note: HAR files capture real responses. Never commit HAR files recorded
 * against production. Review for PII before committing.
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

  async replayOrRecord(
    harRelativePath: string,
    urlFilter: string | RegExp,
  ): Promise<void> {
    const harPath = resolveHarPath(harRelativePath);
    await this.page.routeFromHAR(harPath, {
      url: urlFilter,
      update: isUpdateMode,
      updateMode: "minimal",
    });
  }
}
