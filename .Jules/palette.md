## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-01 - Post Card Action Accessibility & Focus Rings
**Learning:** Card feed components with icon-only action buttons (like, bookmark, options) need explicit Uzbek `aria-label` attributes, dynamic `aria-pressed` states, and consistent `focus-visible` focus ring styles to support screen readers and full keyboard navigation in feed view.
**Action:** Apply `aria-label`, `aria-pressed`, and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` on all icon-only button controls in feed items.
