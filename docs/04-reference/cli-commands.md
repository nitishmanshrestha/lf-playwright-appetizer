# CLI Commands Reference

All npm scripts and Playwright CLI commands for this framework.

## npm Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run test:smoke` | Run smoke tests only |
| `npm run test:ui` | Open UI interactive mode |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:headed` | Run tests with browser visible |
| `npm run test:saucedemo` | Run Saucedemo example tests |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run report` | Open HTML test report |

## Running Tests Against Different Environments

```bash
# Run against QA environment
ENV=qa npm test

# Run against staging
ENV=staging npm test

# Run against specific URL
APP_URL=https://example.com npm test
```

## Run by Tag

```bash
# Run tests with specific tag
npx playwright test --grep @tagname

# Run all except a tag
npx playwright test --grep-invert @skip
```

## Browser Control

```bash
# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run with all browsers
npx playwright test --project=chromium --project=firefox
```

## Debug & Inspection

```bash
# Debug mode (pause on line)
npm run test:debug

# Show test trace
npx playwright show-trace trace.zip

# Generate trace during test run
npx playwright test --trace=on
```

## Additional Options

See full Playwright CLI reference: https://playwright.dev/docs/test-cli
