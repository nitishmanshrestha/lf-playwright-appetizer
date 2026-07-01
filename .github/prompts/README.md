# Prompts — Usage Guide

> These are VS Code Copilot prompt files. Select one from the prompt picker in Copilot Chat to activate it.

---

## How to Use

1. Open **Copilot Chat** (`Ctrl+L`)
2. Click the **prompt picker** (📎 or `/` in chat)
3. Select the prompt you want
4. Fill in the `{{variables}}` when prompted
5. Send — the agent follows the prompt's instructions automatically

---

## Prompt Groups

Quick links:

- MCP-focused guide: [mcp/README.md](mcp/README.md)
- CLI-focused guide: [cli/README.md](cli/README.md)

### Onboarding Prompt

Use this first when adapting the boilerplate to your own application with minimal inputs.

#### `onboard-your-app.prompt.md`

- Purpose: Gather app URL, auth env variable names, routes, and desired test scope, then scaffold Config → Helper → Fixture
- Best for: first-time users who want a guided setup without generating tests yet
- Credentials safety: never asks for credential values; users fill `.env` directly
- Follow-up: write tests using [docs/02-guides/writing-tests.md](../../docs/02-guides/writing-tests.md)

### MCP Prompts

Use these when discovery should happen in a live browser session through MCP.

#### `mcp/scaffold-with-mcp.prompt.md`

- Purpose: Explore → Document → Create → Verify in a 4-tier gated flow
- Best for: unknown features, multi-step journeys, discovery-heavy work
- Requires: MCP server running (`playwright` in VS Code MCP list)
- Recommended post-capture step: `npm run capture:post -- --module <module> --feature <feature> --capture ./capture.json`

### CLI / Manual Prompts

Use these when you do not want MCP exploration and instead provide context from
Playwright CLI codegen or manual selector notes.

#### `cli/scaffold-with-cli.prompt.md`

- Purpose: Use Playwright CLI codegen artifacts plus workflow notes to scaffold tests
- Best for: environments where MCP is unavailable or where teams prefer codegen-first discovery
- Requires: `npm run context:codegen` output or equivalent recorded flow
- Recommended post-capture step: `npm run scaffold:ddt -- --module <module> --feature <feature> --capture ./capture.json`

#### `cli/iterative-cli-collaboration.prompt.md`

- Purpose: Run a fluid human + AI CLI loop with explicit intervention checkpoints
- Best for: iterative workflows where AI executes and distills while humans approve scope and edge-case decisions
- Requires: Playwright CLI access plus a clear goal scenario and project target

#### `cli/scaffold-no-mcp.prompt.md`

- Purpose: Scaffold directly from selectors + workflow provided by user
- Best for: fast updates to known modules, small changes, pre-gathered selector sets
- Requires: no browser automation; user-provided context only

---

## Selection Flow

```text
Need live discovery in browser now?
├── YES → mcp/scaffold-with-mcp.prompt.md
└── NO
    ├── Have codegen output and workflow notes? → cli/scaffold-with-cli.prompt.md
    └── Have selectors/steps only?             → cli/scaffold-no-mcp.prompt.md
```

---

## Common Enforcement (All Prompts)

All prompts inherit framework enforcement from canonical sources:

- `.github/copilot-instructions.md`
- `.github/FRAMEWORK_RULES.md`
- `.github/skills/detect-duplication/SKILL.md`

Prompt files should not restate long rule blocks unless a flow-specific exception is required.

---

## Related Docs

| Topic              | File                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Full workflow      | [docs/workflow.md](../../docs/workflow.md)                                               |
| Workflow utilities | [docs/04-reference/workflow-utilities.md](../../docs/04-reference/workflow-utilities.md) |
| Architecture rules | [docs/framework-standards.md](../../docs/framework-standards.md)                         |
| Helper patterns    | [docs/support-helpers-guide.md](../../docs/support-helpers-guide.md)                     |
| Add a new module   | [docs/framework-maintenance-guide.md](../../docs/framework-maintenance-guide.md)         |
| MCP server config  | [.vscode/mcp.json](../../.vscode/mcp.json)                                               |
