## 2026-03-01 - Dropdown Click-Outside and Keyboard Accessibility
**Learning:** Dropdown menus (like profile and notification menus) in a sticky header must have auto-closing behavior on click-outside and proper ARIA role mapping (`aria-expanded`, `aria-haspopup`, and `aria-label`) to ensure full keyboard and screen reader support without breaking visual responsiveness.
**Action:** Always wrap interactive popovers in standard relative containers with click-outside hooks, and supply semantic ARIA traits on the trigger button.

## 2026-03-02 - Localization of Interactive Contextual Menus and Accessibility
**Learning:** Interactive icon-only controls (e.g., More Actions / Vertical Dots) must have descriptive, language-appropriate ARIA labels (`aria-label` in Uzbek: `"Ko'proq amallar"`) and fully functional dropdown components to avoid non-interactive placeholder traps. Action items within dropdowns must offer localized and accessible visual cues (like toast notifications in Uzbek) to improve contextual comprehension.
**Action:** Convert dead static controls into Shadcn dropdown menus with keyboard focus states and clear localized status feedback.
