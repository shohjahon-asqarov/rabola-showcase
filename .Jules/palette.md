## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-05 - Search Accessibility, Keyboard Focus and Mobile Clear UX
**Learning:** High-use text inputs like search bars must have an explicitly associated labels (even if visually hidden via `sr-only`) to support screen readers, and should leverage desktop-friendly keyboard shortcut focus handlers (like the `/` key with a `<kbd>` indicator) alongside mobile-friendly clear button controls (`X`) for optimal multi-modal usability.
**Action:** Always supply associated labels to search inputs, render responsive `<kbd>` indicators, and add absolute-positioned clear actions when the input holds value.
