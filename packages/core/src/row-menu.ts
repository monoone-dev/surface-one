// The behaviour of the row menu outside Angular (the twin of the logic inside
// packages/angular/row-menu/row-menu.component.ts): a ⋯ trigger whose menu panel
// floats on <body>, placed by `placeRowMenuPanel`. Browser-only unless noted.
import {
  placeRowMenuPanel,
  rowMenuClosesOnClick,
  rowMenuEnabledItems,
  rowMenuNavigationTarget,
} from "./angular";
import { listenForReposition } from "./menu";

export type RowMenuSide = "bottom" | "top" | "right";
export type RowMenuAlign = "start" | "end";

export interface RowMenuOptions {
  /** The `sone-row-menu` host. */
  readonly host: () => HTMLElement | null;
  readonly trigger: () => HTMLElement | null;
  /** The panel the framework renders on <body> while open. */
  readonly panel: () => HTMLElement | null;
  readonly isOpen: () => boolean;
  /** Opens or closes: the framework re-renders (and calls `attached` / `detached`). */
  readonly setOpen: (open: boolean) => void;
  readonly disabled: () => boolean;
  readonly side: () => RowMenuSide;
  readonly align: () => RowMenuAlign;
  readonly sideEdge: () => string | null;
  readonly clipToScrollParents: () => boolean;
}

/** The fields of a DOM or React keyboard event the row menu reads. */
export interface RowMenuKeyEvent {
  readonly key: string;
  preventDefault(): void;
}

export interface RowMenu {
  /** The trigger's click: toggles; a keyboard click (`detail` 0) focuses the first item. */
  triggerClick(event: { readonly detail: number }): void;
  /** Enter / Space / ArrowDown open on the first item, ArrowUp on the last. */
  triggerKeyDown(event: RowMenuKeyEvent): void;
  /** A click in the panel: an activated item closes the menu. */
  panelClick(event: { readonly target: EventTarget | null }): void;
  /** Arrow Up / Down, Home / End move over the items; Tab closes. */
  panelKeyDown(event: RowMenuKeyEvent): void;
  /** The panel is in the DOM: place it, listen, move focus in. */
  attached(): void;
  /** The panel is (about to be) removed. Safe to call more than once. */
  detached(): void;
  /** Closes the menu. */
  close(): void;
}

const POSITIONED = "is-positioned";

/**
 * A row menu (the ⋯ of a tree row, a table row or a page): a WAI-ARIA menu button whose
 * panel is fixed to viewport coordinates on <body>, hidden until placed. It closes on an
 * activated item, Escape (focus back on the trigger), Tab or a click outside, and is
 * re-placed on scroll and resize. The panel's position is written straight to its
 * `style` and its `is-positioned` class, which the framework never binds.
 */
export function createRowMenu(options: RowMenuOptions): RowMenu {
  let focusOnOpen: "first" | "last" | null = null;
  let cleanups: (() => void)[] = [];

  const focusItem = (which: "first" | "last"): void => {
    const items = rowMenuEnabledItems(options.panel());
    items[which === "first" ? 0 : items.length - 1]?.focus();
  };

  const place = (): void => {
    const host = options.host();
    const trigger = options.trigger();
    const panel = options.panel();
    if (!host || !trigger || !panel || !options.isOpen()) return;
    panel.classList.remove(POSITIONED);
    const placed = placeRowMenuPanel({
      host,
      trigger,
      panel,
      side: options.side(),
      align: options.align(),
      sideEdge: options.sideEdge(),
      clipToScrollParents: options.clipToScrollParents(),
    });
    if (!placed) return;
    panel.style.left = `${Math.round(placed.x)}px`;
    panel.style.top = `${Math.round(placed.y)}px`;
    panel.style.maxHeight = `${placed.maxHeight}px`;
    panel.classList.add(POSITIONED);
    if (focusOnOpen) {
      // Consumed first: a nested scroll or resize re-places the panel.
      const which = focusOnOpen;
      focusOnOpen = null;
      focusItem(which);
    }
  };

  const close = (): void => {
    focusOnOpen = null;
    if (options.isOpen()) options.setOpen(false);
  };

  const closeAndRestoreFocus = (): void => {
    const panel = options.panel();
    const focusWasInPanel =
      !!panel && panel.contains(panel.ownerDocument.activeElement);
    close();
    if (focusWasInPanel) options.trigger()?.focus();
  };

  const toggle = (focus: "first" | "last" | null): void => {
    if (options.disabled()) return;
    if (options.isOpen()) {
      close();
      return;
    }
    focusOnOpen = focus;
    options.setOpen(true);
  };

  const detached = (): void => {
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
  };

  return {
    triggerClick: (event) => toggle(event.detail === 0 ? "first" : null),
    triggerKeyDown(event) {
      if (!["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) return;
      event.preventDefault();
      const which = event.key === "ArrowUp" ? "last" : "first";
      if (options.isOpen()) {
        focusItem(which);
        return;
      }
      toggle(which);
    },
    panelClick(event) {
      if (options.isOpen() && rowMenuClosesOnClick(event.target)) {
        closeAndRestoreFocus();
      }
    },
    panelKeyDown(event) {
      if (event.key === "Tab") {
        closeAndRestoreFocus();
        return;
      }
      const next = rowMenuNavigationTarget(options.panel(), event.key);
      if (next) {
        event.preventDefault();
        next.focus();
      }
    },
    attached() {
      detached();
      const panel = options.panel();
      const doc = options.host()?.ownerDocument;
      const win = doc?.defaultView;
      if (!panel || !doc || !win) return;
      const onDocumentClick = (event: MouseEvent): void => {
        const target = event.target as Node | null;
        if (
          !options.isOpen() ||
          (target &&
            (options.host()?.contains(target) ||
              options.panel()?.contains(target)))
        ) {
          return;
        }
        close();
      };
      const onDocumentKeydown = (event: KeyboardEvent): void => {
        if (event.key !== "Escape" || !options.isOpen()) return;
        close();
        options.trigger()?.focus();
      };
      doc.addEventListener("click", onDocumentClick);
      doc.addEventListener("keydown", onDocumentKeydown);
      cleanups.push(
        () => doc.removeEventListener("click", onDocumentClick),
        () => doc.removeEventListener("keydown", onDocumentKeydown),
        listenForReposition(win, panel, options.trigger, place),
      );
      place();
    },
    detached,
    close,
  };
}
