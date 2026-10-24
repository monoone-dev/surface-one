// The drawer's swipe, with no framework in it: the Angular `sone-drawer`, the Vue and
// React `SoneDrawer` (through @surface-one/core) share it. The drawer is a sheet (the
// overlay does focus, Escape, the scrim and returning focus); this lets a pointer drag
// it toward its edge to dismiss it, or between its snap points (Vaul, shadcn/ui Drawer).

export type DrawerSide = "top" | "right" | "bottom" | "left";

/** A drag this far along the closing direction (of the drawer's size) dismisses it. */
export const DRAWER_DISMISS_THRESHOLD = 0.25;
/** A release faster than this (px / ms) is a flick: it dismisses, or moves one snap point. */
export const DRAWER_FLICK_VELOCITY = 0.5;
/** Movement under this (px) is a click, not a drag. */
const DRAG_SLOP = 4;

/** How far a pointer movement of `dx`, `dy` pushes the drawer toward its edge (px; negative pulls it open). */
export function drawerDragDistance(
  side: DrawerSide,
  dx: number,
  dy: number,
): number {
  switch (side) {
    case "bottom":
      return dy;
    case "top":
      return -dy;
    case "right":
      return dx;
    case "left":
      return -dx;
  }
}

/** Pulling past fully open gives way less and less (a rubber band), never more than `max`. */
export function drawerDampen(distance: number, max = 24): number {
  if (distance >= 0) return distance;
  const pull = -distance;
  return -(max * (1 - 1 / (pull / max + 1)));
}

export interface DrawerReleaseInput {
  /** How far toward its edge the drawer sits when released, from fully open (px). */
  readonly offset: number;
  /** The drawer's size along its axis (px). */
  readonly size: number;
  /** The release speed toward the edge (px / ms; negative toward open). */
  readonly velocity: number;
  /** The visible fractions it rests at, ascending; empty: open or dismissed only. */
  readonly snapPoints: readonly number[];
}

/** Where a released drawer goes: dismissed, or to a snap point (`null` when it has none: fully open). */
export type DrawerRelease =
  | { readonly dismiss: true }
  | { readonly dismiss: false; readonly snap: number | null };

/**
 * Decides a release. Without snap points: dismissed past a quarter of its size or on a
 * flick toward the edge, else back open. With snap points: a flick moves one snap point
 * (past the lowest it dismisses), otherwise it settles on the nearest, and well below
 * the lowest it dismisses.
 */
export function drawerRelease(input: DrawerReleaseInput): DrawerRelease {
  const { offset, size, velocity, snapPoints } = input;
  if (size <= 0) return { dismiss: false, snap: null };
  if (snapPoints.length === 0) {
    if (
      offset > size * DRAWER_DISMISS_THRESHOLD ||
      (velocity > DRAWER_FLICK_VELOCITY && offset > 0)
    )
      return { dismiss: true };
    return { dismiss: false, snap: null };
  }
  const visible = 1 - offset / size;
  if (Math.abs(velocity) > DRAWER_FLICK_VELOCITY) {
    // The snap point nearest where the drag started from, then one step along the flick.
    const below = snapPoints.filter((s) => s < visible - 1e-3);
    const above = snapPoints.filter((s) => s > visible + 1e-3);
    if (velocity > 0)
      return below.length > 0
        ? { dismiss: false, snap: below[below.length - 1] }
        : { dismiss: true };
    return {
      dismiss: false,
      snap: above[0] ?? snapPoints[snapPoints.length - 1],
    };
  }
  const lowest = snapPoints[0];
  if (visible < lowest * (1 - DRAWER_DISMISS_THRESHOLD * 2))
    return { dismiss: true };
  let snap = lowest;
  for (const s of snapPoints)
    if (Math.abs(s - visible) < Math.abs(snap - visible)) snap = s;
  return { dismiss: false, snap };
}

/** The offset (px toward the edge) that leaves `snap` of a drawer of `size` visible. */
export const drawerSnapOffset = (snap: number | null, size: number): number =>
  snap === null ? 0 : Math.max(0, (1 - snap) * size);

/** What the swipe reads from, and writes back to, the drawer that owns it. */
export interface DrawerSwipeHost {
  side(): DrawerSide;
  /** The visible fractions it rests at, ascending (empty: none). */
  snapPoints(): readonly number[];
  /** The snap point it rests at (`null`: fully open). */
  activeSnapPoint(): number | null;
  setActiveSnapPoint(snap: number | null): void;
  /** Swiped away: dismiss it the way its close button does. */
  dismiss(): void;
  /** May it be dismissed? */
  dismissible(): boolean;
}

export interface DrawerSwipe {
  /** A press on the panel: drags it when it starts on the handle or on content that is not scrolled or interactive. */
  pointerDown(event: PointerEvent, panel: HTMLElement): void;
  /** Places the panel at its active snap point (after it opens or the snap point changes). */
  place(panel: HTMLElement | null): void;
  /** A click on the handle: the next snap point (wrapping), when there are several. */
  cycle(): void;
  /** Focus moved to `target` inside the panel: open it fully so it is in view. */
  focused(target: EventTarget | null, panel: HTMLElement): void;
}

const INTERACTIVE =
  "input, textarea, select, button, a[href], [contenteditable], [role='slider'], [data-drawer-no-drag]";

/** Whether `target` sits in something scrolled away from where the drag would start. */
function inScrolledContent(
  target: Element,
  panel: HTMLElement,
  side: DrawerSide,
): boolean {
  for (let el: Element | null = target; el; el = el.parentElement) {
    if (el instanceof HTMLElement) {
      const vertical = side === "top" || side === "bottom";
      const scrolls = vertical
        ? el.scrollHeight > el.clientHeight
        : el.scrollWidth > el.clientWidth;
      if (scrolls) {
        if (side === "bottom" && el.scrollTop > 0) return true;
        if (side === "top" && el.scrollTop < el.scrollHeight - el.clientHeight)
          return true;
        if (side === "right" && Math.abs(el.scrollLeft) > 0) return true;
        if (
          side === "left" &&
          Math.abs(el.scrollLeft) < el.scrollWidth - el.clientWidth
        )
          return true;
      }
    }
    if (el === panel) break;
  }
  return false;
}

const axisTranslate = (side: DrawerSide, px: number): string => {
  const signed = side === "bottom" || side === "right" ? px : -px;
  return side === "top" || side === "bottom"
    ? `0 ${signed}px`
    : `${signed}px 0`;
};

/**
 * Pointer swipes over a drawer panel: it follows the pointer toward its edge (and a
 * little the other way, damped), then is dismissed or settles on a snap point. The
 * panel's `translate` carries the offset (its entry animation uses `transform`), and
 * `data-dragging` turns its transition off meanwhile.
 */
export function createDrawerSwipe(host: DrawerSwipeHost): DrawerSwipe {
  const size = (panel: HTMLElement): number => {
    const rect = panel.getBoundingClientRect();
    const side = host.side();
    return side === "top" || side === "bottom" ? rect.height : rect.width;
  };
  const place = (panel: HTMLElement | null): void => {
    if (!panel) return;
    const offset = drawerSnapOffset(host.activeSnapPoint(), size(panel));
    panel.style.translate = offset ? axisTranslate(host.side(), offset) : "";
  };

  return {
    place,
    cycle() {
      const snaps = host.snapPoints();
      if (snaps.length < 2) return;
      const at = snaps.indexOf(host.activeSnapPoint() ?? snaps[0]);
      host.setActiveSnapPoint(snaps[(at + 1) % snaps.length]);
    },
    focused(target, panel) {
      const snaps = host.snapPoints();
      if (snaps.length === 0 || target === panel) return;
      const top = snaps[snaps.length - 1];
      if (host.activeSnapPoint() !== top) host.setActiveSnapPoint(top);
    },
    pointerDown(event, panel) {
      if (event.button !== 0 || !event.isPrimary) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const onHandle = !!target.closest('[data-slot="drawer-handle"]');
      const side = host.side();
      if (
        !onHandle &&
        (target.closest(INTERACTIVE) || inScrolledContent(target, panel, side))
      )
        return;
      const startX = event.clientX;
      const startY = event.clientY;
      const total = size(panel);
      const base = drawerSnapOffset(host.activeSnapPoint(), total);
      let dragging = false;
      let last = { t: event.timeStamp, d: 0 };
      let velocity = 0;
      let offset = base;

      const move = (e: PointerEvent): void => {
        if (e.pointerId !== event.pointerId) return;
        const d = drawerDragDistance(
          side,
          e.clientX - startX,
          e.clientY - startY,
        );
        if (!dragging) {
          if (Math.abs(d) < DRAG_SLOP) return;
          dragging = true;
          panel.setPointerCapture?.(e.pointerId);
          panel.setAttribute("data-dragging", "");
        }
        const dt = e.timeStamp - last.t;
        if (dt > 0) velocity = (d - last.d) / dt;
        last = { t: e.timeStamp, d };
        offset = base + d < 0 ? drawerDampen(base + d) : base + d;
        if (!host.dismissible()) offset = Math.min(offset, total * 0.1 + base);
        panel.style.translate = axisTranslate(side, offset);
      };
      const end = (e: PointerEvent): void => {
        if (e.pointerId !== event.pointerId) return;
        doc.removeEventListener("pointermove", move);
        doc.removeEventListener("pointerup", end);
        doc.removeEventListener("pointercancel", end);
        if (!dragging) return;
        panel.removeAttribute("data-dragging");
        // A drag is not a click on what it started on.
        const swallow = (c: Event): void => {
          c.stopPropagation();
          c.preventDefault();
        };
        panel.addEventListener("click", swallow, { capture: true, once: true });
        setTimeout(() => panel.removeEventListener("click", swallow, true), 0);
        const release = drawerRelease({
          offset: Math.max(0, offset),
          size: total,
          velocity: e.type === "pointercancel" ? 0 : velocity,
          snapPoints: host.snapPoints(),
        });
        if (release.dismiss && host.dismissible()) {
          host.dismiss();
          return;
        }
        const snap = release.dismiss
          ? (host.snapPoints()[0] ?? null)
          : release.snap;
        if (snap !== host.activeSnapPoint()) host.setActiveSnapPoint(snap);
        place(panel);
      };
      const doc = panel.ownerDocument;
      doc.addEventListener("pointermove", move);
      doc.addEventListener("pointerup", end);
      doc.addEventListener("pointercancel", end);
    },
  };
}
