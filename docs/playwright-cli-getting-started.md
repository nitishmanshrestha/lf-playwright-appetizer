# Playwright CLI — Getting Started In This Framework

> Practical setup and usage guide for token-efficient, CLI-first test scaffolding.

---

## Why Playwright CLI Here

Use Playwright CLI when you already know most of the workflow and want lower
context overhead than full MCP exploration.

Use MCP when feature behavior or selectors are still unclear.

---

## Prerequisites

- Node.js 18+
- Project dependencies installed: `npm install`
- Playwright browsers installed: `npx playwright install`

Optional but recommended:

- Global CLI install: `npm install -g @playwright/cli@latest`
- The package name is `@playwright/cli`, but the command is `playwright-cli`.

There is no dedicated Playwright CLI skill in this framework. Use the prompt
files in `.github/prompts/cli/` as the supported entry point.

After installing, verify the command is available:

```bash
playwright-cli --help
```

If that command is not found, the global npm bin directory is likely not on
your PATH. Fix that first before continuing.

If initialization fails with an active Playwright lockfile (for example
`ms-playwright/__dirlock`), either wait for any parallel Playwright install to
finish or remove the stale lock directory and retry:

```bash
rm -R C:/Users/<you>/AppData/Local/ms-playwright/__dirlock
playwright-cli install --skills
```

## Start Here

If you are a beginner, follow this exact loop:

1. Install the CLI globally:

```bash
npm install -g @playwright/cli@latest
```

2. Verify the command works:

```bash
playwright-cli --help
```

3. Open a target page and explore it:

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
```

4. Record the useful parts into a retained context folder such as:

```text
playwright/.feature-context/saucedemo/login-logout/
```

5. Put the important bits into these files:

- `_feature-brief.md`
- `_workflow.md`
- `_selectors.md`
- `_assertions.md`

6. Use the CLI prompt file to scaffold:

```text
.github/prompts/cli/scaffold-with-cli.prompt.md
```

7. Run the generated test and refine the context if needed.

---

## Required Inputs Before Generation

Create a retained context folder:

```text
playwright/.feature-context/<app>/<module>/<feature>/
```

Example:

```text
playwright/.feature-context/saucedemo/login-logout/
```

Minimum files:

- `_feature-brief.md`
- `_workflow.md`
- `_selectors.md`
- `_assertions.md`

Optional:

- `_codegen-script.spec.ts`

---

## CLI-First Workflow

1. Capture interaction reference with the CLI:

```bash
npm run context:codegen
```

2. Distill into markdown context files (do not keep recorder noise).
3. Run CLI prompt flow from Copilot:
   - `.github/prompts/cli/scaffold-with-cli.prompt.md`
4. Validate with target spec:

```bash
npx playwright test playwright/tests/<module>/e2e/<spec>.spec.ts --project=<project> --reporter=list
```

5. Run broader suite if needed:

```bash
npx playwright test --project=<project> --reporter=list
```

---

## Prompt Selection

- Use `scaffold-with-cli.prompt.md` for normal CLI-first generation
- Use `scaffold-no-mcp.prompt.md` for tiny, known changes with supplied selectors
- Use `iterative-cli-collaboration.prompt.md` for fluid human + AI iterations with explicit intervention checkpoints
- Escalate to MCP when selectors/states remain ambiguous after CLI iteration

---

## Essential Commands (CLI)

```bash
playwright-cli open <url>
playwright-cli snapshot
playwright-cli click <ref>
playwright-cli type "text"
playwright-cli requests
playwright-cli state-save <file>
playwright-cli state-load <file>
```

Use only the commands needed for your task; keep context concise.

### Example: Saucedemo Login/Logout

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli snapshot
```

Look for the login fields and the logout flow, then write the distilled notes in:

```text
playwright/.feature-context/saucedemo/login-logout/
```

Use the prompt file with this folder as the input source:

```text
.github/prompts/cli/scaffold-with-cli.prompt.md
```

---

## Framework Guardrails (Always)

- Config → Helpers → Tests order
- No hardcoded selectors/routes when constants exist
- No `page.waitForTimeout()`
- Specs import from `base.fixture.ts`
- Dedup before creating new config/helper/spec files

---

## Recommended Iteration Model

1. Plan from `_workflow.md`
2. Generate from CLI context
3. Run tests
4. Refine context files if assertions fail
5. Escalate to MCP only when ambiguity remains

This sequence gives high throughput with controlled token usage.
