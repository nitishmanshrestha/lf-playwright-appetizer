import { Page, Response, Route } from "@playwright/test";
import { HttpStatusCode } from "./status-codes";

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

export const API_TIMEOUT = Object.freeze({
  DEFAULT: 15_000,
  LONG: 30_000,
  SHORT: 5_000,
});

export async function registerRoute(
  page: Page,
  apiEntry: ApiEntry,
  stubResponse?: StubResponse,
): Promise<void> {
  if (!apiEntry?.method || !apiEntry?.endpoint || !apiEntry?.alias) {
    throw new Error("API entry must have method, endpoint, and alias");
  }
  if (!stubResponse) return;

  await page.route(apiEntry.endpoint, async (route: Route) => {
    if (route.request().method() !== apiEntry.method) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: stubResponse.status ?? apiEntry.expectedStatus,
      contentType: stubResponse.contentType ?? "application/json",
      body:
        typeof stubResponse.body === "string"
          ? stubResponse.body
          : JSON.stringify(stubResponse.body ?? {}),
      headers: stubResponse.headers,
    });
  });
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
  for (const entry of Object.values(apiConfig)) {
    if (!entry?.method || !entry?.endpoint || !entry?.alias) continue;
    if (only.length && !only.includes(entry.alias)) continue;
    if (except.includes(entry.alias)) continue;
    const stub = stubs[entry.alias];
    if (stub) await registerRoute(page, entry, stub);
  }
}

export async function waitForAPI(
  page: Page,
  apiEntry: ApiEntry,
  options: WaitOptions = {},
): Promise<Response> {
  const response = await page.waitForResponse(
    (candidate) =>
      matchesEndpoint(candidate.url(), apiEntry.endpoint) &&
      candidate.request().method() === apiEntry.method,
    { timeout: options.timeout ?? API_TIMEOUT.DEFAULT },
  );

  if (options.assertStatus !== false) {
    const expectedStatus = options.expectedStatus ?? apiEntry.expectedStatus;
    if (response.status() !== expectedStatus) {
      throw new Error(
        `[${apiEntry.alias}] Expected status ${expectedStatus}, got ${response.status()}`,
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

function matchesEndpoint(url: string, pattern: string): boolean {
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "___DOUBLE_STAR___")
    .replace(/\*/g, "[^/]*")
    .replace(/___DOUBLE_STAR___/g, ".*")
    .replace(/\?/g, "\\?");
  return new RegExp(regex).test(url);
}
