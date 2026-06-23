# Playwright Codegen Quick Start

> Step-by-step guide to explore any web app and capture selectors automatically.

---

## 5-Minute Setup

### Step 1: Open Terminal

```bash
cd /path/to/playwright-boilerplate
```

### Step 2: Start Codegen

```bash
npx playwright codegen https://www.saucedemo.com
```

**What you see:**

- 🌐 Browser window opens (your app)
- 📝 Inspector window (code generation panel)

---

## Using Codegen

### What the Inspector Shows

```
┌─────────────────────────────────────────────┐
│  Browser (App you're exploring)             │
│  https://www.saucedemo.com                  │
│                                             │
│  [Username Input Field]                     │
│  [Password Input Field]                     │
│  [Login Button]                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Inspector (Code generation)                │
│                                             │
│  page.goto('https://www...')               │
│  await page.getByTestId('username')        │
│    .fill('standard_user')                   │
│  await page.getByTestId('password')        │
│    .fill('secret_sauce')                    │
│  await page.getByTestId('login-button')    │
│    .click()                                 │
│                                             │
│  Copy the code above to get selectors ✅    │
└─────────────────────────────────────────────┘
```

---

## Interactions & What Codegen Records

### Click an Element

```
You: Click [Login Button]
     ↓
Inspector shows:
  await page.getByTestId('login-button').click()

This tells you:
  - Selector type: data-testid
  - Selector value: "login-button"
  - Action: click
```

### Fill a Form Field

```
You: Type 'standard_user' in username field
     ↓
Inspector shows:
  await page.getByTestId('username').fill('standard_user')

This tells you:
  - Selector: getByTestId('username')
  - Action: fill
  - Value entered: 'standard_user'
```

### Navigate to New URL

```
You: Click a link that goes to /inventory.html
     ↓
Inspector shows:
  await page.goto('https://www.saucedemo.com/inventory.html')
  // OR shows the click that triggered navigation

This tells you:
  - New route discovered: /inventory.html
  - How to get there: click [element name]
```

---

## Discovery Workflow in Codegen

### 1️⃣ Login Page

**In Codegen Browser:**

```
1. Page loads at: https://www.saucedemo.com
2. You see: Username, Password, Login button
3. Actions to record:
   - Click username field
   - Type: standard_user
   - Click password field
   - Type: secret_sauce
   - Click login button
4. Page changes to: /inventory.html
```

**In Inspector, you see:**

```typescript
await page.getByTestId("username").fill("standard_user");
await page.getByTestId("password").fill("secret_sauce");
await page.getByTestId("login-button").click();
```

**What you learned:**

- ✅ Username selector: `data-testid="username"`
- ✅ Password selector: `data-testid="password"`
- ✅ Login button selector: `data-testid="login-button"`
- ✅ URL after login: `/inventory.html`

---

### 2️⃣ Inventory Page

**In Codegen Browser:**

```
1. You're now at: /inventory.html
2. You see: Products, cart badge, sort dropdown
3. Right-click a product name → Inspect Element
4. Look in browser DevTools: What's the data-testid?
   Example: data-testid="inventory-item-name"
5. Actions:
   - Click "Add to cart" for one product
   - Watch cart badge → Did it increment?
   - Click cart link/badge
6. Page changes to: /cart.html
```

**In Inspector:**

```typescript
await page.getByTestId("add-to-cart-sauce-labs-backpack").click();
await page.getByTestId("shopping-cart-badge").click();
```

**What you learned:**

- ✅ Add to cart button: `data-testid="add-to-cart-{product-slug}"`
- ✅ Cart badge: `data-testid="shopping-cart-badge"`
- ✅ Badge increments when you add items
- ✅ Cart accessible via badge click

---

### 3️⃣ Extracting Selector Information

**In Browser DevTools (F12):**

```html
<input type="text" data-testid="username" name="user-name" />
```

**What to note:**

```typescript
// Primary selector (most reliable):
page.getByTestId("username");

// Alternative (fallback):
page.getByLabel(/username/i);
page.locator('input[name="user-name"]');
```

**Priority:**

1. ✅ Prefer `getByRole()` for accessible, user-facing elements (buttons, textboxes, links)
2. ✅ Use `getByLabel()` for form fields with associated labels
3. ✅ Use `getByText()` for non-interactive assertions
4. ✅ Use `getByTestId()` only when semantic selectors don't work or are unstable
5. ❌ Avoid CSS selectors (fragile)

---

## Recording Tips

### ✅ DO This

```
1. Start fresh browser session in codegen
2. Perform ONE action at a time
3. Watch Inspector update after each action
4. Copy the generated code to a text editor
5. Test the selector works (open DevTools console)
6. Document findings in Discovery Template
```

### ❌ DON'T Do This

```
❌ Rapidly clicking multiple elements
   (Inspector can't keep up with your clicks)

❌ Typing too fast
   (Codegen might miss characters)

❌ Navigating to pages you don't intend to test
   (You'll record unnecessary code)

❌ Copying code without understanding it
   (Selectors might be fragile)
```

---

## Validating Selectors

### Test in Browser Console

After codegen captures a selector, **verify it works**:

```javascript
// Open Browser Console (F12)
// Paste and run:

// Test 1: Does the element exist?
document.querySelector('[data-testid="username"]');
// Should return: <input ...> not null

// Test 2: Can you access its value?
document.querySelector('[data-testid="username"]').value;
// Should return: (empty string if empty)

// Test 3: Can you interact with it?
document.querySelector('[data-testid="username"]').focus();
// Should highlight the input field

// ✅ If all three work, the selector is good!
```

---

## Common Selector Issues

### Issue 1: No data-testid Attribute

**You see:**

```html
<button class="btn btn-login">Login</button>
```

**Solution 1 (Preferred):**
Ask developers to add: `data-testid="login-button"`

**Solution 2 (Fallback):**
Use `getByRole`:

```typescript
page.getByRole("button", { name: /login/i });
```

**Note:** This is less stable because:

- Button text might change
- Multiple buttons might have same text
- Internationalization breaks this

---

### Issue 2: Dynamic IDs

**You see:**

```html
<button id="item_12345_remove">Remove</button>
<!-- ID changes every session! -->
```

**Solution:**
Look for data-testid first:

```html
<!-- Better: -->
<button id="item_12345_remove" data-testid="remove-item-sauce-labs-backpack"></button>
```

Use the testid:

```typescript
page.getByTestId("remove-item-sauce-labs-backpack");
```

---

### Issue 3: Element Inside Container

**You see:**

```html
<div data-testid="inventory-item">
  <span data-testid="inventory-item-name">Sauce Labs Backpack</span>
  <span data-testid="inventory-item-price">$29.99</span>
</div>
```

**How to target:**

```typescript
// Get the container
const item = page.getByTestId("inventory-item").first();

// Get specific element inside
const name = item.getByTestId("inventory-item-name");
const price = item.getByTestId("inventory-item-price");

// Better (more specific):
const item = page.getByTestId("inventory-item").filter({ hasText: "Sauce Labs Backpack" });
```

---

## Workflow: Login → Add Item → Checkout

### Step-by-Step in Codegen

```
1. Codegen opens browser at: https://www.saucedemo.com

2. LOGIN:
   ├─ Click username input
   ├─ Type: standard_user
   ├─ Click password input
   ├─ Type: secret_sauce
   └─ Click login button

   Inspector shows: 3 actions with selectors

3. INVENTORY:
   ├─ Click add-to-cart button for Backpack
   ├─ Watch badge change from hidden → "1"
   ├─ Click cart badge
   └─ Browser navigates to /cart.html

   Inspector shows: 2 actions, new route

4. CART:
   ├─ Verify item shown: "Sauce Labs Backpack"
   ├─ Verify price shown: "$29.99"
   ├─ Click checkout button
   └─ Browser navigates to /checkout-step-one.html

   Inspector shows: Click action, new route

5. CHECKOUT FORM:
   ├─ Click first name input
   ├─ Type: Test
   ├─ Click last name input
   ├─ Type: User
   ├─ Click postal code input
   ├─ Type: 12345
   ├─ Click continue button
   └─ Browser navigates to /checkout-step-two.html

   Inspector shows: 4 fill actions, 1 click

6. ORDER SUMMARY:
   ├─ Verify subtotal shown: $29.99
   ├─ Verify total shown: $32.39 (with tax)
   ├─ Click finish button
   └─ Browser navigates to /checkout-complete.html

   Inspector shows: Click action, new route

7. CONFIRMATION:
   ├─ Verify success message visible
   ├─ Verify "Back to Products" button visible
   └─ [End of user flow]
```

**Now you have:**

- ✅ All selectors used in the flow
- ✅ All routes discovered
- ✅ All interactions recorded
- ✅ Code showing exact selectors

---

## Recording the Flow

```bash
# Terminal
npx playwright codegen https://www.saucedemo.com

# In browser: Perform the 7-step workflow above

# In inspector: Copy all the generated code

# Save to a file or text editor for reference
```

**Generated code will look like:**

```typescript
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Step 1: Login
  await page.goto("https://www.saucedemo.com/");
  await page.getByTestId("username").fill("standard_user");
  await page.getByTestId("password").fill("secret_sauce");
  await page.getByTestId("login-button").click();

  // Step 2: Add to cart
  await page.getByTestId("add-to-cart-sauce-labs-backpack").click();
  await page.getByTestId("shopping-cart-badge").click();

  // Step 3: Checkout
  await page.getByTestId("checkout").click();

  // Step 4: Fill form
  await page.getByTestId("firstName").fill("Test");
  await page.getByTestId("lastName").fill("User");
  await page.getByTestId("postalCode").fill("12345");
  await page.getByTestId("continue").click();

  // Step 5: Finish
  await page.getByTestId("finish").click();

  // ✅ You have all selectors and routes!
  await context.close();
  await browser.close();
})();
```

---

## Extract Selectors for Test Framework

From the code above, extract:

```typescript
// Step 1: Create UI Config
// playwright/configs/ui/modules/saucedemo/saucedemo.ui.ts
export const SAUCEDEMO_UI = {
  LOGIN: {
    USERNAME_INPUT: "username",
    PASSWORD_INPUT: "password",
    LOGIN_BTN: "login-button",
  },
  PRODUCT_ITEM: {
    ADD_TO_CART_BTN: (name: string) => `add-to-cart-${name}`,
  },
  CART: {
    BADGE: "shopping-cart-badge",
    CHECKOUT_BTN: "checkout",
  },
  CHECKOUT: {
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    POSTAL_CODE: "postalCode",
    CONTINUE_BTN: "continue",
    FINISH_BTN: "finish",
  },
} as const;

// Step 2: Create Routes
// playwright/configs/app/routes.ts
export const ROUTES = {
  SAUCEDEMO: {
    LOGIN: "/index.html",
    INVENTORY: "/inventory.html",
    CART: "/cart.html",
    CHECKOUT_STEP_1: "/checkout-step-one.html",
    CHECKOUT_STEP_2: "/checkout-step-two.html",
    CONFIRMATION: "/checkout-complete.html",
  },
} as const;
```

---

## Troubleshooting Codegen

| Problem                             | Solution                                                            |
| ----------------------------------- | ------------------------------------------------------------------- |
| **Inspector not recording actions** | Close all other browser windows, restart codegen                    |
| **Selector changes between runs**   | That's a fragile selector — use getByRole or ask devs to add testid |
| **Can't find an element**           | Element might be hidden. Interact with parent first (hover, click)  |
| **Code won't paste into terminal**  | Right-click inspector → Copy code → Paste in editor                 |
| **Codegen closes unexpectedly**     | Network issue or app crashed. Start fresh session                   |

---

## Next Steps

1. ✅ Run codegen against your app
2. ✅ Perform key user flows
3. ✅ Copy generated code
4. ✅ Fill in DISCOVERY_TEMPLATE.md
5. ✅ Share discovery with team for approval
6. ✅ Once approved, create config files + helpers + tests

**Ready?**

```bash
npx playwright codegen https://your-app-url
```

Let's discover! 🚀
