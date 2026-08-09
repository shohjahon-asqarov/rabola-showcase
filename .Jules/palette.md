## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Keyboard Escape Handling and Consistent Language Localization
**Learning:** Dropdowns and overlay menus must capture the 'Escape' keyboard event listener at the document-level to ensure rapid dismissal. When localized to Uzbek, ARIA attributes like `aria-label` must also match the primary Uzbek interface language (e.g., using "Mavzuni almashtirish") to prevent assistive screen readers from using English pronunciations.
**Action:** Include a dedicated 'keydown' listener with `Escape` checks alongside 'mousedown' click-outside events, and ensure all ARIA metadata aligns with the platform's localization.
