# Selector Strategies

How to find and use the most stable selectors in your application.

---

## Selector Priority Order

```
1. getByRole()     ← Most accessible, semantic
2. getByLabel()    ← Form controls
3. getByText()     ← Non-interactive assertions
4. getByTestId()   ← Explicit test contract (data-testid / data-test)
5. CSS/XPath       ← Avoid if possible
```

---

## 1. getByRole() — Best Choice

### When to Use

- Buttons, links, headings, dialogs, lists
- Anything with a semantic HTML role

### Examples

```typescript
// Button with accessible name
await page.getByRole("button", { name: "Submit" }).click();

// Link
await page.getByRole("link", { name: "Home" }).click();

// Form fields
await page.getByRole("textbox", { name: "Email" }).fill("user@example.com");
await page.getByRole("combobox", { name: "Country" }).selectOption("USA");

// Headings
await expect(
  page.getByRole("heading", { level: 1, name: "Dashboard" }),
).toBeVisible();

// Dialog / Modal
await expect(page.getByRole("dialog")).toBeVisible();
```

### Why It's Best

- ✅ Tests what users see and interact with
- ✅ Fails if accessibility breaks
- ✅ Stable across CSS changes
- ✅ Built into Playwright's locator engine

---

## 2. getByLabel() — Form Labels

### When to Use

Form inputs with associated `<label>` elements.

### Examples

```typescript
await page.getByLabel("First Name").fill("John");
await page.getByLabel("Agree to Terms").check();
await page.getByLabel("Age").selectOption("25");
```

### Why

- ✅ Explicitly tied to form control
- ✅ Stable label text
- ✅ Accessible by design

---

## 3. getByText() — Text Content

### When to Use

- Non-interactive assertions
- Finding elements by exact or partial text

### Examples

```typescript
// Assert text is visible
await expect(page.getByText("Welcome, John")).toBeVisible();

// Click element containing text
await page.getByText("Download Report").click();

// Partial match with regex
await expect(page.getByText(/error occurred/i)).toBeVisible();
```

### When NOT to Use

- Don't use for actions on clickable elements (use getByRole instead)
- Text can change with translations or data

---

## 4. getByTestId() — Fallback

### When to Use

When the element has no semantic role or accessible label.

### Examples

```typescript
// Requires: <div data-testid="dashboard-card">
await expect(page.getByTestId("dashboard-card")).toBeVisible();

// Requires: <span data-testid="item-count">
const count = await page.getByTestId("item-count").textContent();
```

### Attributes to Look For

```html
<!-- Best -->
<input data-testid="login-email" type="email" />

<!-- Also acceptable -->
<input data-test="login-email" type="email" />
```

### When to Create test IDs

If the app doesn't have test IDs:

1. Request them from the dev team
2. Use CSS/XPath temporarily and add an issue
3. Create a test ID in your PR

---

## 5. CSS Selectors — Last Resort

### When to Use

Only when other methods fail (e.g., dynamically generated elements).

### Examples

```typescript
// Avoid if possible
await page
  .locator('div.form-group > input[type="email"]')
  .fill("user@example.com");

// Better — use semantic selector
await page.getByLabel("Email").fill("user@example.com");
```

### Why to Avoid

- ❌ Breaks with minor UI changes
- ❌ Not semantic or accessible
- ❌ Hard to understand intent

---

## 6. Locator Filters & Chains

### Narrow Selections with Filters

```typescript
// Filter by text
await page.getByRole("button").filter({ hasText: "Submit" }).click();

// Filter by containing element
await page
  .getByRole("button")
  .filter({ has: page.getByText("urgent") })
  .click();

// Combine filters
await page
  .getByRole("listitem")
  .filter({ hasText: "Active" })
  .filter({ has: page.getByRole("status") })
  .first()
  .click();
```

### Chain Multiple Locators

```typescript
// Scope to a region, then find
const dialog = page.getByRole("dialog");
await dialog.getByRole("button", { name: "Confirm" }).click();
```

---

## Real-World Examples

### Login Form

```typescript
// Prefer
await page.getByLabel("Email").fill("user@example.com");
await page.getByLabel("Password").fill("password123");
await page.getByRole("button", { name: "Sign In" }).click();

// Avoid
await page.locator("#email-input").fill("user@example.com");
await page.locator("#password-input").fill("password123");
await page.locator("button.btn-primary").click();
```

### Data Table

```typescript
// Prefer — find row with text, then click button
await page
  .getByRole("row")
  .filter({ hasText: "John Doe" })
  .getByRole("button", { name: "Edit" })
  .click();

// Avoid — brittle CSS chain
await page
  .locator("tbody tr")
  .filter((tr) => tr.contains("John"))
  .locator("button")
  .click();
```

### Modal Dialog

```typescript
// Prefer
const dialog = page.getByRole("dialog");
await dialog.getByRole("button", { name: "Confirm" }).click();

// Avoid
await page.locator(".modal").locator("button:nth-child(2)").click();
```
