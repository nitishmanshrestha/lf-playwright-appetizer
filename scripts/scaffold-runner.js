#!/usr/bin/env node
const { spawnSync } = require("node:child_process");
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

const argv = parseArgs(process.argv.slice(2));
const moduleName = argv.module;
const featureName = argv.feature;
const capture = argv.capture;
const noDdt = argv["no-ddt"] || false;

if (!moduleName || !featureName) {
  console.error(
    "Usage: node scripts/scaffold-runner.js --module <module> --feature <feature> [--capture <capture.json>] [--no-ddt]",
  );
  process.exit(1);
}

const scriptPath = path.join(__dirname, "generate-ddt-scaffold.js");
const args = ["--module", moduleName, "--feature", featureName];
if (capture) {
  args.push("--capture", capture);
}
if (noDdt) {
  args.push("--no-ddt");
}

const res = spawnSync("node", [scriptPath, ...args], { stdio: "inherit" });
process.exit(res.status || 0);
