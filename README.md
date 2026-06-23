# Playwright Automation Boilerplate

> A production-ready, helper-first Playwright framework any team can fork, adapt, and ship.
> AI-powered from day one with Claude Code and GitHub Copilot built in.

## Quick Start

```bash
npm install
npx playwright install
cp .env.example .env
npm run test:saucedemo   # Works out of the box
```

## Architecture

```
Config → Helpers → Tests
```

| Layer       | What it contains                  | Rule                                        |
| ----------- | --------------------------------- | ------------------------------------------- |
| **Config**  | Selectors, API endpoints, routes  | Pure data, `as const`, no logic             |
| **Helpers** | Reusable async methods per module | One class per module, injected via fixtures |
| **Tests**   | Thin `test()` calls               | Destructure helpers, no raw selectors       |

## Included Out of the Box

- `example/` module — full reference (UI config + API config + helpers + spec)
- `saucedemo/` module — working tests against a real demo app
- API engine — config-driven route interception with `waitForResponse()`
- `storageState` auth — session-cached via project dependencies
- `page.getByRole()` — preferred first choice for accessible, user-facing selectors
- `page.getByTestId()` — fallback for stable hooks when semantic selectors are not enough
- Multi-environment support (`.env.qa`, `.env.prod`)
- HTML test reports (built-in Playwright reporter)
- Tag-based test filtering via `--grep`
- Trace viewer (auto-capture on first retry)
- TypeScript with path aliases (`@configs`, `@support`, `@core`)

## Documentation

See [docs/README.md](docs/README.md) for full documentation.

## New User Path

If this is your first time in the repo, use this order:

1. Install dependencies and browsers: `npm run bootstrap`
2. Read setup and onboarding: [docs/01-getting-started/README.md](docs/01-getting-started/README.md)
3. Learn the workflow: [docs/04-reference/workflow-utilities.md](docs/04-reference/workflow-utilities.md)
4. Explore the app and selectors: [docs/01-getting-started/discovery-process.md](docs/01-getting-started/discovery-process.md)
5. Run the example suite: `npm run test:saucedemo`

If you are changing framework code, also read:

- [docs/framework-standards.md](docs/framework-standards.md)
- [docs/framework-maintenance-guide.md](docs/framework-maintenance-guide.md)
- [docs/support-helpers-guide.md](docs/support-helpers-guide.md)

## AI Agent Usage

Use the `playwright-cli` agent in chat when you want CLI-first browser automation through the AI workflow:

```text
Use the playwright-cli agent to inspect the checkout flow and capture selectors for a new test.
```

You can also run `playwright-cli` directly in a terminal:

```bash
playwright-cli open https://example.com
playwright-cli snapshot
```

Rule of thumb:

- Chat + agent: best when you want the model to decide the next CLI steps and convert findings into framework code.
- Terminal only: best when you already know the exact `playwright-cli` commands you want to run.

## Scripts

Use these as setup and maintenance tools, not as a required step before every test run.

- `npm run bootstrap` for a new clone or when you need to install dependencies and browsers
- `npm run check:doc-impact` after framework-level changes to confirm the docs were updated
- `npm run check:locator-strategy` after helper changes to confirm locator usage stays safe
- `npm run check:ddt-fixtures` after generating or editing JSON-driven tests to ensure assertion keys exist
- `npm run context:codegen` when you want Playwright Codegen for manual browser recording
- `npm run capture:post -- --module <module> --feature <feature> --capture ./capture.json` after MCP discovery to trigger safe DDT-aware scaffolding

| Command                                                                                  | What it does                                                                       |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm test`                                                                               | Run all tests                                                                      |
| `npm run test:smoke`                                                                     | Run @smoke tagged tests                                                            |
| `npm run test:saucedemo`                                                                 | Run saucedemo project                                                              |
| `npm run test:ui`                                                                        | Open Playwright UI mode                                                            |
| `npm run test:debug`                                                                     | Run with debugger                                                                  |
| `npm run report`                                                                         | Open HTML report                                                                   |
| `npm run context:codegen`                                                                | Open Playwright codegen for CLI-assisted feature context collection                |
| `npm run scaffold:ddt -- --module <module> --feature <feature> --capture ./capture.json` | Generate DDT scaffolding from a captured flow when the generator deems it suitable |
| `npm run capture:post -- --module <module> --feature <feature> --capture ./capture.json` | Run the recommended post-capture hook for MCP-driven discovery                     |
| `npm run check:ddt-fixtures`                                                             | Validate JSON-driven fixtures contain required assertion structure                 |

## License

MIT
