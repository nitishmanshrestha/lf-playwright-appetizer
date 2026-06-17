# CLI Commands Reference

Quick reference for **npm test scripts** and `npx playwright test` commands.

> **For Coding Agents?** See [playwright-cli-agents.md](./playwright-cli-agents.md) for detailed `playwright-cli` commands with 100+ examples.

---

## npm Scripts for Test Execution

All npm scripts for running tests in this framework:

| Command                  | Purpose                                       | Example                  |
| ------------------------ | --------------------------------------------- | ------------------------ |
| `npm test`               | Run all tests                                 | `npm test`               |
| `npm run test:smoke`     | Run smoke tests only                          | `npm run test:smoke`     |
| `npm run test:ui`        | Open interactive UI mode (visual test runner) | `npm run test:ui`        |
| `npm run test:debug`     | Debug mode with pause-on-start                | `npm run test:debug`     |
| `npm run test:headed`    | Run tests with browser visible                | `npm run test:headed`    |
| `npm run test:saucedemo` | Run Saucedemo example tests                   | `npm run test:saucedemo` |
| `npm run format`         | Format code with Prettier                     | `npm run format`         |
| `npm run lint`           | Lint code with ESLint                         | `npm run lint`           |
| `npm run lint:fix`       | Fix linting issues automatically              | `npm run lint:fix`       |
| `npm run report`         | Open HTML test report                         | `npm run report`         |

### Running Tests Against Different Environments

```bash
# Run against QA environment
ENV=qa npm test

# Run against staging
ENV=staging npm test

# Run against specific URL
APP_URL=https://example.com npm test

# Run with custom timeout (in milliseconds)
PLAYWRIGHT_TEST_TIMEOUT=60000 npm test
```

### Run Tests by Tag

```bash
# Run tests with specific tag
npx playwright test --grep @smoke

# Run all tests except tagged ones
npx playwright test --grep-invert @skip

# Example with multiple tags
npx playwright test --grep "@regression|@critical"
```

### Browser Control for npm test

```bash
# Run with specific browser only
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with multiple browsers
npx playwright test --project=chromium --project=firefox --project=webkit

# Run with headed browser (visible)
npx playwright test --headed

# Run in headed mode with specific browser
npx playwright test --headed --project=chromium
```

### Debug & Inspection

```bash
# Debug mode (pauses at start, generates code)
npm run test:debug

# Show test trace (trace must exist first)
npx playwright show-trace trace.zip

# Generate trace during test run
npx playwright test --trace=on

# Create detailed trace for failed tests only
npx playwright test --trace=retain-on-failure

# View trace in UI
npx playwright show-trace playwright-report/saucedemo-e2e-saucedemo-can-reach-checkout-saucedemo-trace.zip
```

---

## playwright-cli for Coding Agents

→ **[Read: Complete playwright-cli Guide](./playwright-cli-agents.md)**

All `playwright-cli` commands (100+), real-world workflows, best practices, and troubleshooting are in the dedicated agent guide.

```bash
# Quick preview (see full guide for details)
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e15
playwright-cli screenshot
```

---

## Full Playwright Test CLI Reference

For `npx playwright test` specific options, see:

- [Playwright Test CLI Reference](https://playwright.dev/docs/test-cli)
- [Test Configuration](https://playwright.dev/docs/test-configuration)

---

## Additional Resources

- [playwright-cli Full Documentation](https://playwright.dev/docs/getting-started-cli)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci-intro)
