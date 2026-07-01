# Setup & Environment

Get your development environment ready.

## Prerequisites

- **Node.js** 18+ (download from [nodejs.org](https://nodejs.org))
- **npm** 8+ (comes with Node.js)
- **Git** (for version control)

Verify installation:

```bash
node --version    # Should be v18 or higher
npm --version     # Should be 8 or higher
git --version     # Should be installed
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lf-playwright-boilerplate.git
cd lf-playwright-boilerplate

# Install dependencies
npm install

# Verify Playwright is installed
npx playwright --version
```

## Running Your First Test

```bash
# Run the example Saucedemo tests
npm run test:saucedemo

# Or run all tests
npm test

# View the HTML report
npm run report
```

## IDE Setup (Optional but Recommended)

### VS Code Extensions

1. **[Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)** - Official Playwright extension
   - Provides test runner in the editor
   - Debug tests directly from VS Code
   - View test results inline

2. **[GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)** - AI code suggestions
   - Great for writing selectors
   - Suggests test patterns

### VS Code Settings

Add to your workspace settings (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# App URL (for local testing)
APP_URL=http://localhost:3000

# Environment
ENV=local

# Debug logging
DEBUG=pw:api
```

See [Configuration Reference](../04-reference/config-reference.md) for all variables.

## Troubleshooting

### Playwright browsers not installed

```bash
npx playwright install

# Or install for specific browser
npx playwright install chromium
```

### Tests fail with "Connection refused"

Ensure your app is running:

```bash
npm run dev  # Start your development server
```

### ESLint/Prettier errors

```bash
npm run format   # Auto-format code
npm run lint:fix # Fix linting issues
```

## Next Steps

1. ✅ Environment is set up
2. 👉 **Adapting to your app?** → [ADAPTING.md](../../ADAPTING.md) — strip sample modules, update config, scaffold first module
3. **Next:** [Discovery Process](./discovery-process.md) — Learn how to explore your app
4. Then: [Your First Test](./first-test-module.md) — Write your first test
