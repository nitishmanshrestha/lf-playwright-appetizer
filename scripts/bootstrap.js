#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const { existsSync, copyFileSync, mkdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const envTemplate = path.join(rootDir, "playwright", "environments", ".env.qa.example");
const envFile = path.join(rootDir, ".env");
const mcpConfig = path.join(rootDir, ".vscode", "mcp.json");
const bootstrapEvidenceDir = path.join(rootDir, "playwright", "evidence", "bootstrap");

const evidence = {
  startedAt: new Date().toISOString(),
  finishedAt: "",
  status: "running",
  steps: {
    npmInstall: "pending",
    playwrightInstall: "pending",
    envFile: "pending",
    mcpConfig: "pending",
  },
  details: {
    envTemplatePath: "playwright/environments/.env.qa.example",
    envFilePath: ".env",
    mcpConfigPath: ".vscode/mcp.json",
  },
};

function persistEvidence() {
  mkdirSync(bootstrapEvidenceDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const runFile = path.join(bootstrapEvidenceDir, `bootstrap-${timestamp}.json`);
  const latestFile = path.join(bootstrapEvidenceDir, "latest.json");
  const payload = JSON.stringify(evidence, null, 2);

  writeFileSync(runFile, payload, "utf8");
  writeFileSync(latestFile, payload, "utf8");
}

function runStep(command, args) {
  console.log(`\n[bootstrap] ${command} ${args.join(" ")}`);

  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    evidence.finishedAt = new Date().toISOString();
    evidence.status = "failed";
    persistEvidence();
    process.exit(result.status || 1);
  }
}

console.log("[bootstrap] Starting setup...");
runStep("npm", ["install"]);
evidence.steps.npmInstall = "ok";
runStep("npx", ["playwright", "install"]);
evidence.steps.playwrightInstall = "ok";

if (!existsSync(envFile)) {
  if (existsSync(envTemplate)) {
    copyFileSync(envTemplate, envFile);
    console.log("[bootstrap] Created .env from playwright/environments/.env.qa.example");
    evidence.steps.envFile = "created";
  } else {
    console.warn(
      "[bootstrap] Warning: playwright/environments/.env.qa.example not found. Skipping .env creation.",
    );
    evidence.steps.envFile = "template-missing";
  }
} else {
  console.log("[bootstrap] .env already exists. Leaving it unchanged.");
  evidence.steps.envFile = "existing";
}

if (existsSync(mcpConfig)) {
  console.log("[bootstrap] MCP config found at .vscode/mcp.json");
  evidence.steps.mcpConfig = "found";
} else {
  console.warn("[bootstrap] Warning: .vscode/mcp.json not found.");
  evidence.steps.mcpConfig = "missing";
}

evidence.finishedAt = new Date().toISOString();
evidence.status = "passed";
persistEvidence();

console.log("\n[bootstrap] Setup complete.");
console.log("[bootstrap] Next steps:");
console.log("  1) Review .env values");
console.log("  2) Run npm run test:saucedemo");
console.log("  3) Start MCP from VS Code command palette: MCP: List Servers");
console.log("  4) Review evidence: playwright/evidence/bootstrap/latest.json");
