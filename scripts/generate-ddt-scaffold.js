#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = args[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function usage() {
  console.log(
    "Usage: node scripts/generate-ddt-scaffold.js --module <module> --feature <feature> [--capture <capture.json>] [--no-ddt]",
  );
  process.exit(1);
}

const argv = parseArgs(process.argv.slice(2));
const moduleName = argv.module;
const featureName = argv.feature;
const capturePath = argv.capture;
const noDdt = argv["no-ddt"] || false;

if (!moduleName || !featureName) usage();

function readCapture(cp) {
  if (!cp) return null;
  try {
    const raw = fs.readFileSync(cp, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read capture file, proceeding without it.");
    return null;
  }
}

const capture = readCapture(capturePath);

function isDdtCandidate(cap) {
  if (!cap) return true; // be permissive when no capture provided
  // Heuristic: multiple input-like selectors or explicit example datasets
  const interactions = cap.interactions || [];
  const inputLike = interactions.filter((interaction) =>
    /input|textarea|select/i.test(interaction.type || interaction.action || ""),
  ).length;
  if ((cap.exampleDatasets && cap.exampleDatasets.length > 1) || inputLike >= 2) return true;
  return false;
}

const ddtCandidate = !noDdt && isDdtCandidate(capture);

const repoRoot = path.resolve(__dirname, "..");
const testdataDir = path.join(repoRoot, "playwright", "testdata", moduleName);
const specDir = path.join(repoRoot, "playwright", "tests", moduleName, "smoke");

if (ddtCandidate) {
  if (!fs.existsSync(testdataDir)) fs.mkdirSync(testdataDir, { recursive: true });
  if (!fs.existsSync(specDir)) fs.mkdirSync(specDir, { recursive: true });

  const dataFile = path.join(testdataDir, `${featureName}-data.json`);
  const sampleData = [
    {
      name: "valid-example",
      expectedResult: "success",
    },
    {
      name: "invalid-example",
      expectedResult: "validation-error",
    },
  ];

  fs.writeFileSync(dataFile, JSON.stringify(sampleData, null, 2), "utf8");
  console.log(`Wrote testdata: ${dataFile}`);

  const specFile = path.join(specDir, `${featureName}-ddt.spec.ts`);
  const relDataPath = path.relative(path.dirname(specFile), dataFile).split(path.sep).join("/");
  const specTemplate = `import path from 'path';
import { test, expect } from '../../../fixtures/base.fixture';

const data = require(path.resolve(__dirname, '${relDataPath}'));

for (const item of data) {
  test(\`DDT: ${featureName} - \${item.name}\`, async ({ saucedemoHelpers, page }) => {
    // TODO: Replace with helper calls. Example:
    // await saucedemoHelpers.fillCheckoutForm(item.inputs);
    // await saucedemoHelpers.submit();
    // await expect(page.locator('text=' + item.expected.confirmation)).toBeVisible();
  });
}
`;

  fs.writeFileSync(specFile, specTemplate, "utf8");
  console.log(`Wrote spec: ${specFile}`);
} else {
  console.log("Not a DDT candidate or DDT disabled; no files generated.");
}

process.exit(0);
