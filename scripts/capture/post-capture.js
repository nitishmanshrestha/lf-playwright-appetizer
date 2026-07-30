#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

function parseArgs(args) {
  const parsed = {};
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) continue;
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

const argv = parseArgs(process.argv.slice(2));
const moduleName = argv.module;
const featureName = argv.feature;
const captureFile =
  argv.capture ||
  path.join(
    process.cwd(),
    "playwright",
    ".feature-context",
    `${moduleName}-${featureName}-capture.json`,
  );
const noDdt = argv["no-ddt"] || false;

if (!moduleName || !featureName) {
  console.error(
    "Usage: node scripts/capture/post-capture.js --module <module> --feature <feature> [--capture <file>] [--no-ddt]",
  );
  process.exit(1);
}

if (!fs.existsSync(captureFile)) {
  console.warn(`Capture file not found: ${captureFile}`);
  const alt = path.join(process.cwd(), "capture.json");
  if (fs.existsSync(alt)) {
    console.log(`Found ${alt}, using it.`);
  } else {
    console.error("No capture artifact found. Aborting post-capture hook.");
    process.exit(0);
  }
}

console.log(
  `Running scaffold-runner for ${moduleName}/${featureName} (capture: ${captureFile})`,
);
const runner = path.join(__dirname, "..", "scaffold-runner.js");
const args = [
  "--module",
  moduleName,
  "--feature",
  featureName,
  "--capture",
  captureFile,
];
if (noDdt) args.push("--no-ddt");

const res = spawnSync("node", [runner, ...args], { stdio: "inherit" });
process.exit(res.status || 0);
