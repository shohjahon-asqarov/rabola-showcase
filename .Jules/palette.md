## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Keyboard Escape Handling and Focus Indicators for Interactive Menus
**Learning:** To satisfy robust accessibility requirements, dropdowns and interactive popover triggers should support closing via the Escape key, clear keyboard focus rings with `focus-visible:ring-2 focus-visible:ring-primary`, and localized Uzbek `aria-label` screen reader translations.
**Action:** Add global "keydown" event listeners for the 'Escape' key on menu triggers and apply standardized focus-visible ring styles.
