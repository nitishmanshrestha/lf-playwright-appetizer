# Workflow — Saucedemo Login/Logout

1. Open login page (`/`)
2. Submit empty username/password
3. Assert error: Username is required
4. Submit `locked_out_user` / `secret_sauce`
5. Assert locked out error
6. Submit valid credentials (`standard_user` / `secret_sauce`)
7. Assert redirect to `/inventory.html`
8. Open hamburger menu
9. Click logout
10. Assert redirect to `/`
11. Assert username and password inputs are empty
