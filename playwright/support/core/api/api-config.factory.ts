/**
 * @fileoverview API Config Factory
 *
 * Generates config-driven API entry objects from a compact module definition.
 *
 * Usage:
 *   export const ORDERS_API = createModuleConfig({
 *     basePath: '/api/orders',
 *     prefix: 'ord',
 *     resources: { orders: ['LIST', 'DETAILS', 'CREATE', 'UPDATE', 'DELETE'] },
 *   });
 */

import { HTTP_STATUS } from "./status-codes";
import type { HttpStatusCode } from "./status-codes";
import type { ApiEntry, ApiConfig } from "./api.engine";

type CrudOperation = "LIST" | "DETAILS" | "CREATE" | "UPDATE" | "DELETE";

interface CrudTemplate {
  method: string;
  endpointSuffix: string;
  aliasSuffix: string;
  keySuffix: string;
  expectedStatus: HttpStatusCode;
}

const CRUD_TEMPLATES: Record<CrudOperation, CrudTemplate> = Object.freeze({
  LIST: {
    method: "GET",
    endpointSuffix: "*",
    aliasSuffix: "Get",
    keySuffix: "_LIST",
    expectedStatus: HTTP_STATUS.OK,
  },
  DETAILS: {
    method: "GET",
    endpointSuffix: "/*",
    aliasSuffix: "GetDetails",
    keySuffix: "_DETAILS",
    expectedStatus: HTTP_STATUS.OK,
  },
  CREATE: {
    method: "POST",
    endpointSuffix: "",
    aliasSuffix: "Create",
    keySuffix: "_CREATE",
    expectedStatus: HTTP_STATUS.CREATED,
  },
  UPDATE: {
    method: "PUT",
    endpointSuffix: "/*",
    aliasSuffix: "Update",
    keySuffix: "_UPDATE",
    expectedStatus: HTTP_STATUS.OK,
  },
  DELETE: {
    method: "DELETE",
    endpointSuffix: "/*",
    aliasSuffix: "Delete",
    keySuffix: "_DELETE",
    expectedStatus: HTTP_STATUS.OK,
  },
}) as unknown as Record<CrudOperation, CrudTemplate>;

interface CustomEntry {
  alias: string;
  method: string;
  endpoint: string;
  expectedStatus?: HttpStatusCode;
}

interface ModuleConfigOptions {
  basePath: string;
  prefix: string;
  resources: Record<string, CrudOperation[]>;
  custom?: Record<string, CustomEntry>;
}

export function createModuleConfig(options: ModuleConfigOptions): ApiConfig {
  const { basePath, prefix, resources, custom = {} } = options;
  const config: Record<string, ApiEntry> = {};

  for (const [resource, operations] of Object.entries(resources)) {
    for (const op of operations) {
      const template = CRUD_TEMPLATES[op];
      if (!template) continue;
      const key = `${resource.toUpperCase()}${template.keySuffix}`;
      const alias = `${prefix}${capitalize(resource)}${template.aliasSuffix}`;
      const endpoint = `**${basePath}/${resource}${template.endpointSuffix}`;
      config[key] = Object.freeze({
        method: template.method,
        endpoint,
        alias,
        expectedStatus: template.expectedStatus,
      });
    }
  }

  for (const [key, entry] of Object.entries(custom)) {
    config[key] = Object.freeze({
      method: entry.method,
      endpoint: `**${entry.endpoint}`,
      alias: entry.alias,
      expectedStatus: entry.expectedStatus ?? HTTP_STATUS.OK,
    });
  }

  return Object.freeze(config) as ApiConfig;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
