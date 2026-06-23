#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const testdataRoot = path.join(rootDir, "playwright", "testdata");

function hasAssertionKeys(dataset) {
  if (dataset.expected && typeof dataset.expected === "object") {
    return Object.keys(dataset.expected).length > 0;
  }

  return Object.keys(dataset).some((key) => key.startsWith("expected") || key.startsWith("should"));
}

function getJsonFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...getJsonFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateFixture(filePath) {
  const relativePath = path.relative(rootDir, filePath).split(path.sep).join("/");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return [`${relativePath}: fixture must export a JSON array.`];
  }

  const errors = [];

  parsed.forEach((dataset, index) => {
    const prefix = `${relativePath}[${index}]`;

    if (!dataset || typeof dataset !== "object" || Array.isArray(dataset)) {
      errors.push(`${prefix}: each dataset must be a JSON object.`);
      return;
    }

    if (!hasAssertionKeys(dataset)) {
      errors.push(
        `${prefix}: dataset must include assertion data via a non-empty 'expected' object or a top-level key starting with 'expected' or 'should'.`,
      );
    }
  });

  return errors;
}

try {
  const files = getJsonFiles(testdataRoot);
  const allErrors = [];

  for (const filePath of files) {
    allErrors.push(...validateFixture(filePath));
  }

  if (allErrors.length > 0) {
    console.error("[check:ddt-fixtures] Validation failed:\n");
    for (const error of allErrors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`[check:ddt-fixtures] Validated ${files.length} JSON fixture file(s).`);
} catch (error) {
  console.error(`[check:ddt-fixtures] ${error.message}`);
  process.exit(1);
}
