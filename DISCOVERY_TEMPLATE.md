# Application Discovery Template

> Copy this template and fill it in as you explore a new application.
> Use Playwright Codegen to interact with the app and capture selectors.

**Project Name:** ________________  
**App URL:** ________________  
**Explorer Name:** ________________  
**Date:** ________________  

---

## 1. QUICK OVERVIEW

**What does this app do?**
_[Describe the main purpose in 1-2 sentences]_

**Authentication Required?** ☐ Yes ☐ No  
**Test Credentials:**
```
Username: _________________
Password: _________________
```

**Key User Journey:**
_[Main flow: e.g., "Sign up → Create post → Like posts → Logout"]_

---

## 2. PAGE INVENTORY

For **each page** in the app, fill in one section:

### PAGE 1: [Name - e.g., Login]

**URL Path:** `/___________`

**Screenshot:** (attach or describe)

**Key Elements:**

| Element | Purpose | Selector Type | Value | Status ✅ |
|---------|---------|---------------|-------|----------|
| [Name] | [What it does] | data-testid / data-test / id / name | [Value] | Working? |
| Username Input | User login | data-testid | "username" | ✅ |
| Login Button | Submit form | data-testid | "login-button" | ✅ |
| Error Message | Auth failure | data-testid | "error" | ✅ |
| | | | | |

**Interactions to Test:**
- [ ] Field validation (required, format)
- [ ] Error messages (invalid login, missing field)
- [ ] Success path (valid credentials)
- [ ] Accessibility (labels, tab order)

**Edge Cases Found:**
- _[e.g., "What if username is >50 chars?"]_
- _[e.g., "Does form reset on logout?"]_

---

### PAGE 2: [Name - e.g., Dashboard]

**URL Path:** `/___________`

**Screenshot:** (attach or describe)

**Key Elements:**

| Element | Purpose | Selector Type | Value | Status ✅ |
|---------|---------|---------------|-------|----------|
| | | | | |
| | | | | |
| | | | | |

**Interactions to Test:**
- [ ] 
- [ ] 
- [ ] 

**Edge Cases Found:**
- _[...]_
- _[...]_

---

### PAGE 3: [Name]

**URL Path:** `/___________`

**Key Elements:**

| Element | Purpose | Selector Type | Value | Status ✅ |
|---------|---------|---------------|-------|----------|
| | | | | |
| | | | | |

**Interactions to Test:**
- [ ] 
- [ ] 

**Edge Cases Found:**
- _[...]_

---

## 3. ROUTES REFERENCE

Complete list of URLs found:

```typescript
const ROUTES = {
  APP: {
    [MODULE_1]: {
      ROOT: "/path1",
      DETAIL: "/path1/:id",
      CREATE: "/path1/new",
    },
    [MODULE_2]: {
      ROOT: "/path2",
      // ...
    },
  },
} as const;
```

---

## 4. KEY FLOWS TO TEST

### Flow 1: [Happy Path - e.g., "Complete Purchase"]

**Steps:**
1. [ ] Navigate to [page]
2. [ ] [Action 1]
3. [ ] [Action 2]
4. [ ] Verify [result]

**Expected Outcome:**
_[What should the user see?]_

**Testable Assertions:**
- URL changes to: `[expected path]`
- Element visible: `[data-testid]`
- Text contains: `[expected message]`
- Badge/count updates: `[from X to Y]`

---

### Flow 2: [Error Path - e.g., "Login Fails"]

**Steps:**
1. [ ] Navigate to [page]
2. [ ] [Action 1 with invalid data]
3. [ ] Observe [error]

**Expected Error Message:**
_[Exact text or pattern]_

**Testable Assertions:**
- Error message appears: `[selector]` contains `[text]`
- Form doesn't submit: Still on URL `[path]`
- Field highlights: `[selector]` has error class

---

## 5. DATA & CALCULATIONS

**If app performs calculations, document them:**

```
Calculation: [e.g., "Total = Subtotal + Tax"]

Test with data:
- Item 1: $10.00
- Item 2: $15.00
- Subtotal: $25.00
- Tax Rate: 8%
- Tax: $2.00
- Total: $27.00 ✅ (verify this in the UI)
```

**Other Calculations:**
- _[...]_
- _[...]_

---

## 6. DYNAMIC/TRICKY SELECTORS

Some elements might be hard to find. Document them:

```typescript
// ❌ DON'T USE (too fragile):
page.locator('button:nth-child(3)')  // What if order changes?

// ✅ USE INSTEAD:
page.getByTestId("add-to-cart-product-123")  // Explicit, stable

// IF data-testid doesn't exist:
page.getByRole("button", { name: "Add to Cart" })  // User-facing text
```

**Tricky Elements Found:**
- Element: _[what it is]_
- Why tricky: _[why hard to find]_
- Best selector: _[data-testid / getByRole / etc.]_
- Fallback: _[if primary selector fails]_

---

## 7. MISSING SELECTORS

**Elements WITHOUT data-testid:**

| Element | Current Selector | Why Used | Fragile? |
|---------|-----------------|----------|----------|
| [Button] | getByRole("button", { name: "..." }) | No testid | ⚠️ If text changes |
| [Text] | getByText("...") | No testid | ⚠️ If text changes |
| [Form] | locator('[name="..."]') | id/name attr | ✅ Stable |

**Recommendation:**
- [ ] Ask dev team to add data-testid to missing elements
- [ ] Use fallback selectors (getByRole, getByLabel)
- [ ] Note in test comments that selector is fragile

---

## 8. TEST RECOMMENDATIONS

Based on your discovery, what should we test?

### Must Test (Critical Path)
- [ ] [Feature 1] - [Why: users depend on this]
- [ ] [Feature 2]
- [ ] [Feature 3]

### Should Test (Important Features)
- [ ] [Feature A]
- [ ] [Feature B]

### Nice to Test (Edge Cases)
- [ ] [Edge case 1]
- [ ] [Edge case 2]

### Don't Test (Low Value)
- [ ] CSS styling details
- [ ] Font sizes/colors
- [ ] Animation smoothness

---

## 9. BLOCKERS / CONCERNS

**Did you run into any issues during exploration?**

| Issue | Impact | Solution |
|-------|--------|----------|
| [Issue] | [Critical / High / Low] | [How to handle] |
| | | |

---

## 10. APPROVAL CHECKLIST

Before moving to implementation, verify:

- [ ] App is fully explored (all pages visited)
- [ ] All selectors validated (tested in browser)
- [ ] Routes documented and tested (navigated to each)
- [ ] Key flows documented (happy path + error paths)
- [ ] Discovery document is complete and clear
- [ ] Selectors are stable (not fragile, won't break on UI changes)
- [ ] Test recommendations prioritized (critical first)
- [ ] Team/stakeholder approval obtained

---

## 11. IMPLEMENTATION PLAN

**Based on discovery, here's the test implementation order:**

```
Week 1:
  1. Create UI Config (selectors)
     File: playwright/configs/ui/[module]/[module].ui.ts
  
  2. Add Routes
     File: playwright/configs/app/routes.ts
  
  3. Write Helpers
     File: playwright/support/helpers/modules/[module].helpers.ts

Week 2:
  4. Write Smoke Tests (critical path only)
     File: playwright/tests/[module]/smoke/[module]-smoke.spec.ts
  
  5. Write E2E Tests (full flows)
     File: playwright/tests/[module]/e2e/[module]-*.spec.ts

Week 3:
  6. Write Negative Tests (error paths)
     File: playwright/tests/[module]/e2e/[module]-negative.spec.ts
```

**Estimated Test Count:**
- Smoke: __ tests
- E2E: __ tests
- Negative: __ tests
- **Total:** __ tests

---

## 12. NOTES FOR CLAUDE CODE

**Special instructions for the AI generating tests:**

_[Any special patterns, conventions, or rules specific to this app?]_

_Example:_
- "All product IDs are slugs, not numeric IDs"
- "Timestamps are always in ISO format"
- "Currency is always formatted as $X.XX (two decimals)"
- "Form validation errors appear in a red banner at the top"

---

## Sign-Off

**Explorer:** _________________________ **Date:** _________

**Reviewed By:** _________________________ **Date:** _________

**Approved For Implementation:** ☐ Yes ☐ No ☐ With changes

**Comments:**

_[Any final notes before implementation starts]_

---

## Appendix: Codegen Output

**Paste the generated code from Playwright Codegen here:**

```typescript
// Generated by: npx playwright codegen <url>
// Date: [date]
// Steps recorded: [number]

page.goto('https://example.com');
// ... paste code here ...
```

This code shows the actual selectors the app uses.
