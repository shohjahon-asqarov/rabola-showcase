## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-01 - Card Controls and Hover-Only Slider Keyboard Focus
**Learning:** Icon-only action buttons (like, bookmark, options) and hover-triggered image slider controls in card layouts require explicit Uzbek `aria-label`, `aria-pressed`, and `focus-visible:opacity-100` classes so keyboard users (Tabbing) can uncover and navigate controls that are otherwise hidden on mouse hover.
**Action:** Always pair `group-hover/slider:opacity-100` with `focus-visible:opacity-100` and supply focus ring utility classes (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2`) on interactive icon buttons.
