/**
 * @fileoverview Codegen handoff.
 *
 * Spawns `npx playwright codegen` against the iteration start URL, writes
 * the generated TypeScript to disk, and applies redaction to the captured
 * file before returning. The user records interactions in the codegen
 * window; on close, the script is read from `--output` and sanitized.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const { redactString, buildPatternList } = require("./redaction");

function stripScriptStrings(source, customPatterns) {
  const patterns = buildPatternList(customPatterns);
  return source
    .split("\n")
    .map((line) => {
      let next = line;
      for (const pattern of patterns) {
        next = next.replace(pattern, "[REDACTED]");
      }
      return next;
    })
    .join("\n");
}

async function runCodegen({
  startUrl,
  storageState,
  outputFile,
  customRedactionPatterns,
  testIdAttribute,
}) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  return new Promise((resolve, reject) => {
    const args = [
      "playwright",
      "codegen",
      "--target=playwright-test",
      `--output=${outputFile}`,
    ];
    if (storageState) args.push(`--load-storage=${storageState}`);
    if (testIdAttribute) args.push(`--test-id-attribute=${testIdAttribute}`);
    args.push(startUrl);

    console.log("");
    console.log("  Launching Playwright codegen...");
    console.log("  Record interactions, then close the inspector window when done.");
    console.log("");

    const child = spawn("npx", args, { stdio: "inherit", shell: process.platform === "win32" });

    child.on("error", (error) => reject(error));
    child.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`codegen exited with code ${code}`));
        return;
      }
      try {
        if (!fs.existsSync(outputFile)) {
          resolve({ recorded: false, file: null });
          return;
        }
        const source = fs.readFileSync(outputFile, "utf8");
        const sanitized = stripScriptStrings(source, customRedactionPatterns);
        fs.writeFileSync(outputFile, sanitized, "utf8");
        resolve({ recorded: true, file: outputFile });
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = { runCodegen };
