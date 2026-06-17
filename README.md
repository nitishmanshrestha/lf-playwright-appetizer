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
- `page.getByTestId()` — configured for `data-cy` (customizable per project)
- Multi-environment support (`.env.qa`, `.env.prod`)
- HTML test reports (built-in Playwright reporter)
- Tag-based test filtering via `--grep`
- Trace viewer (auto-capture on first retry)
- TypeScript with path aliases (`@configs`, `@support`, `@core`)

## Documentation

See [docs/README.md](docs/README.md) for full documentation.

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

| Command                   | What it does                                                        |
| ------------------------- | ------------------------------------------------------------------- |
| `npm test`                | Run all tests                                                       |
| `npm run test:smoke`      | Run @smoke tagged tests                                             |
| `npm run test:saucedemo`  | Run saucedemo project                                               |
| `npm run test:ui`         | Open Playwright UI mode                                             |
| `npm run test:debug`      | Run with debugger                                                   |
| `npm run report`          | Open HTML report                                                    |
| `npm run context:codegen` | Open Playwright codegen for CLI-assisted feature context collection |

## License

MIT
