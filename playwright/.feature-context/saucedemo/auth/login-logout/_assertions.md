# Assertions — Saucedemo Login/Logout

## Validation States

- Empty submit shows: `Username is required`
- Username-only submit shows: `Password is required`
- Locked-out user shows: `Sorry, this user has been locked out`
- Invalid credentials show: `Username and password do not match any user in this service`

## Success States

- Valid login redirects to `/inventory.html`
- Inventory container is visible after login

## Logout States

- Logout redirects to `/`
- Username input visible and empty
- Password input empty

## Determinism

- No `waitForTimeout`
- Use route and locator assertions only
