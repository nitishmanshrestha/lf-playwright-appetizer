#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const { rules: MAP } = require("../.github/doc-impact-map.json");

function parseArgs(argv) {
  const args = { base: null, head: null, files: [] };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--base" && argv[i + 1]) {
      args.base = argv[i + 1];
      i += 1;
      continue;
    }

    if (argv[i] === "--head" && argv[i + 1]) {
      args.head = argv[i + 1];
      i += 1;
      continue;
    }

    if (argv[i] === "--files" && argv[i + 1]) {
      args.files = argv[i + 1]
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((file) => file.replace(/\\/g, "/"));
      i += 1;
    }
  }

  return args;
}

function getChangedFiles(base, head) {
  const normalize = (output) =>
    output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((file) => file.replace(/\\/g, "/"));

  try {
    if (!base || !head) {
      throw new Error("No explicit comparison range");
    }
    const output = execFileSync("git", ["diff", "--name-only", base, head], {
      encoding: "utf8",
    });
    return normalize(output);
  } catch {
    try {
      const porcelain = execFileSync("git", ["status", "--porcelain", "-uall"], {
        encoding: "utf8",
      });

      return [
        ...new Set(
          porcelain
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => line.slice(3).replace(/\\/g, "/")),
        ),
      ];
    } catch {
      return [];
    }
  }
}

function matchesRule(file, rule) {
  if (rule.trigger && rule.trigger.includes(file)) {
    return true;
  }

  if (rule.triggerPrefix) {
    return rule.triggerPrefix.some((prefix) => file.startsWith(prefix));
  }

  return false;
}

function isDocChanged(changedFiles, allowedDocs) {
  return changedFiles.some((file) => allowedDocs.includes(file));
}

function main() {
  const { base, head, files } = parseArgs(process.argv.slice(2));
  const changedFiles = files.length > 0 ? files : getChangedFiles(base, head);

  if (changedFiles.length === 0) {
    console.log("[doc-impact] No file changes detected. If running outside git, use --files.");
    return;
  }

  const failures = [];

  for (const rule of MAP) {
    const hit = changedFiles.some((file) => matchesRule(file, rule));
    if (!hit) {
      continue;
    }

    if (!isDocChanged(changedFiles, rule.docs)) {
      failures.push({
        rule,
        changedTriggers: changedFiles.filter((file) => matchesRule(file, rule)),
      });
    }
  }

  if (failures.length > 0) {
    console.error("[doc-impact] Missing required docs updates for changed framework files:\n");

    for (const failure of failures) {
      console.error(`- Triggered by: ${failure.changedTriggers.join(", ")}`);
      console.error(`  Update at least one of: ${failure.rule.docs.join(", ")}`);
    }

    process.exit(1);
  }

  console.log("[doc-impact] Passed.");
}

main();
