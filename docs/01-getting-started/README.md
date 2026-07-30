# Setup & Environment

Onboarding guide for new team members and fresh projects.

> **Onboarding step 1 of 4** | Next: [Run & Record](../02-guides/README.md)

## Onboarding Path

| Step   | File                                                  | Time    | What you do                                                          |
| ------ | ----------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| 1 of 4 | [Discovery Process](./discovery-process.md)           | ~15 min | Use Playwright Codegen to explore your app and find stable selectors |
| 2 of 4 | [Run & Record](../02-guides/README.md)                | ~10 min | Run captured flows, inspect selectors, and record reusable patterns  |
| 3 of 4 | [Add to the Framework](../02-guides/README.md)        | ~10 min | Turn captured flows into helpers, fixtures, and specs                |
| 4 of 4 | [Reference & Architecture](../03-reference/README.md) | ~10 min | Check the generator, CLI workflow, and framework design              |

After exploring, you'll have:

- A list of stable selectors
- Documented user flows
- Ready to scaffold tests with `npm run scaffold:flow`

## Next Steps

After completing discovery:

- See **[Writing Tests](../02-guides/writing-tests.md)** for patterns
- Check **[Selector Strategies](../02-guides/selector-strategies.md)** when finding selectors
- Review **[Three-Layer Architecture](../04-architecture/three-layer-pattern.md)** to understand the structure
- Read **[Data-Driven Testing](../02-guides/data-driven-testing.md)** for parameterized tests
