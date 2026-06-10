# Bootstrap and Evidence Guide

## Purpose

This framework includes a one-command bootstrap flow and an evidence mechanism
that records setup/test artifacts in predictable locations.

## Bootstrap Command

```bash
npm run bootstrap
```

Bootstrap performs the following:

1. Installs npm dependencies
2. Installs Playwright browsers
3. Creates `.env` from `playwright/environments/.env.qa.example` if missing
4. Verifies that `.vscode/mcp.json` exists for MCP workflows
5. Writes a JSON evidence artifact for traceability

Bootstrap does not create Playwright auth state by itself; setup specs still need a matching `testMatch` entry in `playwright.config.ts` so the setup project actually executes.

## Evidence Locations

Framework-level paths are defined in:

- `playwright/configs/app/framework-evidence.ts`

Current paths:

- Bootstrap logs: `playwright/evidence/bootstrap/`
- Bootstrap latest pointer: `playwright/evidence/bootstrap/latest.json`
- Playwright run output: `playwright/evidence/tests/output/`
- Playwright HTML report: `playwright/evidence/tests/html-report/`
- Playwright JSON report: `playwright/evidence/tests/results.json`
- Playwright JUnit report: `playwright/evidence/tests/junit.xml`

## Bootstrap Evidence Payload

Each bootstrap run writes a timestamped JSON file containing:

- start/end timestamps
- command step statuses
- `.env` creation decision
- MCP config presence
- overall status (`passed` or `failed`)

This supports onboarding validation and CI troubleshooting.

## Test Evidence Payloads

Each test run now emits multiple evidence artifacts:

- HTML report for human debugging
- JSON report for machine processing and trend analytics
- JUnit XML for CI test reporting integrations
- Trace/screenshots/videos in Playwright output directory (based on runtime settings)

## Recommended Usage in CI

1. Run `npm ci`
2. Run `npm run bootstrap`
3. Archive `playwright/evidence/bootstrap/`
4. Run Playwright tests
5. Archive `playwright/evidence/tests/`
