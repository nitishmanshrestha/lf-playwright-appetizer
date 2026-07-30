# Quickstart — Playwright Boilerplate (Appetizer)

This quickstart helps you run the minimal example module and generator in this repository.

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup

1. Install dependencies:

```bash
npm install
npx playwright install
```

2. Create an environment file from the example and update values:

Unix / macOS:

```bash
cp .env.example .env
```

Windows (cmd.exe):

```cmd
copy .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set `BASE_URL`, `USERNAME`, `PASSWORD`, etc. The test runner loads `.env` by default. For environment-specific files use `.env.<ENV>` and run with `ENV=qa npx playwright test`.

## Run the example smoke test

```bash
npx playwright test playwright/tests/example/smoke --project=chromium
```

## Generate/scaffold a module (CLI)

```bash
node bin/generator.js scaffold --module example --route /example
```

The simplest path is to use the example module end to end first, then add DDT only when a flow clearly needs multiple datasets.

## Notes

- The project reads `.env` by default. Do NOT commit real credentials — use CI variables or secret managers.
- If you need to run only smoke tests use `npm run test:smoke` (the repo uses `--grep @smoke`).
- For debugging: `npm run test:debug` or `npm run test:headed`.

## Troubleshooting

- If Playwright complains about missing browsers, run `npx playwright install` again.
- If TypeScript compile errors occur, ensure `npm install` completed successfully and your editor uses the local `typescript` version.
