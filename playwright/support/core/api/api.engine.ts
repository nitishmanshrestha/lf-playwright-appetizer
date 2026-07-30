/**
 * @fileoverview API Engine — core route interception and response waiting utilities.
 *
 * Playwright equivalent of the Cypress API engine. Uses page.route() for interception
 * and page.waitForResponse() for deterministic waiting.
 *
 * Consumed by helper functions — not used directly in tests.
 */

import { Page, Response, Route } from "@playwright/test";
import { HttpStatusCode } from "./status-codes";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiEntry {
  method: string;
  endpoint: string;
  alias: string;
  expectedStatus: HttpStatusCode;
}

export interface ApiConfig {
  [key: string]: ApiEntry;
}

export interface StubResponse {
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
}

export interface WaitOptions {
  timeout?: number;
  assertStatus?: boolean;
  expectedStatus?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const API_TIMEOUT = Object.freeze({
  DEFAULT: 15_000,
  LONG: 30_000,
  SHORT: 5_000,
});

// ─── Route Registration ──────────────────────────────────────────────────────

export async function registerRoute(
  page: Page,
  apiEntry: ApiEntry,
  stubResponse?: StubResponse,
): Promise<void> {
  if (!apiEntry?.method || !apiEntry?.endpoint || !apiEntry?.alias) {
    throw new Error("API entry must have method, endpoint, and alias");
  }

  const urlPattern = apiEntry.endpoint;

  if (stubResponse) {
    await page.route(urlPattern, async (route: Route) => {
      if (route.request().method() === apiEntry.method) {
        await route.fulfill({
          status: stubResponse.status ?? apiEntry.expectedStatus,
          contentType: stubResponse.contentType ?? "application/json",
          body:
            typeof stubResponse.body === "string"
              ? stubResponse.body
              : JSON.stringify(stubResponse.body ?? {}),
          headers: stubResponse.headers,
        });
      } else {
        await route.continue();
      }
    });
  } else {
    await page.route(urlPattern, (route: Route) => route.continue());
  }
}

export async function registerAllRoutes(
  page: Page,
  apiConfig: ApiConfig,
  options: {
    stubs?: Record<string, StubResponse>;
    only?: string[];
    except?: string[];
  } = {},
): Promise<void> {
  const { stubs = {}, only = [], except = [] } = options;

  for (const [, entry] of Object.entries(apiConfig)) {
    if (!entry?.method || !entry?.endpoint || !entry?.alias) continue;
    if (only.length && !only.includes(entry.alias)) continue;
    if (except.includes(entry.alias)) continue;

    const stub = stubs[entry.alias] ?? undefined;
    await registerRoute(page, entry, stub);
  }
}

// ─── Response Waiting ────────────────────────────────────────────────────────

export async function waitForAPI(
  page: Page,
  apiEntry: ApiEntry,
  options: WaitOptions = {},
): Promise<Response> {
  const timeout = options.timeout ?? API_TIMEOUT.DEFAULT;

  const response = await page.waitForResponse(
    (resp) => {
      const pattern = new RegExp(
        apiEntry.endpoint
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*\*/g, ".*")
          .replace(/\*/g, "[^/]*")
          .replace(/\?([^=])/g, "\\?$1"),
      );
      return (
        pattern.test(resp.url()) && resp.request().method() === apiEntry.method
      );
    },
    { timeout },
  );

  if (options.assertStatus !== false && apiEntry.expectedStatus != null) {
    const expectedStatus = options.expectedStatus ?? apiEntry.expectedStatus;
    const actual = response.status();
    if (actual !== expectedStatus) {
      throw new Error(
        `[${apiEntry.alias}] Expected status ${expectedStatus}, got ${actual}`,
      );
    }
  }

  return response;
}

export async function waitForAPIs(
  page: Page,
  entries: ApiEntry[],
  options: WaitOptions = {},
): Promise<Response[]> {
  return Promise.all(entries.map((entry) => waitForAPI(page, entry, options)));
}
