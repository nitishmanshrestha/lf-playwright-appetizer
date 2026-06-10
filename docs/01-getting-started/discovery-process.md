# Discovery Process

Explore your application BEFORE writing tests.

**Golden Rule:** Never write a test without first exploring the application with Playwright Codegen.

## Why Discovery First?

- Find the RIGHT selectors from the real app (not guesses)
- Identify meaningful user flows
- Understand the app's actual behavior
- Get team approval on what to test

## Discovery Steps

### 1. Start Codegen

```bash
# Point to your application URL
npx playwright codegen https://example.com
```

This opens:
- Your app in a real browser
- Playwright Inspector showing the generated code

### 2. Navigate & Explore

Click, type, and scroll through your app. Every action generates Playwright code.

Examples:

```bash
# Codegen shows: await page.goto('https://example.com');
# Codegen shows: await page.getByRole('button', { name: 'Login' }).click();
# Codegen shows: await page.getByRole('textbox', { name: 'Email' }).fill('user@test.com');
```

### 3. Document Your Findings

In the Codegen Inspector, note:
- Which selectors are stable (use `data-testid` if available)
- Which flows are important
- Edge cases and error scenarios

Save the generated code (copy/paste from Inspector).

### 4. Fill DISCOVERY_TEMPLATE.md

See [DISCOVERY_TEMPLATE.md](../../DISCOVERY_TEMPLATE.md) in the project root.

Record:

```markdown
# Discovery: Login Feature

## Application Overview
The app is a todo list. Users must log in with email + password.

## Selectors Found
- Email input: data-testid="login-email"
- Password input: data-testid="login-password"
- Login button: "Sign In" button

## User Flows
1. Login → Dashboard
2. Login → 2FA → Dashboard
3. Invalid credentials → Error message

## Edge Cases
- Empty email field
- Very long password
- Disabled submit during load
```

### 5. Get Team Approval

Share your discovery findings with teammates.

**Checklist:**
- [ ] Selectors are documented
- [ ] Flows make sense
- [ ] Edge cases are identified
- [ ] Team agrees on scope

### 6. Move to Implementation

Once approved, you're ready to:
1. Create config files with selectors
2. Write helper classes
3. Create actual tests

See: [Your First Test](./first-test-module.md)

## Tips & Tricks

### Use Element Inspector

Right-click element → "Inspect" to see the HTML:

```html
<input data-testid="login-email" type="email" />
```

### Prioritize Selectors

Prefer this order:
1. `data-testid` — Most stable, explicit
2. `data-test` — Acceptable alternative
3. `aria-label` — Accessible, semantic
4. `role + name` — getByRole is great
5. CSS classes — Avoid, fragile
6. XPath — Last resort

### Record Multiple Flows

Don't stop after one login. Try:
- Happy path (success)
- Error cases (invalid credentials)
- Edge cases (missing fields)

## Next Steps

- ✅ Explored your app
- ✅ Documented findings
- ✅ Got team approval
- 👉 **Next:** [Your First Test](./first-test-module.md) — Create your first test module
