const fs = require("node:fs");
const path = require("node:path");

function parseArgs(argv) {
  const parsed = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      parsed._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage:
  node bin/generator.js scaffold --module <module> --route <route> [--root <path>] [--force]

Examples:
  node bin/generator.js scaffold --module account --route /account
  node bin/generator.js scaffold --module account --route /account --root ./sandbox
`);
}

function toUpperModuleName(moduleName) {
  return moduleName.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
}

function renderTemplate(template, tokens) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, token) => {
    if (Object.prototype.hasOwnProperty.call(tokens, token)) {
      return String(tokens[token]);
    }
    return match;
  });
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content, overwrite) {
  if (!overwrite && fs.existsSync(filePath)) {
    return false;
  }

  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function readTemplate(templatePath) {
  return fs.readFileSync(templatePath, "utf8");
}

function getTemplateDir() {
  return path.resolve(__dirname, "..", "templates", "module");
}

function getModuleTargets(rootDir, moduleName) {
  return [
    {
      template: "ui.ts.tpl",
      target: path.join(
        rootDir,
        "playwright",
        "configs",
        "ui",
        "modules",
        moduleName,
        `${moduleName}.ui.ts`,
      ),
    },
    {
      template: "helpers.ts.tpl",
      target: path.join(
        rootDir,
        "playwright",
        "support",
        "helpers",
        "modules",
        `${moduleName}.helpers.ts`,
      ),
    },
    {
      template: "smoke.spec.tpl",
      target: path.join(
        rootDir,
        "playwright",
        "tests",
        moduleName,
        "smoke",
        `${moduleName}-smoke.spec.ts`,
      ),
    },
    {
      template: "testdata.json.tpl",
      target: path.join(
        rootDir,
        "playwright",
        "testdata",
        moduleName,
        `${moduleName}.json`,
      ),
    },
  ];
}

function updateRoutesRegistry(rootDir, moduleName, route, overwrite) {
  const routesPath = path.join(rootDir, "playwright", "configs", "app", "routes.ts");
  if (!fs.existsSync(routesPath)) {
    return { updated: false, path: routesPath };
  }

  const moduleKey = toUpperModuleName(moduleName);
  const source = fs.readFileSync(routesPath, "utf8");

  if (source.includes(`const ${moduleKey} = {`)) {
    return { updated: false, path: routesPath };
  }

  const moduleBlock = renderTemplate(readTemplate(path.join(getTemplateDir(), "routes.block.tpl")), {
    MODULE: moduleName,
    MODULE_UPPER: moduleKey,
    ROUTE: route,
  });

  const exportAnchor = "export const ROUTES = {\n";
  if (!source.includes(exportAnchor)) {
    throw new Error(`Could not locate routes registry in ${routesPath}`);
  }

  const updated = source
    .replace(exportAnchor, `${moduleBlock}\n\n${exportAnchor}`)
    .replace(exportAnchor, `${exportAnchor}  ${moduleKey},\n`);

  if (!overwrite && updated === source) {
    return { updated: false, path: routesPath };
  }

  fs.writeFileSync(routesPath, updated, "utf8");
  return { updated: true, path: routesPath };
}

function scaffoldModule({ rootDir, moduleName, route, overwrite = false }) {
  if (!rootDir) throw new Error("rootDir is required");
  if (!moduleName) throw new Error("moduleName is required");
  if (!route) throw new Error("route is required");

  const templateDir = getTemplateDir();
  const tokens = {
    MODULE: moduleName,
    MODULE_UPPER: toUpperModuleName(moduleName),
    ROUTE: route,
  };

  const created = [];
  const updated = [];

  for (const entry of getModuleTargets(rootDir, moduleName)) {
    const templatePath = path.join(templateDir, entry.template);
    const rendered = renderTemplate(readTemplate(templatePath), tokens);
    const wrote = writeFile(entry.target, rendered, overwrite);
    if (wrote) created.push(entry.target);
  }

  const routesResult = updateRoutesRegistry(rootDir, moduleName, route, overwrite);
  if (routesResult.updated) updated.push(routesResult.path);

  return { created, updated };
}

module.exports = {
  parseArgs,
  printHelp,
  renderTemplate,
  scaffoldModule,
  toUpperModuleName,
};
