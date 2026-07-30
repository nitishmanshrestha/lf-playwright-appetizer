#!/usr/bin/env node

const path = require("node:path");
const { scaffoldModule, parseArgs, printHelp } = require("../lib/generator");

function main(argv) {
  const args = parseArgs(argv);
  const command = args._[0] || "help";

  if (args.help || command === "help") {
    printHelp();
    return 0;
  }

  if (command !== "scaffold") {
    console.error(`Unknown command: ${command}`);
    printHelp();
    return 1;
  }

  if (!args.module || !args.route) {
    console.error("Missing required flags: --module and --route");
    printHelp();
    return 1;
  }

  const rootDir = args.root ? path.resolve(process.cwd(), args.root) : process.cwd();

  const result = scaffoldModule({
    rootDir,
    moduleName: String(args.module),
    route: String(args.route),
    overwrite: Boolean(args.force),
  });

  for (const createdPath of result.created) {
    console.log(`created ${path.relative(rootDir, createdPath)}`);
  }

  for (const updatedPath of result.updated) {
    console.log(`updated ${path.relative(rootDir, updatedPath)}`);
  }

  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { main };
