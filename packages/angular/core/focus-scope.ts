import { InjectionToken } from "@angular/core";

/**
 * A focus scope that owns content portaled OUT of it — the dialog / sheet a popover
 * or menu was opened from. A trigger inside the scope registers its panel here, and
 * the scope then treats the panel's focusable elements as its own: they join its
 * Tab cycle right after `anchor`, and focus in them never counts as "escaped".
 *
 * Provided by `sone-dialog`, `sone-alert-dialog` and `sone-sheet`; looked up with
 * `inject(SONE_FOCUS_SCOPE, { optional: true })` by `sonePopoverTrigger`,
 * `soneMenuTrigger` and `soneTeleportToBody` (with `teleportAnchor`).
 */
export interface SoneFocusScope {
  /** Adds `panel` to this scope right after `anchor`; returns the unregister function. */
  registerPortal(anchor: HTMLElement, panel: HTMLElement): () => void;
}

export const SONE_FOCUS_SCOPE = new InjectionToken<SoneFocusScope>(
  "SONE_FOCUS_SCOPE",
);

/** What can take focus with Tab (before the `isTabbable` checks). */
export const TABBABLE_SELECTOR =
  'a[href], area[href], button, input:not([type="hidden"]), select, textarea, ' +
  'iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

export function isTabbable(el: HTMLElement): boolean {
  if (el.tabIndex < 0) return false;
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.closest("fieldset:disabled, [inert]")) return false;
  // `offsetParent` is null for visible `position: fixed` elements, so check rendered boxes instead.
  return el.getClientRects().length > 0;
}

/** The Tab stops inside `root` in document order; a named radio group is ONE stop, as the browser treats it. */
export function tabbableElements(root: ParentNode): HTMLElement[] {
  const all = Array.from(
    root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter(isTabbable);
  const groupStop = new Map<string, HTMLInputElement>();
  for (const el of all) {
    if (!(el instanceof HTMLInputElement) || el.type !== "radio" || !el.name)
      continue;
    const current = groupStop.get(el.name);
    if (!current || (el.checked && !current.checked))
      groupStop.set(el.name, el);
  }
  return all.filter(
    (el) =>
      !(el instanceof HTMLInputElement && el.type === "radio" && el.name) ||
      groupStop.get(el.name) === el,
  );
}

/**
 * Calls `onChange` when a floating panel next to `anchor` may need to move: a
 * scroll anywhere outside `panel`, a window resize, or the end of an animation /
 * transition on the anchor or one of its ancestors. Returns the cleanup function.
 * Browser-only: call it from a handler or `afterNextRender`.
 */
export function listenForReposition(
  win: Window,
  panel: HTMLElement,
  anchor: () => HTMLElement | null,
  onChange: (reason: "scroll" | "resize" | "motion") => void,
): () => void {
  const isInsidePanel = (event: Event): boolean => {
    const target = event.target;
    return target instanceof Node && panel.contains(target);
  };
  const onScroll = (event: Event): void => {
    // Re-measuring on every internal scroll tick caused layout thrash and
    // blank fixed-layer paints in WKWebView.
    if (!isInsidePanel(event)) onChange("scroll");
  };
  const onMotionEnd = (event: Event): void => {
    const a = anchor();
    const target = event.target;
    if (
      !a ||
      !(target instanceof Element) ||
      isInsidePanel(event) ||
      (target !== a && !target.contains(a))
    ) {
      return;
    }
    onChange("motion");
  };
  const onResize = (): void => onChange("resize");
  win.addEventListener("scroll", onScroll, { capture: true, passive: true });
  win.addEventListener("resize", onResize, { passive: true });
  // A teleported overlay does not inherit an ancestor's transform animation;
  // re-measure once that motion settles so it can't retain a mid-entry rect.
  win.addEventListener("animationend", onMotionEnd, { capture: true });
  win.addEventListener("transitionend", onMotionEnd, { capture: true });
  return () => {
    win.removeEventListener("scroll", onScroll, { capture: true });
    win.removeEventListener("resize", onResize);
    win.removeEventListener("animationend", onMotionEnd, { capture: true });
    win.removeEventListener("transitionend", onMotionEnd, { capture: true });
  };
}
