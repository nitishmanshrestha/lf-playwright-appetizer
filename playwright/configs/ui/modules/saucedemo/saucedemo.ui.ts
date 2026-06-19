/**
 * @fileoverview Saucedemo UI selectors.
 * Values are bare data-test IDs used with page.getByTestId(id).
 *
 * Target: https://www.saucedemo.com
 * This app uses [data-test="..."] attributes (configured in project testIdAttribute).
 */

export const SAUCEDEMO_UI = {
  LOGIN: {
    USERNAME_INPUT: "username",
    PASSWORD_INPUT: "password",
    LOGIN_BTN: "login-button",
    ERROR_MSG: "error",
  },
  HEADER: {
    APP_LOGO: "app_logo",
    MENU_BTN: "open-menu",
    LOGOUT_LINK: "logout-sidebar-link",
    CART_LINK: "shopping-cart-link",
    CART_BADGE: "shopping-cart-badge",
  },
  INVENTORY: {
    CONTAINER: "inventory-container",
    ITEM: "inventory-item",
    ITEM_NAME: "inventory-item-name",
    ITEM_DESC: "inventory-item-desc",
    ITEM_PRICE: "inventory-item-price",
    ITEM_IMG: (name: string) => `inventory-item-${name}-img`,
    SORT_DROPDOWN: "product-sort-container",
  },
  PRODUCT_ITEM: {
    ADD_TO_CART_BTN: (name: string) => `add-to-cart-${name}`,
    REMOVE_BTN: (name: string) => `remove-${name}`,
  },
  CART: {
    CONTAINER: "cart-contents-container",
    ITEM: "inventory-item",
    ITEM_NAME: "inventory-item-name",
    ITEM_PRICE: "inventory-item-price",
    ITEM_QTY: "item-quantity",
    CHECKOUT_BTN: "checkout",
    CONTINUE_SHOPPING_BTN: "continue-shopping",
  },
  CHECKOUT: {
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    POSTAL_CODE: "postalCode",
    CONTINUE_BTN: "continue",
    ERROR_MSG: "error",
    CANCEL_BTN: "cancel",
    SUMMARY_CONTAINER: "checkout-summary-container",
    SUBTOTAL_LABEL: "subtotal-label",
    TAX_LABEL: "tax-label",
    TOTAL_LABEL: "total-label",
    COMPLETE_HEADER: "complete-header",
    COMPLETE_TEXT: "complete-text",
    BACK_HOME_BTN: "back-to-products",
  },
} as const;
