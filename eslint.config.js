const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "playwright/evidence/**",
      "playwright/.context-capture/**",
      ".playwright-mcp/**",
      "dist/**",
      // GSD Core runtime: installed per person by install-gsd.mjs and gitignored, not project code.
      ".{claude,cursor,codex,github}/gsd-core/**",
      ".{claude,cursor,codex,github}/gsd-migration-journal/**",
      ".{claude,cursor,codex,github}/{agents,commands,hooks}/gsd-*",
      ".{claude,cursor,codex,github}/hooks/lib/**",
      ".{claude,cursor,codex,github}/hooks/managed-hooks-registry.cjs",
      ".{claude,cursor,codex,github}/skills/gsd-*/**",
      ".{claude,cursor,codex,github}/scripts/**",
      ".gsd/**",
      "coverage/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    rules: {},
  },
  {
    // .mjs is ESM by definition — parsing it as commonjs fails on every import.
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
];
