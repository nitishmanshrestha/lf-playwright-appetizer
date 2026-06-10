# Selectors and Routes — Saucedemo Login/Logout

## Routes

- `ROUTES.SAUCEDEMO.LOGIN` = `/`
- `ROUTES.SAUCEDEMO.INVENTORY` = `/inventory.html`

## Login Selectors

- `SAUCEDEMO_UI.LOGIN.USERNAME_INPUT` = `username`
- `SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT` = `password`
- `SAUCEDEMO_UI.LOGIN.LOGIN_BTN` = `login-button`
- `SAUCEDEMO_UI.LOGIN.ERROR_MSG` = `error`

## Header/Menu Selectors

- `SAUCEDEMO_UI.HEADER.MENU_BTN` = `open-menu`
- `SAUCEDEMO_UI.HEADER.LOGOUT_LINK` = `logout-sidebar-link`

## Notes

- Menu icon may be wrapped by a button; prefer stable helper abstraction
- Do not hardcode selector literals in spec files
