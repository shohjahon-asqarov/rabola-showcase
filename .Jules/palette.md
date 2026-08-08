## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Keyboard Dismissal & Clear Focus Indicators
**Learning:** Interactive dropdown components must support dismissal via standard keyboard triggers like 'Escape' to allow seamless non-mouse interaction. Moreover, standard focus rings (`focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2`) are crucial to ensure visual clarity during keyboard navigation without introducing clutter for mouse-based interactions.
**Action:** Always include 'Escape' key listeners in toggle/dropdown menus and apply consistent focus rings to interactive buttons.
