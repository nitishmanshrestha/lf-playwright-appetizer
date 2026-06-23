# Application Discovery Workflow

> Before writing a single line of test code, you must understand the application.
> This guide walks engineers through systematic app exploration using Playwright CLI tools.

---

## Why Discovery Matters

**Without Discovery:**

- ❌ Hardcoded wrong selectors (element IDs change, tests break)
- ❌ Missing key user flows (tests don't cover real usage)
- ❌ Test bloat (testing unimportant UI details)
- ❌ Wasted time (coding before understanding the app)

**With Discovery:**

- ✅ Accurate selectors and routes
- ✅ Clear understanding of app behavior
- ✅ Meaningful test coverage
- ✅ Faster test development (no guessing)

---

## Tools You'll Use

| Tool                        | Purpose                                     | When to Use                                |
| --------------------------- | ------------------------------------------- | ------------------------------------------ |
| **Playwright Codegen**      | Record user interactions, capture selectors | First exploration, learning page structure |
| **Playwright Inspector**    | Step through code, inspect elements         | Debugging selector issues                  |
| **Playwright Trace Viewer** | Replay test execution, see what happened    | Understanding test failures                |
| **Browser DevTools**        | Inspect HTML, test selectors                | Validating data-testid attributes          |

---

## Phase 1: Discovery Workflow

### Step 1: Start Codegen Session

```bash
# Terminal: Navigate to project root
cd /path/to/playwright-boilerplate

# Start Playwright codegen against your app
npx playwright codegen https://www.saucedemo.com

# This opens:
# - Browser window (your app running)
# - Inspector window (code/selectors shown as you interact)
```

**What happens:**

- Browser opens with the target app
- Inspector panel on the right shows selectors for each action
- Your interactions are recorded as code

---

### Step 2: Explore Each Page Systematically

#### **Page 1: Login**

In the codegen browser:

```
1. Take a screenshot (for reference)
2. Right-click each input field → Inspect
3. Look for: data-testid, data-test, id, name attributes
4. Document:
   - Username input selector
   - Password input selector
   - Login button selector
   - Error message selector (if visible)
5. Note the URL path: /index.html
6. Try edge cases:
   - Empty username → what error?
   - Empty password → what error?
   - Invalid credentials → what error message?
```

**Inspector shows you:**

```typescript
// When you click the username input, Inspector shows:
page.getByRole("textbox", { name: "username" }); // Most semantic (accessible)
// OR
page.getByLabel(/username/i); // Form fields with labels
// OR
page.getByTestId("username"); // Explicit test hook (fallback)
// Pick the first one that works (preferably getByRole)
```

#### **Page 2: Inventory/Dashboard**

```
1. Log in with valid credentials (in codegen)
2. Document all elements:
   - Product cards: data-testid="inventory-item"
   - Product name: data-testid="inventory-item-name"
   - Add to cart button: data-testid="add-to-cart-{product}"
   - Cart badge: data-testid="shopping-cart-badge"
3. Scroll and check: Are there pagination controls?
4. Try interactions:
   - Click add to cart → button changes state?
   - Badge updates? How does it increment?
5. Note the URL: /inventory.html
```

#### **Page 3: Cart**

```
1. Click cart link/badge from inventory
2. Document:
   - Cart container: data-testid="cart-contents-container"
   - Cart items: data-testid="inventory-item"
   - Item name: data-testid="inventory-item-name"
   - Item price: data-testid="inventory-item-price"
   - Checkout button: data-testid="checkout"
3. Test removal:
   - Click remove on an item
   - Does badge update? How?
4. URL: /cart.html
```

#### **Page 4: Checkout**

```
1. Click Checkout button
2. Form validation:
   - First Name field: Look for data-testid="firstName"
   - Last Name field: data-testid="lastName"
   - Postal Code field: data-testid="postalCode"
   - Continue button: data-testid="continue"
   - Cancel button: data-testid="cancel"
3. Try edge cases:
   - Submit empty form → error messages appear? Where?
   - Submit missing field → specific error per field?
4. URL pattern: /checkout-step-one.html
```

#### **Page 5: Order Summary**

```
1. Fill form and continue (from step above)
2. Document:
   - Order summary container: data-testid="checkout-summary-container"
   - Item list: data-testid="inventory-item"
   - Subtotal: data-testid="subtotal-label"
   - Tax: data-testid="tax-label"
   - Total: data-testid="total-label"
   - Finish button: data-testid="finish"
   - Back to products: data-testid="back-to-products"
3. Note calculations:
   - How is subtotal calculated?
   - What's the tax rate?
   - Verify: total = subtotal + tax
4. URL: /checkout-step-two.html
```

#### **Page 6: Confirmation**

```
1. Click Finish button
2. Document:
   - Success message: data-testid="complete-header"
   - Confirmation text: data-testid="complete-text"
   - Back Home button: data-testid="back-to-products"
3. URL: /checkout-complete.html
```

---

### Step 3: Extract Codegen Output

As you explore, the Inspector **generates actual Playwright code**:

```typescript
// Inspector generates code like this:
page.goto("https://www.saucedemo.com/");
await page.getByTestId("username").fill("standard_user");
await page.getByTestId("password").fill("secret_sauce");
await page.getByTestId("login-button").click();
// ... etc
```

**Copy this code** — it shows the actual selectors the app uses!

---

### Step 4: Validate Selectors Work

For each selector found, **verify it in Browser DevTools**:

```javascript
// Open Browser Console (F12) and test:
document.querySelector('[data-testid="username"]'); // Should return the element

// Or validate the attribute exists:
document.querySelector('[data-testid="username"]').value; // Test you can access it
```

If a selector doesn't work:

- ❌ Element might be dynamically created (hidden, appears on hover)
- ✅ Prefer getByRole or getByLabel first; use data-testid only if semantic selectors are unstable

---

## Phase 2: Create Discovery Document

After exploring, **create a summary** before any coding:

### Discovery Document Template

````markdown
# App Discovery: SauceDemo

## Overview

- **URL:** https://www.saucedemo.com
- **Auth:** Username/password required
- **Main Flows:** Login → Browse → Add to Cart → Checkout → Confirm

## Pages & Routes

| Page            | URL                     | Key Elements                                     |
| --------------- | ----------------------- | ------------------------------------------------ |
| Login           | /index.html             | username, password, login-button, error          |
| Inventory       | /inventory.html         | inventory-item, add-to-cart-\*, cart-badge       |
| Cart            | /cart.html              | inventory-item, checkout                         |
| Checkout Step 1 | /checkout-step-one.html | firstName, lastName, postalCode, continue        |
| Checkout Step 2 | /checkout-step-two.html | subtotal-label, tax-label, total-label, finish   |
| Confirmation    | /checkout-complete.html | complete-header, complete-text, back-to-products |

## Key UI Selectors

### Login Page

```typescript
const LOGIN_UI = {
  USERNAME_INPUT: "username", // data-testid
  PASSWORD_INPUT: "password", // data-testid
  LOGIN_BTN: "login-button", // data-testid
  ERROR_MSG: "error", // data-testid
} as const;
```
````

### Inventory Page

```typescript
const INVENTORY_UI = {
  ITEM: "inventory-item", // data-testid
  ITEM_NAME: "inventory-item-name", // data-testid (inside item)
  ITEM_PRICE: "inventory-item-price", // data-testid (inside item)
  ADD_TO_CART_BTN: (name: string) => `add-to-cart-${name}`, // dynamic
  CART_BADGE: "shopping-cart-badge", // data-testid
} as const;
```

## User Flows

### Happy Path: Complete Purchase

1. Navigate to login page
2. Enter credentials: standard_user / secret_sauce
3. View inventory (6 products)
4. Add item to cart (badge updates)
5. Click cart → view items
6. Click checkout → fill form
7. Continue → see order summary
8. Verify calculations (subtotal + tax = total)
9. Click finish → see confirmation

### Error Paths

1. Login with invalid username → error message appears
2. Login with locked-out user → specific error
3. Checkout without first name → validation error
4. Remove all items → badge disappears

## Calculations to Test

- Subtotal = Sum of item prices
- Tax = Subtotal × 0.08 (or other rate)
- Total = Subtotal + Tax
- Badge count = Number of items in cart

## Test Coverage Recommendation

| Feature                | Type  | Priority |
| ---------------------- | ----- | -------- |
| Login with valid creds | Smoke | Critical |
| Login errors           | E2E   | High     |
| Add to cart            | Smoke | Critical |
| Cart badge updates     | E2E   | High     |
| Checkout validation    | E2E   | High     |
| Price calculations     | E2E   | High     |
| Order confirmation     | Smoke | Critical |

```

---

## Phase 3: Approval Gate

**Before coding any tests**, share the discovery document:

```

To Claude Code (or team):

"I've explored the app and found:

- 6 pages with clear data-testid selectors
- 3 user flows (login, shopping, checkout)
- Key calculations to test (subtotal, tax, total)

My proposed test structure:

1. Smoke tests: login, add to cart, checkout completion (4 tests)
2. E2E tests: error handling, form validation (8 tests)
3. Negative tests: edge cases, boundary values (6 tests)

Total: 18 tests covering critical paths

Should I proceed with implementation?"

```

---

## Phase 4: Implementation (After Approval)

Only AFTER approval, implement in this order:

```

1. playwright/configs/ui/[module]/[module].ui.ts
   └─ Add all selectors from discovery doc

2. playwright/configs/app/routes.ts
   └─ Add all routes from discovery doc

3. playwright/support/helpers/modules/[module].helpers.ts
   └─ Write helper methods for discovered flows

4. playwright/tests/[module]/smoke/[module]-smoke.spec.ts
   └─ Test critical paths

5. playwright/tests/[module]/e2e/[module]-\*.spec.ts
   └─ Test full flows and error cases

````

---

## Tools Configuration

### Enable Playwright CLI in Your Project

Already configured in `.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "Bash(npx *)",  // Allows npx playwright codegen
      "Bash(npm *)"   // Allows npm test
    ]
  }
}
````

### Using Playwright Inspector Programmatically

When running tests in debug mode:

```bash
# Terminal
npm run test:debug

# This opens Inspector with your test code
# Step through, inspect selectors, replay actions
```

---

## Checklist: Before You Code

- [ ] App is accessible (URL works, no auth walls blocking exploration)
- [ ] Codegen session launched: `npx playwright codegen <url>`
- [ ] Explored all main pages (login, dashboard, forms, etc.)
- [ ] Captured all selectors (data-testid preferred)
- [ ] Documented all routes/URLs
- [ ] Created Discovery Document
- [ ] Shared discovery with team/Claude Code for approval
- [ ] Got approval to proceed with implementation
- [ ] Ready to create config files + helpers + tests

---

## Common Issues & Solutions

| Issue                                   | Solution                                                                             |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| **Selector not found in Inspector**     | Element might be dynamic. Try interacting with it (hover, click) first, then inspect |
| **No data-testid attributes**           | Good! Use getByRole, getByLabel, getByText. These are more stable and accessible.    |
| **Dynamic IDs** (e.g., `id="item-123"`) | Use data-testid if available, or filter with hasText/has                             |
| **Can't access app** (network issue)    | Verify URL, check if behind auth, test with curl first                               |
| **Inspector won't record**              | Close other Playwright/browser instances, restart codegen                            |

---

## Next Step

1. **Pick a new feature/app** to discover
2. **Run:** `npx playwright codegen <your-app-url>`
3. **Follow the checklist** above
4. **Create a Discovery Document** (use the template)
5. **Share with Claude Code** for approval before coding

This ensures **every test is built on actual app knowledge**, not guesses. 🚀
