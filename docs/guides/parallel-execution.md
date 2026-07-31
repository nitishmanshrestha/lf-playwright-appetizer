# Parallel Execution & Performance

Run tests in parallel to speed up your test suite.

## Why Parallel Execution?

- **Speed:** Run 100 tests in 25 seconds instead of 100 seconds
- **CI/CD:** Complete feedback loop faster
- **Scalability:** Add tests without much impact on total time

Playwright runs tests in parallel by default in your `playwright.config.ts`.

## Configuration

### In `playwright.config.ts`

```typescript
export default defineConfig({
  // Number of worker processes
  workers: process.env.CI ? 1 : undefined, // 1 in CI, auto-detect locally

  // Timeout per test
  timeout: 30000,

  // Timeout per worker
  expect: { timeout: 5000 },

  use: {
    // Other settings...
  },
});
```

## Running Tests in Parallel

```bash
# Run all tests in parallel (default)
npm test

# Run with specific number of workers
npx playwright test --workers=4

# Run sequentially (1 worker)
npx playwright test --workers=1

# Headed mode (slows things down)
npm run test:headed
```

## Best Practices for Parallel Tests

### 1. Make Tests Independent

❌ Bad (tests depend on each other):

```typescript
test('1. Create item', async ({ page }) => { ... });
test('2. Edit item', async ({ page }) => { ... });  // Depends on #1
test('3. Delete item', async ({ page }) => { ... }); // Depends on #2
```

✅ Good (tests are independent):

```typescript
test('should create and edit item', async ({ page }) => {
  const helper = new ItemHelper(page);

  await helper.create('Item');
  await helper.edit('Updated Item');

  await expect(...).toContainText('Updated Item');
});
```

### 2. Use Unique Test Data

❌ Bad (shared data):

```typescript
const testUser = "user@example.com";

test("should create item", async () => {
  // This and other tests might use the same user in parallel
});
```

✅ Good (unique per test):

```typescript
test("should create item", async () => {
  const testUser = `user-${Date.now()}@example.com`;
  // Now each test gets unique data
});
```

### 3. Isolate Browser State

✅ Use fixtures to reset state:

```typescript
// fixtures/base.fixture.ts
export const test = baseTest.extend({
  page: async ({ page }, use) => {
    await page.goto("/");
    // Clear storage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await use(page);

    // Cleanup
    await page.close();
  },
});
```

### 4. Use Database Transactions (if applicable)

For integration tests with real database:

```typescript
test("should create record", async ({ db }) => {
  const transaction = await db.beginTransaction();

  try {
    const record = await transaction.create("users", { email: "test@test.com" });
    // test the record
  } finally {
    await transaction.rollback(); // Clean up automatically
  }
});
```

## Monitoring Parallel Execution

### View Test Workers

```bash
# Show how many workers are running
npx playwright test --workers=4
```

Output:

```
Using 4 workers
✓ tests/auth/login-success.spec.ts (3 tests)
✓ tests/items/create-item.spec.ts (2 tests)
✓ tests/items/delete-item.spec.ts (2 tests)
...
✓ 50 tests passed (35s)
```

### HTML Report

```bash
npm run report
# View in browser: `playwright show-report`
```

The report shows which tests ran on which worker.

## Debugging Parallel Tests

### Run Single Test Sequentially

```bash
# Run one test, one worker
npx playwright test tests/auth/login.spec.ts --workers=1

# Debug mode
npx playwright test tests/auth/login.spec.ts --debug
```

### Run Specific Test Group

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run by file pattern
npx playwright test tests/auth/
```

### Use `--serial` for Specific Tests

If certain tests must run sequentially:

```typescript
test.describe.serial('Sequential group', () => {
  test('first', async ({ page }) => { ... });
  test('second', async ({ page }) => { ... });  // Waits for 'first'
});
```

## Performance Optimization

### 1. Reduce Timeout

If tests are stable, reduce timeout to fail faster:

```typescript
export default defineConfig({
  timeout: 20000, // Down from 30000
});
```

### 2. Parallel by Project

Run projects (browsers) in parallel:

```typescript
export default defineConfig({
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

// Run all: npx playwright test
// Outputs: 50 tests × 3 browsers = 150 tests total, run in parallel
```

### 3. Skip Slow Tests Locally

```typescript
test.skip(process.env.CI !== "true", "Skip slow test locally");

test("very slow test", async ({ page }) => {
  // Only runs in CI
});
```

### 4. Use Lightweight Assertions

❌ Slow:

```typescript
await expect(page).toHaveTitle("Exact Title");
```

✅ Faster:

```typescript
await expect(page.locator("h1")).toBeVisible();
```

## CI/CD Integration

### GitHub Actions Example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm test
        env:
          CI: true
```

### Shard Tests Across Machines

```bash
# Split 10 tests across 2 machines
# Machine 1:
npx playwright test --shard=1/2

# Machine 2:
npx playwright test --shard=2/2
```

Results merge in CI.

## Troubleshooting Parallel Issues

### Tests Fail Intermittently

Usually caused by:

- Shared state (see "Make Tests Independent")
- Unstable selectors (use data-testid)
- Timing issues (use `expect()`, not `waitForTimeout()`)

### Tests Slower in Parallel

Could be:

- Resource contention (reduce `--workers`)
- Network saturation (too many parallel API calls)
- Database locks (see isolation techniques)

### Solution

```bash
# Run with fewer workers
npx playwright test --workers=2

# Or sequentially
npx playwright test --workers=1
```

## Summary

- Make tests independent (no dependencies)
- Use unique test data per test
- Isolate browser state with fixtures
- Monitor with HTML reports
- Debug with `--workers=1`
- Use sharding in CI for distributed testing

See [Three-Layer Architecture](../architecture/three-layer-pattern.md) for how helpers support parallel testing.
