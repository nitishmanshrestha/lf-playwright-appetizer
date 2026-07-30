import { HTTP_STATUS } from "./status-codes";
import type { HttpStatusCode } from "./status-codes";
import type { ApiEntry, ApiConfig } from "./api.engine";

type CrudOperation = "LIST" | "LIST_ALL" | "DETAILS" | "CREATE" | "UPDATE" | "DELETE";

const CRUD_TEMPLATES: Record<
  CrudOperation,
  {
    method: string;
    endpointSuffix: string;
    aliasSuffix: string;
    keySuffix: string;
    expectedStatus: HttpStatusCode;
  }
> = {
  LIST: {
    method: "GET",
    endpointSuffix: "?*",
    aliasSuffix: "Get",
    keySuffix: "_LIST",
    expectedStatus: HTTP_STATUS.OK,
  },
  LIST_ALL: {
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
};

interface ModuleConfigOptions {
  basePath: string;
  prefix: string;
  resources: Record<string, CrudOperation[]>;
  custom?: Record<
    string,
    {
      alias: string;
      method: string;
      endpoint: string;
      expectedStatus?: HttpStatusCode;
    }
  >;
}

export function createModuleConfig(options: ModuleConfigOptions): ApiConfig {
  const config: Record<string, ApiEntry> = {};
  for (const [resource, operations] of Object.entries(options.resources)) {
    for (const operation of operations) {
      const template = CRUD_TEMPLATES[operation];
      const key = `${resource.toUpperCase()}${template.keySuffix}`;
      const alias = `${options.prefix}${capitalize(resource)}${template.aliasSuffix}`;
      config[key] = Object.freeze({
        method: template.method,
        endpoint: `**${options.basePath}/${resource}${template.endpointSuffix}`,
        alias,
        expectedStatus: template.expectedStatus,
      });
    }
  }
  for (const [key, entry] of Object.entries(options.custom ?? {})) {
    config[key] = Object.freeze({
      method: entry.method,
      endpoint: `**${entry.endpoint}`,
      alias: entry.alias,
      expectedStatus: entry.expectedStatus ?? HTTP_STATUS.OK,
    });
  }
  return Object.freeze(config);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
