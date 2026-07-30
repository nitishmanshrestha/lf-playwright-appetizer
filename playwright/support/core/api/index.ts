/**
 * @fileoverview Core API barrel export.
 */

export { HTTP_STATUS, type HttpStatusCode } from "./status-codes";
export {
  registerRoute,
  registerAllRoutes,
  waitForAPI,
  waitForAPIs,
  API_TIMEOUT,
  type ApiEntry,
  type ApiConfig,
  type StubResponse,
  type WaitOptions,
} from "./api.engine";
export { createModuleConfig } from "./api-config.factory";
