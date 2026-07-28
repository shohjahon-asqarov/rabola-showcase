## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Multi-faceted Card Options Menu & Localized ARIA Support
**Learning:** For multi-action dashboard cards, replacing non-functional placeholder icons with fully interactive Radix Dropdowns containing high-value, localized micro-utilities (like navigator.share and on-the-fly saves) dramatically raises UI quality. Additionally, screen-reader support must be completely localized to the default language (Uzbek) so that screen readers do not read mismatched/English ARIA tags (like "Toggle theme" vs "Mavzuni almashtirish").
**Action:** Always verify that placeholder interactive elements are either removed or converted to accessible, fully functioning controls, and keep all screen-reader labels consistent with the application's primary locale.
