# playwright-cli for Coding Agents

Complete guide to `playwright-cli` — token-efficient browser automation for coding agents like Claude Code and GitHub Copilot.

> **Quick ref?** See [CLI Commands](./cli-commands.md) for npm scripts. **Full Playwright docs?** [playwright-cli docs](https://playwright.dev/docs/getting-started-cli)

---

## Workspace Agent Integration

This repository now includes a workspace custom agent and skill for CLI-first Playwright work:

- **Agent:** `.github/agents/playwright-cli.md`

Use them for token-efficient browser automation, retained-context execution, codegen-first scaffolding, and no-MCP debugging.

### Why an Agent + Skill, Not a New Instruction File?

- The **agent** handles task routing and keeps CLI work isolated from other Playwright tasks.
- The **skill** packages the repo-specific workflow so the agent can discover the right CLI path quickly.
- A new always-on `.instructions.md` file would add context cost on unrelated tasks and is not the right primitive for task selection.

### Repo-Specific Routing

- Use `playwright-cli` when the task is browser control, context capture, or CLI-first debugging.
- Use `playwright-test-automation` when the browser-discovery phase is already complete and the main task is implementation.
- Use `playwright-bug-hunter` for failure triage on a broken spec.

The new agent reuses the existing CLI prompt assets under `.github/prompts/cli/` rather than duplicating them.

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

# Install agent-friendly skills
playwright-cli install --skills

# Test the installation
playwright-cli open https://demo.playwright.dev/todomvc
```

---

## Page Navigation

| Command                     | Purpose                                     | Example                                   |
| --------------------------- | ------------------------------------------- | ----------------------------------------- |
| `playwright-cli open [url]` | Open browser and optionally navigate to URL | `playwright-cli open https://example.com` |
| `playwright-cli goto <url>` | Navigate to a URL                           | `playwright-cli goto https://example.com` |
| `playwright-cli go-back`    | Go back in browser history                  | `playwright-cli go-back`                  |
| `playwright-cli go-forward` | Go forward in browser history               | `playwright-cli go-forward`               |
| `playwright-cli reload`     | Reload the current page                     | `playwright-cli reload`                   |
| `playwright-cli close`      | Close the browser                           | `playwright-cli close`                    |

**Example Workflow:**

```bash
# Open a page
playwright-cli open https://demo.playwright.dev/todomvc

# Take a snapshot to see element refs
playwright-cli snapshot

# Navigate somewhere new
playwright-cli goto https://example.com

# Go back
playwright-cli go-back

# Close browser
playwright-cli close
```

---

## Targeting Elements

Elements can be targeted in three ways:

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

# Complex selector with child combinator
playwright-cli click "form button[type='submit']"
```

### 3. Role Selectors (Accessible) ⭐ Recommended

```bash
# Click button by accessible role and name
playwright-cli click "role=button[name='Submit']"

# Get text field
playwright-cli fill "role=textbox[name='Email']" "test@example.com"

# Select by role with nested path
playwright-cli click "#footer >> role=button[name='Cancel']"
```

**Best Practice:** Use role selectors first, then CSS, use refs as last resort.

---

## Interacting with Pages

### Text Input & Selection

```bash
# Type text (character by character)
playwright-cli type "hello world"

# Fill text into an editable element (replaces content)
playwright-cli fill e23 "new value"

# Select option in dropdown
playwright-cli select e12 "Option Value"

# Press a key (Enter, ArrowLeft, etc.)
playwright-cli press Enter

# Press multiple keys
playwright-cli press "Control+a"
playwright-cli press Delete

# Key down/up (for holding keys)
playwright-cli keydown Shift
playwright-cli type "HELLO"
playwright-cli keyup Shift
```

**Example - Form Fill:**

```bash
# Open form
playwright-cli open https://example.com/form

# Get snapshot to find element refs
playwright-cli snapshot

# Fill and interact
playwright-cli fill e1 "John Doe"           # Name field
playwright-cli fill e2 "john@example.com"   # Email field
playwright-cli select e3 "USA"              # Country dropdown
playwright-cli click e4                     # Submit button
```

### Clicks & Hover

```bash
# Click element
playwright-cli click e15

# Click using CSS selector
playwright-cli click "button.primary"

# Click using role
playwright-cli click "role=button[name='Continue']"

# Hover over element
playwright-cli hover e23

# Drag and drop
playwright-cli drag e1 e2                   # Drag from e1 to e2
playwright-cli drag "#source" "#target"    # Using CSS selectors
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

# Verify checked state in snapshot
playwright-cli snapshot
```

### File Upload

```bash
# Upload a file
playwright-cli upload "/absolute/path/to/file.pdf"

# Multiple files
playwright-cli upload "/path/file1.pdf" "/path/file2.pdf"

# After upload, verify in snapshot
playwright-cli snapshot
```

---

## Screenshots & Snapshots

```bash
# Get page snapshot (shows element refs, text, page state)
playwright-cli snapshot

# Save snapshot to specific file
playwright-cli snapshot --filename=page-snapshot.yml

# Take screenshot of entire page
playwright-cli screenshot

# Take screenshot of specific element
playwright-cli screenshot e15

# Save screenshot with custom filename
playwright-cli screenshot --filename=my-screenshot.png

# Export page as PDF
playwright-cli pdf

# Save PDF with filename
playwright-cli pdf --filename=report.pdf
```

**Example - Visual Testing:**

```bash
# Navigate and take screenshots
playwright-cli open https://example.com/checkout

# Take screenshot of header
playwright-cli screenshot e1

# Take screenshot of order summary
playwright-cli screenshot e5

# Full page screenshot
playwright-cli screenshot
```

---

## Keyboard & Mouse Control

```bash
# Press a single key
playwright-cli press Enter
playwright-cli press Escape
playwright-cli press Tab

# Key combinations
playwright-cli press "Control+c"
playwright-cli press "Shift+Tab"
playwright-cli press "Meta+a"             # Cmd+A on macOS

# Mouse movement
playwright-cli mousemove 100 200           # Move to x=100, y=200

# Mouse buttons (down/up for sequences)
playwright-cli mousedown
playwright-cli mousemove 150 250
playwright-cli mouseup

# Scrolling
playwright-cli mousewheel 0 5              # Scroll down
playwright-cli mousewheel 0 -5             # Scroll up
```

---

## Tab Management

```bash
# List all open tabs
playwright-cli tab-list

# Open new tab (optionally with URL)
playwright-cli tab-new
playwright-cli tab-new https://example.com

# Select a specific tab (by index)
playwright-cli tab-select 1
playwright-cli tab-select 2

# Close a tab
playwright-cli tab-close 1
playwright-cli tab-close             # Closes current tab
```

**Example - Multi-tab Testing:**

```bash
# Open first site
playwright-cli open https://example.com

# Get tabs
playwright-cli tab-list

# Open new tab
playwright-cli tab-new https://competitor.com

# Switch back to first tab
playwright-cli tab-select 0

# Go to specific tab
playwright-cli tab-select 1
```

---

## Network & API Interaction

```bash
# List all network requests since page load
playwright-cli requests

# Get full details of a specific request (use number from requests list)
playwright-cli request 1

# See request headers
playwright-cli request 1 --part=request-headers

# See response body
playwright-cli request 1 --part=response-body

# List active route mocks
playwright-cli route-list

# Mock a network request
playwright-cli route "*/api/users" --status=200

# Remove a route mock
playwright-cli unroute "*/api/users"

# Intercept all API calls
playwright-cli route "**/api/**"
```

**Example - API Debugging:**

```bash
# Navigate and trigger requests
playwright-cli open https://example.com/dashboard

# See all requests made
playwright-cli requests

# Check specific request details
playwright-cli request 3
playwright-cli request 3 --part=request-headers
playwright-cli request 3 --part=response-body

# List mocked routes
playwright-cli route-list
```

---

## Storage & Cookies

### Session & State Management

```bash
# Save storage state (cookies, localStorage) to file
playwright-cli state-save

# Save to specific filename
playwright-cli state-save my-session.json

# Load storage state from file
playwright-cli state-load session-data.json

# List all cookies
playwright-cli cookie-list

# List cookies for specific domain
playwright-cli cookie-list --domain=example.com

# Get a specific cookie value
playwright-cli cookie-get "sessionId"

# Set a cookie
playwright-cli cookie-set "auth_token" "abc123xyz"

# Delete a cookie
playwright-cli cookie-delete "sessionId"

# Clear all cookies
playwright-cli cookie-clear
```

### LocalStorage

```bash
# List all localStorage entries
playwright-cli localstorage-list

# Get a specific value
playwright-cli localstorage-get "user_preferences"

# Set a value
playwright-cli localstorage-set "theme" "dark"

# Delete an entry
playwright-cli localstorage-delete "user_preferences"

# Clear all localStorage
playwright-cli localstorage-clear
```

**Example - Session Persistence:**

```bash
# Log in and save session
playwright-cli open https://app.example.com
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3                       # Login button

# Save the session state
playwright-cli state-save user-session.json

# Close and reopen in new browser
playwright-cli close
playwright-cli open https://app.example.com
playwright-cli state-load user-session.json   # Load auth cookies

# Verify logged in
playwright-cli snapshot
```

---

## DevTools & Debugging

```bash
# Show console messages
playwright-cli console

# Show only errors
playwright-cli console error

# Show info and warnings
playwright-cli console info

# Evaluate JavaScript on page
playwright-cli eval "() => document.title"

# Evaluate with element context
playwright-cli eval "(el) => el.textContent" e15

# Run a Playwright code snippet
playwright-cli run-code "await page.goto('https://example.com')"

# Start trace recording
playwright-cli tracing-start

# Stop and save trace
playwright-cli tracing-stop

# Start video recording
playwright-cli video-start

# Add chapter marker to video
playwright-cli video-chapter "Login flow"

# Stop video recording
playwright-cli video-stop --filename=login-flow.webm
```

**Example - Debugging Failed Test:**

```bash
# Start trace
playwright-cli tracing-start

# Perform actions
playwright-cli open https://app.example.com
playwright-cli click "role=button[name='Login']"
playwright-cli fill "role=textbox[name='Email']" "test@example.com"

# Check page state
playwright-cli snapshot
playwright-cli console error

# Stop trace for analysis
playwright-cli tracing-stop
```

---

## Sessions & Multi-instance Control

```bash
# List all active sessions
playwright-cli list

# Create named session
playwright-cli -s=myapp open https://myapp.com

# Use named session for subsequent commands
playwright-cli -s=myapp click e15
playwright-cli -s=myapp screenshot

# Monitor all sessions visually
playwright-cli show

# Close all browsers
playwright-cli close-all

# Kill all browser processes
playwright-cli kill-all

# Delete user data for a session
playwright-cli -s=myapp delete-data
```

**Example - Multi-browser Testing:**

```bash
# Test in Chrome
playwright-cli -s=chrome open https://example.com --browser=chromium

# Test in Firefox (separate session)
playwright-cli -s=firefox open https://example.com --browser=firefox

# Run actions in both
playwright-cli -s=chrome click e15
playwright-cli -s=firefox click e15

# Compare results
playwright-cli -s=chrome screenshot --filename=chrome.png
playwright-cli -s=firefox screenshot --filename=firefox.png

# Monitor both
playwright-cli show
```

---

## Configuration & Settings

```bash
# Use specific browser
playwright-cli open https://example.com --browser=firefox
playwright-cli open https://example.com --browser=webkit
playwright-cli open https://example.com --browser=msedge

# Run in headed mode (visible browser)
playwright-cli open https://example.com --headed

# Use config file
playwright-cli --config=.playwright/cli.config.json open https://example.com

# Persistent session (saves profile to disk)
playwright-cli open https://example.com --persistent

# Set timeout for operations
playwright-cli --timeout=5000 click e15
```

---

## Best Practices for Agents

### Token Efficiency

Since `playwright-cli` is designed to be token-efficient:

- ✅ Use **element refs** from `snapshot` — much shorter than selectors
- ✅ Use **role selectors** — more stable and semantic than CSS
- ✅ Chain commands efficiently — do related actions back-to-back
- ✅ Use **session state files** — avoid re-authenticating repeatedly
- ❌ Avoid **CSS/XPath combos** — use simpler selectors
- ❌ Don't **take screenshots** of everything — only when needed for verification

**Example - Efficient Workflow:**

```bash
# Bad: Multiple snapshots (wastes tokens)
playwright-cli snapshot
playwright-cli snapshot
playwright-cli snapshot

# Good: One snapshot, use refs for all actions
playwright-cli snapshot    # Get refs once
playwright-cli fill e1 "text"
playwright-cli click e5
playwright-cli click e12
```

### Selector Priority (Accessibility First)

Always use this order:

1. **Role selectors** (most stable, accessible)

   ```bash
   playwright-cli click "role=button[name='Submit']"
   ```

2. **Locator filters** (second choice)

   ```bash
   playwright-cli click "role=button" --first    # if multiple buttons
   ```

3. **Element refs** (from snapshot)

   ```bash
   playwright-cli click e15
   ```

4. **CSS selectors** (last resort)
   ```bash
   playwright-cli click "#submit-btn"
   ```

Never use XPath if other options work.

### Reliable Waits (Avoid Flakiness)

**Don't do this:**

```bash
playwright-cli click e5
# Wait for page to load
playwright-cli press Enter
```

**Do this instead:**

```bash
playwright-cli click e5
# Wait for specific response or element
playwright-cli requests                 # Check for expected request
playwright-cli snapshot                 # Verify page state changed
```

### Session Persistence

For agents running multiple operations:

```bash
# Create persistent session (once)
playwright-cli -s=myapp open https://app.example.com --persistent

# Reuse across operations
playwright-cli -s=myapp snapshot
playwright-cli -s=myapp click e15
playwright-cli -s=myapp type "hello"

# Close when done
playwright-cli -s=myapp close
```

### State & Auth Management

Save auth state to avoid re-logging in:

```bash
# Log in once and save
playwright-cli open https://app.example.com
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password"
playwright-cli click "role=button[name='Login']"
playwright-cli state-save auth-session.json

# Reuse in subsequent operations
playwright-cli open https://app.example.com
playwright-cli state-load auth-session.json
playwright-cli snapshot      # Verify logged in
```

---

## Troubleshooting Common Issues

### Screenshot Shows Stale Content

**Problem:** Screenshot shows old page state even after clicking

**Solution:** Use `snapshot` to verify page changed, or wait for expected requests

```bash
# Click button
playwright-cli click e15

# Verify page state changed
playwright-cli snapshot

# Or wait for specific API response
playwright-cli requests    # Check for expected request
```

### Element Not Found (Ref Invalid)

**Problem:** Ref from old snapshot no longer exists

**Solution:** Take a fresh snapshot to get updated refs

```bash
# Old snapshot
playwright-cli snapshot --filename=old.yml

# Page changes...

# Take new snapshot
playwright-cli snapshot    # Get new refs
playwright-cli click e18   # Use new ref
```

### Timeout on Click

**Problem:** Command waits too long for element to be clickable

**Solution:** Set timeout or verify element exists in snapshot first

```bash
# Check element is visible
playwright-cli snapshot    # Look for element

# Or set explicit timeout
playwright-cli --timeout=3000 click e15
```

### Form Not Submitting

**Problem:** Form still on page after clicking submit

**Solution:** Wait for navigation or verify submission happened

```bash
# Fill form
playwright-cli fill e1 "data"
playwright-cli fill e2 "more data"

# Submit
playwright-cli click "role=button[name='Submit']"

# Verify submission (check URL or requests)
playwright-cli requests        # See if form POST was sent
playwright-cli goto "/"        # Or navigate to expected page
```

### Multiple Elements Match Selector

**Problem:** Role selector matches multiple elements

**Solution:** Use more specific selector or get snapshot to use refs

```bash
# Instead of vague selector
playwright-cli click "role=button"

# Get snapshot and use ref
playwright-cli snapshot
playwright-cli click e15       # Specific ref

# Or be more specific
playwright-cli click "role=button[name='Confirm Delete']"
```

### Video/Trace Recording Not Starting

**Problem:** `video-start` or `tracing-start` fails

**Solution:** Ensure directory exists and permissions are correct

```bash
# Start trace (creates .playwright directory automatically)
playwright-cli tracing-start

# Perform actions
playwright-cli open https://example.com
playwright-cli click e15

# Stop and save
playwright-cli tracing-stop    # Saves to .playwright/trace.zip

# View trace
npx playwright show-trace .playwright/trace.zip
```

### Console Errors Before Interaction

**Problem:** Page has console errors that might affect tests

**Solution:** Check console before proceeding

```bash
playwright-cli open https://example.com

# Check for errors
playwright-cli console error    # See if errors exist

# Decide if safe to proceed
playwright-cli click e15
```

---

## Additional Resources

- [playwright-cli Full Documentation](https://playwright.dev/docs/getting-started-cli)
- [Playwright Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci-intro)
- [Back to CLI Commands](./cli-commands.md)
