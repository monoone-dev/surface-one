---
name: surface-one-a11y-review
description: Review a screen built with SurfaceOne (Angular, Vue / Nuxt or React / Next.js) for WCAG 2.2 AA accessibility and fix what fails. Use before finishing any UI task in a SurfaceOne app, when the user asks for an accessibility or a11y review, or when axe / Lighthouse reports issues.
---

# Accessibility review for SurfaceOne screens

SurfaceOne components implement the WAI-ARIA patterns in all three packages
(`@surface-one/angular`, `@surface-one/vue`, `@surface-one/react` render the same markup); most
failures come from how a screen uses them. Check every item; fix, don't just report. Each item
names the Angular form first, then the Vue / React one (`Sone*` components) where it differs.

## Checklist

1. **Names.** Every icon-only button (`soneBtn` / `<SoneButton>`) has `aria-label`. Every
   input/select/textarea/switch/slider has a label (a field label — `soneFieldLabel` /
   `<SoneFieldLabel>` — with `for`, a `<label>`, or the component's `ariaLabel` input / prop).
   Segmented controls, toggle groups and tab lists have an `ariaLabel` / `aria-label`.
2. **Semantics.** Actions are `<button type="button">`, navigation is `<a href>` (`routerLink`,
   `NuxtLink`, Next.js `Link`; on a SurfaceOne button via `as`). No click handler on `div`/`span`.
   Tables keep the SurfaceOne table headers and a caption.
3. **Structure.** One `<h1>`; headings descend without gaps; landmarks (`header`, `nav`, `main`,
   `footer`) are unique or uniquely labelled; a skip link reaches `main`.
4. **Keyboard.** Everything works with Tab / Shift+Tab / Enter / Space / Escape / arrows. Dialogs
   and sheets close through their dismiss path so focus returns: Angular `@if` + `(dismiss)`, Vue
   `v-model:open` (or `v-if` + `@dismiss`), React `open` + `onOpenChange` (or `onDismiss`). Tab
   lists are one tab stop (the tabs list with `role="tablist"`, triggers `role="tab"`).
5. **Focus.** Never remove the focus ring; custom focusable things use `box-shadow: var(--focus-ring)`.
6. **Colour.** Only tokens; text ≥ 4.5:1, large text and control boundaries ≥ 3:1, in light AND dark
   and in every skin you ship. Never convey state by colour alone (badges carry text).
7. **Targets.** Pointer targets ≥ 24×24 px; with the smallest button sizes (`xs`, `icon-xs`) keep enough spacing around them.
8. **Motion.** Respect `prefers-reduced-motion` (the tokens' base stylesheet already does globally).
9. **Language.** `<html lang>` matches the content; mixed-language snippets get `lang`.
10. **Live updates.** Async results that matter go through the toaster (`<sone-toaster>`, Angular)
    or a polite live region; errors use the field error part (`soneFieldError` /
    `<SoneFieldError>`, announced as an alert).

## Verify

If Playwright is available, run axe-core (`@axe-core/playwright`) on the page in light and dark mode
and fix every violation. Report what you changed.
