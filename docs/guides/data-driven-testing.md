# Data-Driven Testing

Use DDT only when one approved behavior must be verified across meaningful data variations.

## Contract

- The parent requirement is active in `evidence/requirements.json`.
- Each dataset is synthetic, descriptive, and stored outside test logic.
- Expected outcomes come from the requirement, not from copied application output.
- Each row is independent and has failure-safe cleanup when it creates state.
- Parameterized titles retain the requirement prefix.

```typescript
for (const caseData of cases) {
  test(
    `[PAY-CHECKOUT-010] rejects checkout when ${caseData.missingField} is absent`,
    { tag: ["@regression", "@P1", "@ddt", "@PAY-CHECKOUT-010"] },
    async ({ checkoutHelpers }) => {
      await checkoutHelpers.submitWithout(caseData.missingField);
      await checkoutHelpers.assertRequiredFieldError(caseData.expectedMessage);
    },
  );
}
```

Register `checkoutHelpers` in `base.fixture.ts`; keep selectors and routes in config. Do not create
DDT scaffolding before requirement and data-lifecycle approval.
