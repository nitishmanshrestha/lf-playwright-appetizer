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

/**
 * Register a route handler (intercept) for a single API entry.
 * Must be called BEFORE page.goto() — requests fire the moment the page loads.
 */
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
    // Passthrough route — just let it proceed (used for waitForResponse tracking)
    // No explicit route needed for passthrough; we rely on waitForResponse.
  }
}

/**
 * Register stub routes for all entries in a config object.
 */
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
    if (stub) {
      await registerRoute(page, entry, stub);
    }
  }
}

// ─── Response Waiting ────────────────────────────────────────────────────────

/**
 * Wait for a specific API response matching the entry's method and endpoint pattern.
 * Returns the Response object for further assertion.
 */
export async function waitForAPI(
  page: Page,
  apiEntry: ApiEntry,
  options: WaitOptions = {},
): Promise<Response> {
  const timeout = options.timeout ?? API_TIMEOUT.DEFAULT;

  const response = await page.waitForResponse(
    (resp) =>
      matchesEndpoint(resp.url(), apiEntry.endpoint) &&
      resp.request().method() === apiEntry.method,
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

/**
 * Wait for multiple API responses. Returns array of Response objects.
 */
export async function waitForAPIs(
  page: Page,
  entries: ApiEntry[],
  options: WaitOptions = {},
): Promise<Response[]> {
  return Promise.all(entries.map((entry) => waitForAPI(page, entry, options)));
}

// ─── URL Matching ────────────────────────────────────────────────────────────

/**
 * Match a URL against a glob-style endpoint pattern.
 * Supports ** (any chars including /) and * (any chars except /).
 */
function matchesEndpoint(url: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexStr = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // escape regex special chars (except * and ?)
    .replace(/\*\*/g, "___DOUBLE_STAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___DOUBLE_STAR___/g, ".*")
    .replace(/\?/g, "\\?");

  const regex = new RegExp(regexStr);
  return regex.test(url);
}
