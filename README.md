# Playwright Automation Boilerplate

> Helper-first Playwright framework built around a strict **Config → Helpers → Tests** separation.
> Fork it, wire in your module, and ship tests that stay stable.

---

## Why This Framework

Most Playwright setups start clean and get messy fast — selectors scattered across tests, auth re-running in every `beforeEach`, AI codegen with no guardrails. This boilerplate is built to prevent that from the start.

| Area              | This Framework                                                   | Typical Alternatives                       |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------ |
| Architecture      | Config → Helpers → Tests (helper-first)                          | Page objects or mixed selectors in tests   |
| Selector strategy | `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()` | Heavy reliance on CSS / XPath              |
| Auth handling     | `storageState` + setup projects — auth runs once                 | Re-login in `beforeEach` (slower, flakier) |
| Test generation   | CLI-assisted discovery + optional DDT scaffolding                | Manual test authoring from scratch         |
| AI layer          | Agent + prompts + post-capture hooks (opt-in)                    | Ad-hoc codegen with no repository rules    |

---

## Get Started

> **Pointing this at your own app?** Follow [ADAPTING.md](ADAPTING.md) first — it walks you through removing sample modules, updating credentials, revamping the config, and scaffolding your first real module. Or ask an AI agent: `/adapt-boilerplate`.

> **Want a simple AI onboarding wrapper (no credentials shared in chat)?** Use [.github/prompts/onboard-your-app.prompt.md](.github/prompts/onboard-your-app.prompt.md) from the Copilot prompt picker. It asks only for URL, auth env variable names, test scope, and routes, then scaffolds the foundation layer.
>
> **Quick chat alias:** type **"onboard my app"** in Copilot Chat.

### Option A — 5 minutes (just validate the setup)

```bash
npm run bootstrap        # installs dependencies + browsers
cp .env.example .env     # copy environment config
npm run test:saucedemo   # run included demo tests
npm run report           # open HTML report
```

You should see tests pass and an HTML report open with results. That's the full loop working.

### Option B — Full walkthrough (learn the workflow end to end)

**Step 1: Discover the feature you want to test**

Read [DISCOVERY.md](DISCOVERY.md), then record a flow with Playwright Codegen:

```bash
npm run context:codegen
```

This opens a browser where you interact with the app. Playwright records every action.

**Step 2: Scaffold from the recording**

```bash
npm run capture:post -- --module <module> --feature <feature> --capture ./capture.json
```

This runs post-capture hooks that produce DDT-aware scaffolding based on what was recorded.

**Step 3: Place the test in the right folder**

Put it under `playwright/tests/<module>/` and follow the Config → Helpers → Tests pattern. See [docs/02-guides/writing-tests.md](docs/02-guides/writing-tests.md).

**Step 4: Run and inspect**

```bash
npm run test:saucedemo
npm run report
```

---

### Option C — AI-driven (let the agent test the app for you)

This is the most hands-off path. Instead of recording manually, you point a Playwright CLI or MCP agent at the app and it discovers, interacts, and generates tests on your behalf — guided by the prompts and rules already baked into this repo.

> Best for: exploring an unfamiliar feature, generating a first-pass test suite quickly, or validating a new module before writing anything by hand.

**Step 1: Point your environment at a running app**

```bash
cp .env.example .env
# Set BASE_URL in .env to wherever the app is running
```

**Step 2: Run the agent in discovery mode**

```bash
npm run context:codegen
```

Or if you are using the MCP workflow with Claude or another agent:

```bash
npm run capture:post -- --module <module> --feature <feature> --capture ./capture.json
```

If using the MCP workflow, log in interactively in the MCP browser first — storageState is not applied to MCP sessions.
The agent navigates the app, captures interactions, and produces a structured capture file. It follows the prompt rules in `.github/prompts/mcp/` — so it respects the framework's selector strategy, naming conventions, and folder structure without you having to prompt it manually.

**Step 3: Review the generated output**

The agent produces a scaffold, not a finished test suite. Your job at this point is to confirm the selectors match the strategy (`getByRole` first, `getByTestId` as fallback), verify the assertions reflect actual business intent rather than just DOM state, and move or rename files if they landed in the wrong folder.

**Step 4: Promote to a real test**

```bash
npm run check:ddt-fixtures   # validate any generated JSON fixtures
npm run test:ui              # step through in UI mode and verify
npm run report               # inspect the full evidence output
```

For full agent usage, MCP configuration, and prompt details see [docs/04-reference/playwright-cli-agents.md](docs/04-reference/playwright-cli-agents.md) and `.github/prompts/mcp/`.

---

## Architecture

```
Config → Helpers → Tests
```

| Layer       | What it contains                  | Rule                                            |
| ----------- | --------------------------------- | ----------------------------------------------- |
| **Config**  | Selectors, API endpoints, routes  | Pure data — `as const`, no logic                |
| **Helpers** | Reusable async methods per module | One class per module, injected via fixtures     |
| **Tests**   | Thin `test()` calls               | Destructure helpers — no raw selectors in tests |

### Where to look first

| What you need              | Where it lives                                                   |
| -------------------------- | ---------------------------------------------------------------- |
| Selectors and UI constants | `playwright/configs/ui/`                                         |
| Routes and API endpoints   | `playwright/configs/app/routes.ts` and `playwright/configs/api/` |
| Helpers                    | `playwright/support/helpers/`                                    |
| Fixtures                   | `playwright/fixtures/base.fixture.ts`                            |
| Test data (DDT)            | `playwright/testdata/`                                           |

---

## What's Included

### Auth

- `storageState` auth — session cached via project dependencies, not re-run per test
- Multi-project setup with `dependencies` — setup runs once, tests run after

### Selectors

- `page.getByRole()` — preferred first choice, accessible and user-facing
- `page.getByTestId()` — stable fallback when semantic selectors aren't enough
- Locator strategy documented and enforced via `npm run check:locator-strategy`

### Test Infrastructure

- Multi-environment support via `.env.qa`, `.env.staging`, `.env.prod`
- Tag-based filtering with `--grep` (`@smoke`, `@regression`, etc.)
- Data-driven testing (DDT) via JSON fixtures in `playwright/testdata/`
- API engine — config-driven route interception with `waitForResponse()`
- TypeScript with path aliases (`@configs`, `@support`, `@core`)

### Reporting and Evidence

- HTML report — built-in Playwright reporter, opens with `npm run report`
- JSON and JUnit outputs for CI integration
- Trace viewer — auto-captured on first retry
- Screenshots on failure

### AI and Agents

- Claude Code integration — see [CLAUDE.md](CLAUDE.md)
- GitHub Copilot configured out of the box
- CLI-first discovery workflow — see [CODEGEN_QUICKSTART.md](CODEGEN_QUICKSTART.md)
- MCP agent hooks — see `.github/prompts/mcp/` and [docs/04-reference/playwright-cli-agents.md](docs/04-reference/playwright-cli-agents.md)

### Reference Modules

- `example/` — full reference implementation (UI config + API config + helpers + spec)
- `saucedemo/` — working tests against a real demo app, runnable immediately

---

## Scripts

### Everyday use

| Command                  | What it does                   |
| ------------------------ | ------------------------------ |
| `npm test`               | Run all tests                  |
| `npm run test:smoke`     | Run `@smoke` tagged tests only |
| `npm run test:saucedemo` | Run the saucedemo project      |
| `npm run test:ui`        | Open Playwright UI mode        |
| `npm run test:debug`     | Run with debugger attached     |
| `npm run report`         | Open the HTML report           |

### Discovery and generation

| Command                                                                       | What it does                                                   |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `npm run bootstrap`                                                           | Install dependencies and browsers — run this on a fresh clone  |
| `npm run context:codegen`                                                     | Open Playwright Codegen for manual browser recording           |
| `npm run scaffold:ddt -- --module <m> --feature <f> --capture ./capture.json` | Generate DDT scaffolding from a captured flow                  |
| `npm run capture:post -- --module <m> --feature <f> --capture ./capture.json` | Run the recommended post-capture hook for MCP-driven discovery |

### Maintenance and validation

| Command                          | What it does                                                     |
| -------------------------------- | ---------------------------------------------------------------- |
| `npm run check:locator-strategy` | Confirm locator usage stays within strategy after helper changes |
| `npm run check:ddt-fixtures`     | Validate JSON fixtures contain required assertion structure      |
| `npm run check:doc-impact`       | Confirm docs were updated after framework-level changes          |

> **Note:** Bootstrap and check scripts are setup and maintenance tools — not required before every test run.

---

## Documentation

| Goal                            | Where to go                                                                              |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Discover and record a flow      | [DISCOVERY.md](DISCOVERY.md), [CODEGEN_QUICKSTART.md](CODEGEN_QUICKSTART.md)             |
| Write a test                    | [docs/02-guides/writing-tests.md](docs/02-guides/writing-tests.md)                       |
| Understand selector strategy    | [docs/02-guides/selector-strategies.md](docs/02-guides/selector-strategies.md)           |
| Understand helpers and fixtures | [docs/support-helpers-guide.md](docs/support-helpers-guide.md)                           |
| Config reference                | [docs/04-reference/config-reference.md](docs/04-reference/config-reference.md)           |
| Workflow utilities              | [docs/04-reference/workflow-utilities.md](docs/04-reference/workflow-utilities.md)       |
| AI agents and MCP               | [docs/04-reference/playwright-cli-agents.md](docs/04-reference/playwright-cli-agents.md) |
| Framework standards             | [docs/framework-standards.md](docs/framework-standards.md)                               |
| Framework maintenance           | [docs/framework-maintenance-guide.md](docs/framework-maintenance-guide.md)               |

Full documentation index: [docs/README.md](docs/README.md)

---

## Roadmap

### Short term

- **Better onboarding** — "First 5 minutes" checklist and a single-page quickstart card
- **DDT scaffolding stability** — stabilize generator heuristics and document an opt-out flag
- **DDT validator in CI** — run `check:ddt-fixtures` as a blocking CI step to catch malformed fixtures before merge

### Medium term

- **Unit tests for generator flows** — mock capture artifacts and assert scaffold outputs
- **Expanded module coverage** — additional reference modules beyond `example/` and `saucedemo/`

### Long term

- **Agent and skill consolidation** — audit `.github/agents` and `.github/skills`, prune duplicates, document the kept set
- **Reporting and retention** — optional nightly CI job producing HTML reports with traces and archived artifacts

---

## Contributing

- Open an issue with your change request
- Send a PR that updates both the relevant docs and adds tests or CI snippets for the change
- Run `npm run check:doc-impact` before submitting to confirm docs coverage

---

## License

MIT
