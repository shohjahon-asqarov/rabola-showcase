## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Dropdown Escape Key Closing Support
**Learning:** For custom dropdown menus (such as profile menus and notification menus), mouse click-outside handlers are not enough for keyboard accessibility. Adding an Escape key listener is crucial for keyboard-only users to close floating menus efficiently.
**Action:** Always register an Escape keydown event listener in custom popup/dropdown React hooks or local state components to ensure clean keyboard dismissibility.
