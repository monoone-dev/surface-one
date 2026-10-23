// The menu behaviour outside Angular: the menu-button trigger (the twin of
// `soneMenuTrigger` in packages/angular/menu/overlay-trigger.ts), the submenu
// placement and the checked-item attributes. Browser-only unless noted.
import {
  computeFloatingPosition,
  createTypeaheadBuffer,
  isTypeaheadKey,
  listNavigationIndex,
  typeaheadIndex,
  type FloatingAlign,
  type FloatingSide,
} from "./angular";
import { tabbableElements } from "./focus";

/** `aria-checked` and `data-state` of a checkbox / radio / switch item. Server-safe. */
export const menuCheckedAttrs = (on: boolean | undefined) => ({
  "aria-checked": on ? "true" : "false",
  "data-state": on ? "checked" : "unchecked",
});

const SUB_GAP_PX = 4;
const SUB_MARGIN_PX = 8;

/**
 * Places a submenu (`position: fixed`) beside its sub trigger: to the right of the
 * parent menu, else to its left, its height capped to the viewport.
 */
export function placeSubmenu(node: HTMLElement, anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  const parent = anchor.closest<HTMLElement>('[data-slot="menu"]');
  const edge = parent?.getBoundingClientRect() ?? rect;
  const width = node.offsetWidth;
  const right = edge.right + SUB_GAP_PX;
  const left =
    right + width <= window.innerWidth - SUB_MARGIN_PX
      ? right
      : Math.max(SUB_MARGIN_PX, edge.left - width - SUB_GAP_PX);
  const maxHeight = window.innerHeight - 2 * SUB_MARGIN_PX;
  if (node.offsetHeight > maxHeight) {
    node.style.maxHeight = `${Math.floor(maxHeight)}px`;
  }
  const height = Math.min(node.offsetHeight, maxHeight);
  const top = Math.max(
    SUB_MARGIN_PX,
    Math.min(rect.top, window.innerHeight - SUB_MARGIN_PX - height),
  );
  node.style.left = `${Math.round(left)}px`;
  node.style.top = `${Math.round(top)}px`;
  node.dataset["placed"] = "";
}

/**
 * Calls `onChange` when a floating panel next to `anchor` may need to move: a
 * scroll anywhere outside `panel`, a window resize, or the end of an animation /
 * transition on the anchor or one of its ancestors. Returns the cleanup function.
 * (packages/angular/core/focus-scope.ts's, which imports @angular/core;
 * test/menu.test.ts keeps them identical.)
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

const MENU_ITEM_SELECTOR =
  "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']";
const KEEP_OPEN_SELECTOR = "[aria-haspopup='menu'], [data-menu-keep-open]";

export interface MenuTriggerOptions {
  /** The trigger element (the menu button). */
  readonly trigger: () => HTMLElement | null;
  /** The `.overlay-positioner` the framework renders on `<body>` while open. */
  readonly positioner: () => HTMLElement | null;
  readonly isOpen: () => boolean;
  /** Opens or closes: the framework re-renders (and calls `attached` / `detached`). */
  readonly setOpen: (open: boolean) => void;
  readonly side: () => FloatingSide;
  readonly align: () => FloatingAlign;
  readonly offset: () => number;
  readonly keepOpenOnOutsideClick: () => boolean;
  /** The id of the panel (`aria-controls`), or `null` once it is gone. */
  readonly controls?: (id: string | null) => void;
}

/** The fields of a DOM or React keyboard event the trigger reads. */
export interface MenuTriggerKeyEvent {
  readonly key: string;
  readonly shiftKey: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface MenuTrigger {
  /** The trigger's click: toggles; a keyboard click (`detail` 0) focuses the first item. */
  triggerClick(event: { readonly detail: number }): void;
  /** Enter / Space / ArrowDown open on the first item, ArrowUp on the last; Escape closes. */
  triggerKeyDown(event: MenuTriggerKeyEvent): void;
  /** The positioner is in the DOM: place it, listen, move focus in. */
  attached(): void;
  /** The positioner is (about to be) removed. Safe to call more than once. */
  detached(): void;
  /** Closes the menu; with `restoreFocus` (or focus inside it), focus goes back to the trigger. */
  close(restoreFocus?: boolean): void;
  /** Re-measures and re-places the open panel. */
  reposition(): void;
}

/** Open triggers, oldest first: Escape on `<body>` closes the newest one only. */
const openTriggers: object[] = [];
let nextPanelId = 0;

/**
 * A menu button (WAI-ARIA menu button pattern, spartan/ui `brnMenuTrigger`): the menu
 * floats next to the trigger (`computeFloatingPosition`, re-placed on scroll and
 * resize), Arrow keys / Home / End / typeahead move over its items, Enter / Space
 * activate, and it closes on activation, Escape, Tab or a click outside. Its items
 * leave the Tab order while it is open.
 */
export function createMenuTrigger(options: MenuTriggerOptions): MenuTrigger {
  const token = {};
  const typeahead = createTypeaheadBuffer();
  let focusOnOpen: "first" | "last" | null = null;
  const cleanups: (() => void)[] = [];
  let savedTabindex = new Map<HTMLElement, string | null>();
  let attachedTo: HTMLElement | null = null;

  const doc = (): Document =>
    options.trigger()?.ownerDocument ?? globalThis.document;

  const items = (): HTMLElement[] => {
    const positioner = attachedTo;
    if (!positioner) return [];
    const all = Array.from(
      positioner.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
    );
    for (const item of all) manage(item);
    return all.filter(
      (item) =>
        item.getAttribute("aria-disabled") !== "true" &&
        !(item instanceof HTMLButtonElement && item.disabled) &&
        !item.closest("[hidden]"),
    );
  };

  /** Takes an item out of the Tab order (arrow keys move focus there). */
  const manage = (item: HTMLElement): void => {
    if (savedTabindex.has(item)) return;
    savedTabindex.set(item, item.getAttribute("tabindex"));
    item.setAttribute("tabindex", "-1");
  };

  const focusItem = (which: "first" | "last"): void => {
    const list = items();
    list[which === "first" ? 0 : list.length - 1]?.focus();
  };

  const place = (): void => {
    const positioner = attachedTo;
    const trigger = options.trigger();
    const win = doc().defaultView;
    if (!positioner || !trigger || !win) return;
    positioner.style.maxHeight = "";
    positioner.style.left = "0px";
    positioner.style.top = "0px";
    const placed = computeFloatingPosition(
      trigger.getBoundingClientRect(),
      { width: positioner.offsetWidth, height: positioner.offsetHeight },
      {
        width: doc().documentElement.clientWidth || win.innerWidth,
        height: win.innerHeight,
      },
      {
        side: options.side(),
        align: options.align(),
        offset: options.offset(),
      },
    );
    positioner.style.left = `${Math.round(placed.x)}px`;
    positioner.style.top = `${Math.round(placed.y)}px`;
    positioner.style.maxHeight = `${placed.maxHeight}px`;
    positioner.setAttribute("data-side", placed.side);
    positioner.setAttribute("data-align", placed.align);
    positioner.setAttribute("data-placed", "");
  };

  /** True when `target` is part of this layer: the trigger, the panel, or an overlay opened above it. */
  const isInsideLayer = (target: Node): boolean => {
    const positioner = attachedTo;
    if (!positioner) return false;
    if (options.trigger()?.contains(target) || positioner.contains(target))
      return true;
    // Overlays opened later (a nested popover, a dialog opened from the panel)
    // are appended to <body> after this one.
    const body = doc().body;
    let top: Node = target;
    while (top.parentNode && top.parentNode !== body) top = top.parentNode;
    return (
      top.parentNode === body &&
      !!(
        positioner.compareDocumentPosition(top) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    );
  };

  const detached = (): void => {
    if (!attachedTo) return;
    for (const fn of cleanups.splice(0)) fn();
    const i = openTriggers.indexOf(token);
    if (i >= 0) openTriggers.splice(i, 1);
    for (const [item, saved] of savedTabindex) {
      if (saved === null) item.removeAttribute("tabindex");
      else item.setAttribute("tabindex", saved);
    }
    savedTabindex = new Map();
    attachedTo = null;
    options.controls?.(null);
  };

  const close = (restoreFocus = false): void => {
    const focusWasInside =
      !!attachedTo && attachedTo.contains(doc().activeElement);
    detached();
    options.setOpen(false);
    if (restoreFocus || focusWasInside) options.trigger()?.focus();
  };

  const onPanelKeydown = (event: KeyboardEvent): void => {
    const key = event.key;
    if (key === "Tab") {
      // APG menu: Tab closes the menu. An enclosing dialog may already have moved
      // focus on (default prevented); otherwise focusing the trigger lets the
      // browser's own Tab move on from it.
      close(!event.defaultPrevented);
      return;
    }
    if (key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    const list = items();
    const active = doc().activeElement as HTMLElement | null;
    const current = list.findIndex((item) => item === active);
    const next = listNavigationIndex(key, current, list.length);
    if (next !== null) {
      event.preventDefault();
      list[next]?.focus();
      return;
    }
    if ((key === "Enter" || key === " ") && active && current >= 0) {
      event.preventDefault();
      active.click();
      return;
    }
    if (isTypeaheadKey(event)) {
      const labels = list.map((item) => item.textContent ?? "");
      const index = typeaheadIndex(labels, current, typeahead(key));
      if (index >= 0) {
        event.preventDefault();
        list[index]?.focus();
      }
    }
  };

  const onPanelClick = (event: MouseEvent): void => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest<HTMLElement>(MENU_ITEM_SELECTOR);
    if (
      !item ||
      !attachedTo?.contains(item) ||
      item.matches(KEEP_OPEN_SELECTOR) ||
      item.getAttribute("aria-disabled") === "true" ||
      (item instanceof HTMLButtonElement && item.disabled)
    ) {
      return;
    }
    close(true);
  };

  const onPanelFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    // `null`: focus left the window, or a click on something unfocusable (the
    // pointerdown handler owns clicks).
    if (!(next instanceof Node) || isInsideLayer(next)) return;
    close(false);
  };

  const onDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target;
    if (
      options.keepOpenOnOutsideClick() ||
      !(target instanceof Node) ||
      isInsideLayer(target)
    ) {
      return;
    }
    close(false);
  };

  const onDocumentKeydown = (event: KeyboardEvent): void => {
    // Focus fell to <body>: neither the trigger nor the panel can hear the key.
    if (event.key !== "Escape" || event.defaultPrevented) return;
    const active = doc().activeElement;
    if (active && active !== doc().body) return;
    if (openTriggers[openTriggers.length - 1] !== token) return;
    event.preventDefault();
    close(true);
  };

  const focusPanel = (): void => {
    const focus = focusOnOpen;
    focusOnOpen = null;
    if (focus) {
      focusItem(focus);
      return;
    }
    const panel = attachedTo?.firstElementChild;
    if (!(panel instanceof HTMLElement)) return;
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    panel.focus();
  };

  return {
    triggerClick(event) {
      if (options.isOpen()) {
        close(false);
        return;
      }
      focusOnOpen = event.detail === 0 ? "first" : null;
      options.setOpen(true);
    },
    triggerKeyDown(event) {
      const key = event.key;
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(key)) {
        event.preventDefault();
        const target = key === "ArrowUp" ? "last" : "first";
        if (options.isOpen()) {
          focusItem(target);
        } else {
          focusOnOpen = target;
          options.setOpen(true);
        }
        return;
      }
      if (!options.isOpen()) return;
      if (key === "Escape") {
        // Before an enclosing dialog's own Escape handler: close the innermost layer first.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (key === "Tab" && !event.shiftKey && attachedTo) {
        // The panel sits right after its trigger in the Tab order.
        const first = tabbableElements(attachedTo)[0];
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    attached() {
      const positioner = options.positioner();
      if (!positioner || !options.isOpen()) return;
      if (attachedTo === positioner) {
        place();
        return;
      }
      detached();
      attachedTo = positioner;
      openTriggers.push(token);
      const panel = positioner.firstElementChild;
      if (panel instanceof HTMLElement) {
        if (!panel.id) panel.id = `sone-overlay-panel-${++nextPanelId}`;
        options.controls?.(panel.id);
      }
      items();
      const listen = <K extends keyof DocumentEventMap>(
        target: HTMLElement | Document,
        type: K,
        handler: (event: DocumentEventMap[K]) => void,
        capture = false,
      ): void => {
        const fn = handler as EventListener;
        target.addEventListener(type, fn, capture);
        cleanups.push(() => target.removeEventListener(type, fn, capture));
      };
      const d = doc();
      listen(positioner, "keydown", onPanelKeydown);
      listen(positioner, "click", onPanelClick);
      listen(positioner, "focusout", onPanelFocusOut);
      listen(d, "pointerdown", onDocumentPointerDown, true);
      listen(d, "keydown", onDocumentKeydown);
      const win = d.defaultView;
      if (win) {
        cleanups.push(
          listenForReposition(win, positioner, options.trigger, place),
        );
      }
      place();
      focusPanel();
    },
    detached,
    close,
    reposition: place,
  };
}
