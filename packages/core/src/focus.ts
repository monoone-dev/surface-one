// Focus handling of the modal overlays (dialog, alert dialog, sheet) — the DOM half of
// the Angular `SoneOverlayBase`, shared by the Vue `useOverlay` and the React
// `useOverlay`. Browser-only: call these from handlers and effects, never at import.
//
// TABBABLE_SELECTOR, isTabbable and tabbableElements are the ones of
// packages/angular/core/focus-scope.ts (test/focus.test.ts keeps them identical);
// that file imports @angular/core, so core cannot re-export it.

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

/** Tab / Shift+Tab inside `panel`: the next stop after the focused one, wrapping around. */
export function cycleFocus(
  panel: HTMLElement | null,
  backwards: boolean,
): void {
  if (!panel) return;
  const stops = tabbableElements(panel);
  if (stops.length === 0) {
    panel.focus();
    return;
  }
  const current = document.activeElement;
  const inside =
    current instanceof HTMLElement &&
    current !== panel &&
    panel.contains(current);
  let next: HTMLElement | undefined;
  if (!inside) {
    next = backwards ? stops[stops.length - 1] : stops[0];
  } else if (backwards) {
    const before = stops.filter(
      (s) =>
        s !== current &&
        !!(
          s.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING
        ),
    );
    next = before[before.length - 1] ?? stops[stops.length - 1];
  } else {
    const after = stops.filter(
      (s) =>
        s !== current &&
        !!(
          s.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_PRECEDING
        ),
    );
    next = after[0] ?? stops[0];
  }
  next?.focus();
}

/**
 * The element to give focus back to on close: the focused one, unless focus already
 * fell to `<body>` ("returning" there would steal focus from what the opener restores).
 */
export function captureOpener(): HTMLElement | null {
  const opener = document.activeElement as HTMLElement | null;
  return opener &&
    opener !== document.body &&
    typeof opener.focus === "function"
    ? opener
    : null;
}

/** Focus on open: `[autofocus]` / `[data-autofocus]` (selected for `data-autofocus="select"`), else the panel. */
export function focusInitial(panel: HTMLElement): void {
  const target = panel.querySelector<HTMLElement>(
    "[autofocus], [data-autofocus]",
  );
  (target ?? panel).focus();
  if (
    (target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement) &&
    target.dataset["autofocus"] === "select"
  ) {
    target.select();
  }
}

/**
 * Whether closing should reclaim focus: it is still inside the panel, or lost (on
 * `<body>`, or gone with a removed node). An owner that moved it elsewhere keeps it.
 */
export function focusLost(panel: HTMLElement | null): boolean {
  const current = document.activeElement;
  return (
    !current ||
    current === document.body ||
    !!panel?.contains(current) ||
    !current.isConnected
  );
}

export interface ModalFocusOptions {
  readonly layer: () => HTMLElement | null;
  readonly panel: () => HTMLElement | null;
  readonly dismissible: () => boolean;
  readonly dismiss: () => void;
}

export interface ModalFocus {
  /** Joins the stack of open overlays and listens on the document; false when already active. */
  activate(): boolean;
  /** The panel is rendered: document-level keys and focus are handled from now on; false when no longer active. */
  ready(): boolean;
  /** Leaves the stack and stops listening; false when it was not active. */
  deactivate(): boolean;
  cycle(backwards: boolean): void;
  dismissIfAllowed(): void;
}

/** The open overlays, oldest first: only the topmost answers document-level keys. */
const openOverlays: object[] = [];

/**
 * The document-level half of a modal: Tab and Escape while focus fell to `<body>`, and
 * focus that escapes to the page behind the overlay is pulled back in.
 */
export function createModalFocus(options: ModalFocusOptions): ModalFocus {
  const token = {};
  let active = false;
  let ready = false;
  const isTopmost = (): boolean =>
    openOverlays[openOverlays.length - 1] === token;
  const cycle = (backwards: boolean): void =>
    cycleFocus(options.panel(), backwards);
  const dismissIfAllowed = (): void => {
    if (options.dismissible()) options.dismiss();
  };

  // Focus fell out of every element (on `<body>`): the panel's own keydown cannot
  // hear the key, so the topmost overlay answers here.
  const onDocumentKeydown = (event: KeyboardEvent): void => {
    if (!ready || !isTopmost() || event.defaultPrevented) return;
    const current = document.activeElement;
    if (
      current &&
      current !== document.body &&
      current !== document.documentElement
    )
      return;
    if (event.key === "Tab") {
      event.preventDefault();
      cycle(event.shiftKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      dismissIfAllowed();
    }
  };

  const onDocumentFocusIn = (event: FocusEvent): void => {
    if (!ready || !isTopmost()) return;
    const layer = options.layer();
    const target = event.target;
    if (!layer || !(target instanceof Node) || layer.contains(target)) return;
    // A node placed after the overlay in the document was portaled after it opened
    // (menu, popover, nested dialog) and stacks on top — leave it be.
    if (
      layer.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING
    )
      return;
    cycle(false);
  };

  return {
    activate() {
      if (active) return false;
      active = true;
      openOverlays.push(token);
      document.addEventListener("keydown", onDocumentKeydown);
      document.addEventListener("focusin", onDocumentFocusIn);
      return true;
    },
    ready() {
      if (active) ready = true;
      return active;
    },
    deactivate() {
      if (!active) return false;
      active = false;
      ready = false;
      const i = openOverlays.indexOf(token);
      if (i >= 0) openOverlays.splice(i, 1);
      document.removeEventListener("keydown", onDocumentKeydown);
      document.removeEventListener("focusin", onDocumentFocusIn);
      return true;
    },
    cycle,
    dismissIfAllowed,
  };
}
