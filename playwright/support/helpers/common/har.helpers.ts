import { Page } from "@playwright/test";
import path from "node:path";

const HAR_DIR = path.resolve(process.cwd(), "playwright", "fixtures", "har");

function resolveHarPath(relativeHarPath: string): string {
  return path.isAbsolute(relativeHarPath) ? relativeHarPath : path.join(HAR_DIR, relativeHarPath);
}

export class HarHelpers {
  constructor(private page: Page) {}

  async replayOrRecord(harRelativePath: string, urlFilter: string | RegExp): Promise<void> {
    await this.page.routeFromHAR(resolveHarPath(harRelativePath), {
      url: urlFilter,
      update: process.env.UPDATE_HAR === "1",
      updateMode: "minimal",
    });
  }

  async replayOrRecordAll(harRelativePath: string, urlFilters: (string | RegExp)[]): Promise<void> {
    for (const urlFilter of urlFilters) {
      await this.replayOrRecord(harRelativePath, urlFilter);
    }
  }
}
