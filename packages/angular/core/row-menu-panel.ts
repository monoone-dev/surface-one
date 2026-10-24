// The row menu's panel logic outside Angular: which items it holds, which clicks close
// it and where its fixed panel goes. sone-row-menu and its Vue and React twins share it
// (core re-exports this file). Browser-only.
import {
  computeFloatingPosition,
  type FloatingPosition,
} from "./floating-position";
import { listNavigationIndex } from "./list-navigation";

const PANEL_GAP_PX = 4;
const VIEWPORT_MARGIN_PX = 8;
const MENU_ITEM_SELECTOR =
  "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']";
const KEEP_OPEN_SELECTOR = "[aria-haspopup='menu'], [data-menu-keep-open]";

/** The menu items of a row menu panel that take focus (not disabled). */
export function rowMenuEnabledItems(
  panel: HTMLElement | null | undefined,
): HTMLElement[] {
  if (!panel) {
    return [];
  }
  return Array.from(
    panel.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
  ).filter(
    (item) =>
      item.getAttribute("aria-disabled") !== "true" &&
      (!(item instanceof HTMLButtonElement) || !item.disabled),
  );
}

/**
 * Whether a click inside the panel activated an item that closes the menu: an enabled
 * menu item that opens no submenu and is not marked `data-menu-keep-open`.
 */
export function rowMenuClosesOnClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  const item = target.closest<HTMLElement>(MENU_ITEM_SELECTOR);
  return !(
    !item ||
    item.matches(KEEP_OPEN_SELECTOR) ||
    item.getAttribute("aria-disabled") === "true" ||
    (item instanceof HTMLButtonElement && item.disabled)
  );
}

/**
 * The item to focus for Arrow Up / Down, Home and End in an open panel (`null` for any
 * other key or an empty menu). The caller prevents the key's default when it gets one.
 */
export function rowMenuNavigationTarget(
  panel: HTMLElement | null | undefined,
  key: string,
): HTMLElement | null {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
    return null;
  }
  const items = rowMenuEnabledItems(panel);
  if (items.length === 0) {
    return null;
  }
  const current = panel?.ownerDocument.activeElement;
  const index = listNavigationIndex(
    key,
    items.findIndex((item) => item === current),
    items.length,
  );
  return index === null ? null : (items[index] ?? null);
}

export interface RowMenuPanelPlacement {
  /** The `sone-row-menu` host. */
  readonly host: HTMLElement;
  readonly trigger: HTMLElement;
  /** The rendered (still hidden) panel, measured for its size. */
  readonly panel: HTMLElement;
  readonly side: "bottom" | "top" | "right";
  readonly align: "start" | "end";
  /** For `side: "right"`: a selector of the ancestor whose right edge the panel opens from. */
  readonly sideEdge: string | null;
  /** Keep the panel inside every scrolling ancestor vertically. */
  readonly clipToScrollParents: boolean;
}

/**
 * Where the fixed panel goes: next to the trigger (or the `sideEdge` ancestor), its
 * horizontal room the viewport, its vertical room also clipped by every scrolling
 * ancestor so it never hangs past its list. `bottom` flips above when there is more
 * room; `top` and `right` are hard choices. `null` without a window.
 */
export function placeRowMenuPanel(
  placement: RowMenuPanelPlacement,
): FloatingPosition | null {
  const { host, trigger, panel, side } = placement;
  const view = host.ownerDocument.defaultView;
  if (!view) {
    return null;
  }
  const anchorRect = trigger.getBoundingClientRect();
  let boundaryTop = VIEWPORT_MARGIN_PX;
  let boundaryBottom = view.innerHeight - VIEWPORT_MARGIN_PX;

  for (
    let ancestor = placement.clipToScrollParents ? host.parentElement : null;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    const overflowY = view.getComputedStyle(ancestor).overflowY;
    if (overflowY !== "auto" && overflowY !== "scroll") {
      continue;
    }
    const rect = ancestor.getBoundingClientRect();
    boundaryTop = Math.max(boundaryTop, rect.top);
    boundaryBottom = Math.min(boundaryBottom, rect.bottom);
  }

  const boundary = {
    left: VIEWPORT_MARGIN_PX,
    right: view.innerWidth - VIEWPORT_MARGIN_PX,
    top: boundaryTop,
    bottom: boundaryBottom,
  };
  const size = { width: panel.offsetWidth, height: panel.offsetHeight };
  const edgeSelector = side === "right" ? placement.sideEdge : null;
  const edge = edgeSelector ? host.closest(edgeSelector) : null;
  const anchor = edge
    ? {
        top: anchorRect.top,
        bottom: anchorRect.bottom,
        left: anchorRect.left,
        right: edge.getBoundingClientRect().right,
      }
    : anchorRect;
  return computeFloatingPosition(anchor, size, boundary, {
    side,
    align: side === "right" ? "start" : placement.align,
    offset: PANEL_GAP_PX,
    flip: side === "bottom",
  });
}
