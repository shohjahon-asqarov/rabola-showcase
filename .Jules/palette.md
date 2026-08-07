## 2026-03-02 - Keyboard Escape Handling and Focus Indicators
**Learning:** Dropdown menus, notification popovers, and theme toggles in a highly-interactive navigation header must offer complete keyboard compatibility. Providing an Escape key handler alongside a visible focus outline ensures a frictionless UX for screen readers and keyboard navigators. Localized `aria-label` attributes (e.g., in Uzbek) ensure seamless integration with local-first UI copy.
**Action:** Always attach both mouse click-outside and 'Escape' keydown event listeners to popover wrappers. Use consistent custom focus outlines (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2`) for all icon buttons.

## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.
