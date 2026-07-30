# Discovery Process

> Explore your application BEFORE writing tests.

**Golden Rule:** Never write a test without first exploring the application with Playwright Codegen.

## Why Discovery First?

- Find the RIGHT selectors from the real app (not guesses)
- Identify meaningful user flows
- Understand the app's actual behavior
- Get team approval on what to test

## Discovery Steps

### 1. Start Codegen

```bash
npm run context:codegen https://example.com
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

### 4. Scaffold Tests

Once you've explored, run the scaffold command to generate files:

```bash
npm run scaffold:flow -- --module <module> --feature <feature> --capture capture.json
```

This creates:

- UI config with selectors
- Helper class stub
- Test spec template
- DDT intake summary when the flow is repeated data-driven behavior

### 5. Fill in Helper Logic

The generated spec file will have TODO comments. Replace them with actual helper method calls.

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
- 👉 **Next:** [Writing Tests](../02-guides/writing-tests.md) — Implement test helpers and specs
