## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.
