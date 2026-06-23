# Quick Reference

Technical reference material for quick lookups. Use these when you need to **look something up** (syntax, options, API).

## For Coding Agents 🤖

If you are a coding agent (Claude Code, GitHub Copilot, etc.):

1. **Browser automation:** [playwright-cli Guide](./playwright-cli-agents.md)
   - All 100+ commands with real examples
   - Quick start in 2 minutes
   - Page navigation, element targeting, form interactions
   - Screenshots, network debugging, session management
   - Best practices, troubleshooting, workflows
   - Workspace customizations: `playwright-cli` agent + `playwright-cli-workflow` skill

2. **Running tests locally:** [npm Scripts Reference](./cli-commands.md#npm-scripts-for-test-execution)
   - How to run tests during development
   - Debug mode with automatic code generation
   - Running with tags, specific browsers, different environments

3. **Workflow scripts:** [Workflow Utilities](./workflow-utilities.md)
   - What lives in `scripts/`
   - Which scripts are still worth keeping
   - When to use setup checks vs capture tools

4. **For implementation help:** [Playwright API Cheatsheet](./playwright-api-cheatsheet.md)
   - Common Playwright methods and locators
   - Assertions and wait conditions
   - Best practices for stable tests

## For Humans 👤

For step-by-step guides and tutorials, see:

- **[Getting Started Guides](../01-getting-started/)** — Setup, first test, discovery process
- **[How-to Guides](../02-guides/)** — Recording, debugging, writing tests, selectors, API mocking
- **[Architecture & Patterns](../05-architecture/)** — Three-layer pattern, conventions, anti-patterns

## Reference Guides

| Document                                                        | Purpose                                                   | Best For                                            |
| --------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------- |
| **[playwright-cli Agents](./playwright-cli-agents.md)**         | 100+ `playwright-cli` commands, workflows, best practices | Agent automation, browser control, token efficiency |
| **[CLI Commands](./cli-commands.md)**                           | npm test scripts, simple reference                        | Running tests locally, CI/CD, test execution        |
| **[Workflow Utilities](./workflow-utilities.md)**               | Plain-English guide to `scripts/`                         | Setup, policy checks, and capture workflow review   |
| **[Playwright API Cheatsheet](./playwright-api-cheatsheet.md)** | Common Playwright methods, locators, assertions           | Test implementation, syntax lookup                  |
| **[Configuration Reference](./config-reference.md)**            | All configuration options explained                       | Understanding playwright.config.ts setup            |

The repo-specific agent entry point for CLI work is `.github/agents/playwright-cli.md`.

## Common Tasks & Where to Find Them

| Task                                         | Go To                                                           |
| -------------------------------------------- | --------------------------------------------------------------- |
| Run a test locally                           | [npm Scripts](./cli-commands.md#npm-scripts-for-test-execution) |
| Debug a failing test                         | [npm Scripts Debug](./cli-commands.md#debug--inspection)        |
| Use playwright-cli for browser automation    | [playwright-cli Guide](./playwright-cli-agents.md)              |
| Understand repo workflow scripts             | [Workflow Utilities](./workflow-utilities.md)                   |
| Click elements, fill forms, take screenshots | [playwright-cli](./playwright-cli-agents.md)                    |
| Find a Playwright method                     | [API Cheatsheet](./playwright-api-cheatsheet.md)                |
| Configure playwright.config.ts               | [Configuration Reference](./config-reference.md)                |
| Write a new test                             | [Guides → Writing Tests](../02-guides/writing-tests.md)         |
| Record user interactions                     | [Guides → Recording Tests](../02-guides/recording-tests.md)     |
| Mock API responses                           | [Guides → API Mocking](../02-guides/api-mocking.md)             |

## Quick Command Cheat

```bash
# For agents: playwright-cli automation
npm install -g @playwright/cli@latest
playwright-cli open https://example.com
playwright-cli snapshot                # See element refs
playwright-cli click e15               # Use refs for efficiency
playwright-cli type "hello"
playwright-cli screenshot

# For test execution: npm scripts
npm test                              # All tests
npm run test:debug                    # Debug mode
npm run test:ui                       # Visual UI
npx playwright test --grep @smoke     # By tag
ENV=qa npm test                       # Different env
```

## Architecture Context

This framework uses a **Config → Helpers → Tests** pattern:

- **Config** (`playwright/configs/**`) — All selectors, endpoints, routes
- **Helpers** (`playwright/support/helpers/**`) — Async helper classes per module
- **Tests** (`playwright/tests/**/*.spec.ts`) — Thin test orchestration

See [Three-Layer Pattern](../05-architecture/three-layer-pattern.md) for details.

## Key Rules for Agents

- ✅ Use `playwright-cli` for browser automation (token-efficient)
- ✅ Use the `playwright-cli` agent for CLI-first repo workflows
- ✅ Check [CLI Commands](./cli-commands.md) for all available commands
- ✅ Use element refs from `snapshot` to target elements
- ✅ Prefer `getByRole()` first for accessible, user-facing elements
- ✅ Use `getByTestId()` as a fallback when role-based selection is not stable or meaningful
- ❌ Never hardcode selectors — check `playwright/configs/ui/**`
- ❌ Never hardcode URLs — check `playwright/configs/app/routes.ts`
