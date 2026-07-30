# playwright-cli for Coding Agents

Complete guide to `playwright-cli` — token-efficient browser automation for coding agents.

> **Quick ref?** See [CLI Commands](./cli-commands.md) for npm scripts. **Full Playwright docs?** [playwright-cli docs](https://playwright.dev/docs/getting-started-cli)

---

## Workspace Agent Integration

This repository includes agents and skills for CLI-first Playwright work:

- **Agent:** `.github/agents/playwright-cli.md`
- **Skill:** `.github/skills/playwright-cli-workflow/SKILL.md`

Use them for token-efficient browser automation, retained-context execution, codegen-first scaffolding, and no-MCP debugging.

---

## 🚀 Quick Start for Agents

```bash
# 1. Install globally (recommended)
npm install -g @playwright/cli@latest

# 2. Open a page
playwright-cli open https://example.com

# 3. Take a snapshot (shows element refs)
playwright-cli snapshot

# 4. Interact
playwright-cli click e15              # Use refs
playwright-cli type "hello"
playwright-cli screenshot
```

---

## Installation & Setup

```bash
# Install globally (recommended for agents)
npm install -g @playwright/cli@latest

# Or use with npx (no installation needed)
npx playwright-cli --help

# Test the installation
playwright-cli open https://demo.playwright.dev/todomvc
```

---

## Page Navigation

| Command                     | Purpose                              | Example                                   |
| --------------------------- | ------------------------------------ | ----------------------------------------- |
| `playwright-cli open [url]` | Open browser and optionally navigate | `playwright-cli open https://example.com` |
| `playwright-cli goto <url>` | Navigate to a URL                    | `playwright-cli goto https://example.com` |
| `playwright-cli go-back`    | Go back in history                   | `playwright-cli go-back`                  |
| `playwright-cli go-forward` | Go forward in history                | `playwright-cli go-forward`               |
| `playwright-cli reload`     | Reload page                          | `playwright-cli reload`                   |
| `playwright-cli close`      | Close browser                        | `playwright-cli close`                    |

---

## Targeting Elements

### 1. Element References (from `snapshot`)

```bash
# Get snapshot with element refs (e1, e2, e3, etc.)
playwright-cli snapshot

# Click using ref
playwright-cli click e15

# Type into ref
playwright-cli fill e23 "user@example.com"
```

### 2. CSS Selectors

```bash
# Click using CSS selector
playwright-cli click "#main > button.submit"

# Fill input with CSS
playwright-cli fill "input[type='email']" "test@example.com"
```

### 3. Role Selectors (Accessible) ⭐ Recommended

```bash
# Click button by accessible role and name
playwright-cli click "role=button[name='Submit']"

# Get text field
playwright-cli fill "role=textbox[name='Email']" "test@example.com"
```

**Best Practice:** Use role selectors first, then CSS, use refs as last resort.

---

## Interacting with Pages

### Text Input & Selection

```bash
# Type text (character by character)
playwright-cli type "hello world"

# Fill text (replaces content)
playwright-cli fill e23 "new value"

# Select option in dropdown
playwright-cli select e12 "Option Value"

# Press a key
playwright-cli press Enter
playwright-cli press "Control+a"
```

### Clicks & Hover

```bash
# Click element
playwright-cli click e15

# Click using selector
playwright-cli click "button.primary"

# Hover over element
playwright-cli hover e23

# Drag and drop
playwright-cli drag e1 e2
```

### Checkboxes & Radio Buttons

```bash
# Get snapshot to see form state
playwright-cli snapshot

# Check a checkbox
playwright-cli check e20

# Uncheck a checkbox
playwright-cli uncheck e20

# Check radio button
playwright-cli check "role=radio[name='Option A']"
```

### File Upload

```bash
# Upload a file
playwright-cli upload "/absolute/path/to/file.pdf"

# After upload, verify
playwright-cli snapshot
```

---

## Screenshots & Snapshots

```bash
# Take screenshot (saves to file)
playwright-cli screenshot

# Get accessible page structure
playwright-cli snapshot

# Scope to a region
playwright-cli snapshot e15
```

---

## Inspecting Elements

### Get Element Attributes

```bash
# Get specific attribute
playwright-cli eval "el => el.getAttribute('data-testid')" e7

# Get all CSS classes
playwright-cli eval "el => el.className" e7

# Get computed style
playwright-cli eval "el => getComputedStyle(el).display" e7
```

### Get Element Text or Value

```bash
# Get element text content
playwright-cli eval "el => el.textContent" e5

# Get input value
playwright-cli eval "el => el.value" e3
```

---

## Capturing Page State

```bash
# Get current URL
playwright-cli eval "window.location.href"

# Get page title
playwright-cli eval "document.title"

# Find all elements with data-testid
playwright-cli eval "Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))"
```

---

## Workflow: Explore & Generate Tests

### Phase 1: Explore

```bash
# Open the app
playwright-cli open https://example.com

# Take initial snapshot
playwright-cli snapshot

# Navigate and explore
playwright-cli click e5
playwright-cli screenshot

# Record what you find
playwright-cli snapshot
```

### Phase 2: Generate Code

Every action generates Playwright code. Copy it into a file:

```bash
# Generated when you click:
# await page.getByRole('button', { name: 'Submit' }).click();

# Generated when you fill:
# await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
```

### Phase 3: Scaffold Framework

Use the generated code to scaffold Config → Helpers → Tests:

```bash
# Create selector constants in config
# Create helper methods
# Write test specs
```

---

## Real-World Examples

### Example 1: Login Flow

```bash
# Open login page
playwright-cli open https://example.com/login
playwright-cli snapshot

# Fill email
playwright-cli fill e1 "user@example.com"
playwright-cli screenshot

# Fill password
playwright-cli fill e2 "password123"

# Click submit
playwright-cli click e3
playwright-cli screenshot

# Verify success (take snapshot to see result)
playwright-cli snapshot
```

### Example 2: Form with Validation

```bash
# Open form
playwright-cli open https://example.com/form
playwright-cli snapshot

# Try invalid input
playwright-cli fill e1 "invalid-email"
playwright-cli click e5  # submit
playwright-cli screenshot  # see error

# Try valid input
playwright-cli fill e1 "valid@example.com"
playwright-cli click e5
playwright-cli snapshot  # see success
```

### Example 3: Table Interaction

```bash
# Get snapshot to see table structure
playwright-cli snapshot

# Click row (using role selector)
playwright-cli click "role=row" --filter "has-text='John Doe'"

# Or using element ref
playwright-cli click e15
playwright-cli screenshot
```

---

## Tips for Token Efficiency

- Use `snapshot` to understand page structure before recording
- Use `eval` to inspect attributes instead of full snapshots
- Combine multiple actions before taking screenshots
- Copy generated code into files rather than recording long sessions
- Use refs (e1, e2) when available — they're simpler than selectors
