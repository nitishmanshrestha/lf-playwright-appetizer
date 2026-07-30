import { Page, Response } from "@playwright/test";
import {
  ApiEntry,
  ApiConfig,
  StubResponse,
  WaitOptions,
  registerRoute,
  registerAllRoutes,
  waitForAPI,
  waitForAPIs,
} from "../../core/api";

export class ApiHelpers {
  constructor(private page: Page) {}

  async intercept(apiEntry: ApiEntry, stub?: StubResponse): Promise<void> {
    await registerRoute(this.page, apiEntry, stub);
  }

  async interceptAll(
    apiConfig: ApiConfig,
    options?: {
      stubs?: Record<string, StubResponse>;
      only?: string[];
      except?: string[];
    },
  ): Promise<void> {
    await registerAllRoutes(this.page, apiConfig, options);
  }

  async waitFor(apiEntry: ApiEntry, options?: WaitOptions): Promise<Response> {
    return waitForAPI(this.page, apiEntry, options);
  }

  async waitForAll(entries: ApiEntry[], options?: WaitOptions): Promise<Response[]> {
    return waitForAPIs(this.page, entries, options);
  }

  async stub(apiEntry: ApiEntry, response: StubResponse): Promise<void> {
    await registerRoute(this.page, apiEntry, response);
  }
}
