"# Getting Started

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd playwright-automation-boilerplate

# Recommended: one-command setup
npm run bootstrap

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment file (if .env does not exist)
cp playwright/environments/.env.qa.example .env
# Edit .env with your app's baseURL and credentials
```

`npm run bootstrap` is the preferred setup path and writes a setup evidence log
under `playwright/evidence/bootstrap/` for traceability.

See [Bootstrap and Evidence Guide](bootstrap-evidence-guide.md) for details.

## Run Your First Test

```bash
# Run the saucedemo smoke tests (works out of the box)
npm run test:saucedemo

# Open interactive UI mode
npm run test:ui

# Run all tests
npm test

# Run smoke tests only
npm run test:smoke

# See the HTML report
npm run report
```

## Newbie CLI Path

If you are just getting started, use the framework in this order:

1. Run `npm run bootstrap`
2. Read the feature context guide: [Feature Context Guide](feature-capture-guide.md)
3. Create or fill a real folder, for example `playwright/.feature-context/saucedemo/login-logout/`
4. Capture selectors or workflow notes with `npm run context:codegen`
5. Open Copilot and use `.github/prompts/cli/scaffold-with-cli.prompt.md`
6. Run the generated spec with `npm run test:saucedemo` or your target project

Use the CLI path when the flow is mostly known and you want the fastest, least noisy route to a working test. If the UI is still unclear, escalate to MCP later.

If you add a setup spec for cached auth or other prerequisite state, make sure the matching Playwright project in `playwright.config.ts` uses a `testMatch` that includes that file, or the dependency will never run.

What goes in that folder:

- `_feature-brief.md` for the feature goal and scope
- `_workflow.md` for the step-by-step user journey
- `_selectors.md` for the important selectors and route notes
- `_assertions.md` for the expected outcomes
- `_codegen-script.spec.ts` only if you want to keep the generated script as reference

## Create Feature Context for AI-Assisted Test Authoring

Before writing tests for a new feature, retain the feature context in a small
folder the agent can read. Prefer MCP for live discovery; use Playwright CLI
codegen when MCP is unavailable or when you want a recorded interaction script.

### Option 1 — MCP in VS Code (preferred)

1. Start the `playwright` MCP server in VS Code.
2. Explore the feature with the browser tools.
3. Record the feature in a retained context folder such as:
   `playwright/.feature-context/<app>/<module>/<feature>/`
4. Keep short markdown files for the AI to consume:
   - `_feature-brief.md` — business rules and scope
   - `_workflow.md` — user journey and expected assertions
   - `_selectors.md` — important selectors, routes, and state transitions

### Option 2 — Playwright CLI codegen

```bash
npm run context:codegen
```

Use codegen to drive the browser, then save the useful output into the same
feature context folder. Keep the recorded script only as supporting context,
not as the final test architecture.

### Prompting the agent

Point Copilot to the folder and describe the desired coverage:

```
Build helpers + smoke spec for `payments` module.
Context folder: playwright/.feature-context/my-app/payments/refund/
Cover: happy path refund, empty state, readonly-user has no refund button.
```

See [Feature Context Guide](feature-capture-guide.md) for the full workflow.

## Environment Configuration

| Variable             | Purpose               | Default                 |
| -------------------- | --------------------- | ----------------------- |
| `BASE_URL`           | App under test        | `http://localhost:3000` |
| `AUTH_URL`           | Login page path       | `/login`                |
| `USERNAME`           | Default test user     | `admin`                 |
| `PASSWORD`           | Default test password | `password`              |
| `SAUCEDEMO_USERNAME` | Saucedemo user        | `standard_user`         |
| `SAUCEDEMO_PASSWORD` | Saucedemo password    | `secret_sauce`          |

### Multi-Environment

```bash
# Run against QA
ENV=qa npx playwright test

# Run against production
ENV=prod npx playwright test
```

Environment files live in `playwright/environments/.env.[name]`.

## Project Structure

```
playwright/
├── configs/           ← Pure data: selectors, endpoints, routes
├── support/
│   ├── core/api/      ← API engine (do not modify per project)
│   └── helpers/       ← Reusable helper classes (the "commands" layer)
├── fixtures/          ← Custom Playwright fixtures + test data
├── schemas/           ← JSON schema definitions
└── tests/             ← Spec files — thin orchestration only
```

## Adding Your First Module

See [Framework Maintenance Guide](framework-maintenance-guide.md) for the step-by-step checklist.
