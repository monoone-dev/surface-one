---
name: surface-one-a11y-review
description: Review an Angular screen built with Surface One for WCAG 2.2 AA accessibility and fix what fails. Use before finishing any UI task in a Surface One app, when the user asks for an accessibility or a11y review, or when axe / Lighthouse reports issues.
---

# Accessibility review for Surface One screens

Surface One components implement the WAI-ARIA patterns; most failures come from how a screen
uses them. Check every item; fix, don't just report.

## Checklist

1. **Names.** Every icon-only `soneBtn` has `aria-label`. Every input/select/textarea/switch/slider
   has a label (`soneFieldLabel` with `for`, a `<label>`, or the component's `ariaLabel` input).
   `sone-segmented`, `soneToggleGroup` and tab lists have an `ariaLabel` / `aria-label`.
2. **Semantics.** Actions are `<button type="button">`, navigation is `<a href>` / `routerLink`.
   No `click` on `div`/`span`. Tables keep `<sone-table>` headers and a caption.
3. **Structure.** One `<h1>`; headings descend without gaps; landmarks (`header`, `nav`, `main`,
   `footer`) are unique or uniquely labelled; a skip link reaches `main`.
4. **Keyboard.** Everything works with Tab / Shift+Tab / Enter / Space / Escape / arrows. Dialogs
   and sheets are opened with `@if` and closed on `(dismiss)` so focus returns. Tab lists are one
   tab stop (`soneTabsList` + `role="tablist"`, triggers `role="tab"`).
5. **Focus.** Never remove the focus ring; custom focusable things use `box-shadow: var(--focus-ring)`.
6. **Colour.** Only tokens; text ≥ 4.5:1, large text and control boundaries ≥ 3:1, in light AND dark
   and in every skin you ship. Never convey state by colour alone (badges carry text).
7. **Targets.** Pointer targets ≥ 24×24 px; with the smallest button sizes (`xs`, `icon-xs`) keep enough spacing around them.
8. **Motion.** Respect `prefers-reduced-motion` (the tokens' base stylesheet already does globally).
9. **Language.** `<html lang>` matches the content; mixed-language snippets get `lang`.
10. **Live updates.** Async results that matter go through `<sone-toaster>` or a polite live region;
    errors use `soneFieldError` (announced as an alert).

## Verify

If Playwright is available, run axe-core (`@axe-core/playwright`) on the page in light and dark mode
and fix every violation. Report what you changed.
