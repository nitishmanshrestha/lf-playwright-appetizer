#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { createInterface } = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

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

function usage() {
  console.log(
    "Usage: node scripts/generate-ddt-scaffold.js --module <module> --feature <feature> [--capture <capture.json>] [--context <context.json>] [--intake <intake.json>] [--verdict DDT_CANDIDATE|NOT_CANDIDATE] [--no-ddt]",
  );
  process.exit(1);
}

const argv = parseArgs(process.argv.slice(2));
const moduleName = argv.module;
const featureName = argv.feature;
const capturePath = argv.capture;
const contextPath = argv.context;
const intakePath = argv.intake;
const noDdt = argv["no-ddt"] || false;
const verdictOverride = argv.verdict || null;

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

function analyzeCapture(cap) {
  if (!cap) {
    return {
      verdict: "UNKNOWN",
      reason: "No capture file available.",
      inputLikeCount: 0,
      exampleDatasetCount: 0,
    };
  }

  const interactions = Array.isArray(cap.interactions) ? cap.interactions : [];
  const inputLikeCount = interactions.filter((interaction) =>
    /input|textarea|select/i.test(
      interaction.type || interaction.action || interaction.role || "",
    ),
  ).length;
  const exampleDatasetCount = Array.isArray(cap.exampleDatasets)
    ? cap.exampleDatasets.length
    : 0;
  const repeatedFlow = exampleDatasetCount >= 3 || inputLikeCount >= 2;

  return {
    verdict: repeatedFlow ? "DDT_CANDIDATE" : "NOT_CANDIDATE",
    reason: repeatedFlow
      ? "Repeated input variations or multiple sample datasets were detected."
      : "The capture does not clearly show repeated input variations.",
    inputLikeCount,
    exampleDatasetCount,
  };
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

function renderSpecTemplate({
  flowTitle,
  moduleName,
  featureName,
  datasetsPath,
}) {
  return `import { test } from "../../../fixtures/base.fixture";
import testData from "${datasetsPath}";

test.describe(${JSON.stringify(flowTitle)}, { tag: ["@smoke", "@${moduleName}"] }, () => {
  for (const tc of testData) {
    test(
      \`${moduleName} ${featureName} - \${tc.name}\`,
      { tag: ["@smoke", "@${moduleName}"] },
      async ({ page }) => {
        // TODO: replay the captured flow with your module helpers.
        // Variation input lives in tc.input.
        // Expected assertions live in tc.expected.
        void page;
        void tc;
      },
    );
  }
});
`;
}

async function askJson(rl, question, fallback) {
  while (true) {
    const answer = (
      await rl.question(
        `${question}${fallback ? ` [${JSON.stringify(fallback)}]` : ""}: `,
      )
    ).trim();
    if (!answer) return fallback;
    try {
      return JSON.parse(answer);
    } catch (error) {
      console.log("Please enter valid JSON.");
    }
  }
}

async function askText(rl, question, fallback = "") {
  const answer = (
    await rl.question(`${question}${fallback ? ` [${fallback}]` : ""}: `)
  ).trim();
  return answer || fallback;
}

async function askList(rl, question, fallback = []) {
  const answer = await askText(
    rl,
    `${question} (comma-separated)`,
    fallback.join(", "),
  );
  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function askYesNo(rl, question, fallback = true) {
  const hint = fallback ? "Y/n" : "y/N";
  const answer = (await rl.question(`${question} (${hint}): `))
    .trim()
    .toLowerCase();
  if (!answer) return fallback;
  return ["y", "yes"].includes(answer);
}

async function collectIntake({
  moduleName: modName,
  featureName: featName,
  analysis,
}) {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log(`DDT analysis: ${analysis.verdict}`);
    console.log(`Reason: ${analysis.reason}`);
    if (analysis.exampleDatasetCount > 0 || analysis.inputLikeCount > 0) {
      console.log(
        `Signals: ${analysis.exampleDatasetCount} dataset hint(s), ${analysis.inputLikeCount} input-like interaction(s)`,
      );
    }

    const businessGoal = await askText(
      rl,
      "What business goal does this test verify?",
      `${modName} ${featName}`,
    );
    const businessLogic = await askText(
      rl,
      "What simple business logic or controller condition affects the result?",
      "",
    );
    const controllerConditions = await askList(
      rl,
      "List any controller conditions or prerequisites",
      [],
    );
    const assertionIntent = await askText(
      rl,
      "What assertions must hold for every variation?",
      "",
    );

    const proceed = await askYesNo(
      rl,
      "Build a DDT scaffold for this flow?",
      analysis.verdict === "DDT_CANDIDATE",
    );
    if (!proceed) {
      return null;
    }

    const flowTitle = await askText(
      rl,
      "Flow title for the spec",
      `${modName} ${featName}`,
    );
    const variationCountRaw = await askText(
      rl,
      "How many variations should we capture?",
      "3",
    );
    const variationCount = Number.parseInt(variationCountRaw, 10);
    const totalVariations =
      Number.isFinite(variationCount) && variationCount > 0
        ? variationCount
        : 3;
    const sharedAssertions = await askYesNo(
      rl,
      "Do all variations share the same expected assertions?",
      true,
    );

    const sharedExpected = sharedAssertions
      ? await askJson(rl, "Shared expected assertions JSON", {
          expectedText: `${featName} completed`,
        })
      : null;

    const datasets = [];
    for (let index = 0; index < totalVariations; index += 1) {
      const label = await askText(
        rl,
        `Variation ${index + 1} name`,
        `${featName}-${index + 1}`,
      );
      const input = await askJson(rl, `Variation ${index + 1} input JSON`, {});
      const expected = sharedAssertions
        ? sharedExpected
        : await askJson(rl, `Variation ${index + 1} expected assertions JSON`, {
            expectedText: `${label} completed`,
          });

      datasets.push({ name: label, input, expected });
    }

    return {
      businessGoal,
      businessLogic,
      controllerConditions,
      assertionIntent,
      flowTitle,
      totalVariations,
      sharedAssertions,
      datasets,
    };
  } finally {
    rl.close();
  }
}

const repoRoot = path.resolve(__dirname, "..");
const testdataDir = path.join(repoRoot, "playwright", "testdata", moduleName);
const specDir = path.join(repoRoot, "playwright", "tests", moduleName, "smoke");
const featureContextDir = path.join(
  repoRoot,
  "playwright",
  ".feature-context",
  moduleName,
  featureName,
);

async function main() {
  const analysis = verdictOverride
    ? {
        verdict: verdictOverride,
        reason: "Verdict supplied via --verdict flag.",
        inputLikeCount: 0,
        exampleDatasetCount: 0,
      }
    : analyzeCapture(capture);
  const candidateEnabled = !noDdt && analysis.verdict !== "NOT_CANDIDATE";

  if (!candidateEnabled) {
    console.log("Not a DDT candidate or DDT disabled; no files generated.");
    return 0;
  }

  const inputContextPath = contextPath || intakePath;
  const intake =
    inputContextPath && fs.existsSync(inputContextPath)
      ? readJsonFile(inputContextPath)
      : await collectIntake({ moduleName, featureName, analysis });
  if (!intake) {
    console.log("DDT scaffold skipped.");
    return 0;
  }

  const datasets = intake.datasets || [];
  if (datasets.length === 0) {
    console.log("No datasets collected. Nothing to scaffold.");
    return 1;
  }

  fs.mkdirSync(testdataDir, { recursive: true });
  fs.mkdirSync(specDir, { recursive: true });
  fs.mkdirSync(featureContextDir, { recursive: true });

  const dataFile = path.join(testdataDir, `${featureName}-data.json`);
  writeJsonFile(dataFile, datasets);
  console.log(`Wrote testdata: ${dataFile}`);

  const contextFile = path.join(
    featureContextDir,
    `${featureName}-ddt-context.json`,
  );
  writeJsonFile(contextFile, {
    module: moduleName,
    feature: featureName,
    businessGoal: intake.businessGoal || "",
    businessLogic: intake.businessLogic || "",
    controllerConditions: intake.controllerConditions || [],
    assertionIntent: intake.assertionIntent || "",
    verdict: analysis.verdict,
    captureSummary: analysis.reason,
    flowTitle: intake.flowTitle,
    totalVariations: intake.totalVariations,
    sharedAssertions: intake.sharedAssertions,
    datasets,
  });

  const summaryFile = path.join(
    featureContextDir,
    `${featureName}-ddt-summary.md`,
  );
  const summaryLines = [
    `# DDT Intake Summary`,
    "",
    `- Module: ${moduleName}`,
    `- Feature: ${featureName}`,
    `- Business goal: ${intake.businessGoal || "(not provided)"}`,
    `- Business logic: ${intake.businessLogic || "(not provided)"}`,
    `- Controller conditions: ${(intake.controllerConditions || []).join(", ") || "(none)"}`,
    `- Assertion intent: ${intake.assertionIntent || "(not provided)"}`,
    `- Verdict: ${analysis.verdict}`,
    `- Flow: ${intake.flowTitle}`,
    `- Variations: ${datasets.length}`,
    `- Shared assertions: ${intake.sharedAssertions ? "yes" : "no"}`,
    "",
    "## Variations",
    ...datasets.flatMap((dataset) => [
      `- ${dataset.name}`,
      `  - input: ${JSON.stringify(dataset.input)}`,
      `  - expected: ${JSON.stringify(dataset.expected)}`,
    ]),
  ];
  fs.writeFileSync(summaryFile, summaryLines.join("\n"), "utf8");

  const specFile = path.join(specDir, `${featureName}-ddt.spec.ts`);
  const relDataPath = path
    .relative(path.dirname(specFile), dataFile)
    .split(path.sep)
    .join("/");
  fs.writeFileSync(
    specFile,
    renderSpecTemplate({
      flowTitle: intake.flowTitle,
      moduleName,
      featureName,
      datasetsPath: relDataPath,
    }),
    "utf8",
  );
  console.log(`Wrote spec: ${specFile}`);
  console.log(`Wrote context: ${contextFile}`);
  console.log(`Wrote summary: ${summaryFile}`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
