## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2025-08-03 - Language-Appropriate ARIA Attributes and Focus-Visible Ring styling
**Learning:** For application platforms target-oriented to a specific region (such as Uzbek UI copy), ARIA labels and alt text must be fully translated to maintain a seamless screen-reader auditory interface. Standardizing button focus rings on custom trigger buttons is essential for clear keyboard navigation.
**Action:** Keep ARIA labels consistently translated in the platform's primary language (Uzbek) and pair interactive triggers with standard Tailwind focus indicators: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2`.
