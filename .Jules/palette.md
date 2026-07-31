## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Grid Item Action Controls and Focus Ring Visibility
**Learning:** For components that repeat in a dashboard or showcase feed (like `PostCard`), interactive elements (like bookmarking, liking, or options menu buttons) must have localized ARIA attributes (e.g., in Uzbek language like `aria-label` and `aria-pressed`) and visible keyboard navigation outline configurations to prevent invisible keyboard tab traps and lack of context for screen readers.
**Action:** Always attach localized ARIA states/roles and focus-visible rings using `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-2` on card grid child buttons.
