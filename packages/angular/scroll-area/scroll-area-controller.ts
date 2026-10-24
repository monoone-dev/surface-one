// The scroll area, with no framework in it: the Angular `soneScrollArea`, the Vue and
// React `SoneScrollArea` (through @surface-one/core) share it. The scrolling and the
// scrollbars are the browser's own (thin and token-coloured by CSS); this only tells the
// stylesheet and assistive technology what the browser knows: whether the area scrolls
// (then it is a keyboard stop) and whether content is hidden before or after the view
// (the fade edges).

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

/** The scroll metrics of an element (`HTMLElement` has them all). */
export interface ScrollAreaMetrics {
  readonly scrollTop: number;
  readonly scrollHeight: number;
  readonly clientHeight: number;
  readonly scrollLeft: number;
  readonly scrollWidth: number;
  readonly clientWidth: number;
}

export interface ScrollAreaOverflow {
  /** The content overflows along an axis the area scrolls. */
  readonly scrollable: boolean;
  /** Content is hidden before the view along the fade axis (above, or to the start). */
  readonly start: boolean;
  /** Content is hidden after the view along the fade axis (below, or to the end). */
  readonly end: boolean;
}

/** Sub-pixel layouts leave a fraction of a pixel of "overflow": ignore it. */
const SLACK = 1;

/**
 * What overflows: `scrollable` along the axes `orientation` scrolls, `start` / `end`
 * along its fade axis (vertical, unless it scrolls horizontally only). The horizontal
 * offset is read as a distance, so a right-to-left area (negative `scrollLeft`) works.
 */
export function scrollAreaOverflow(
  m: ScrollAreaMetrics,
  orientation: ScrollAreaOrientation,
): ScrollAreaOverflow {
  const overY = m.scrollHeight - m.clientHeight > SLACK;
  const overX = m.scrollWidth - m.clientWidth > SLACK;
  const scrollable =
    orientation === "vertical"
      ? overY
      : orientation === "horizontal"
        ? overX
        : overY || overX;
  if (orientation === "horizontal") {
    const at = Math.abs(m.scrollLeft);
    return {
      scrollable,
      start: overX && at > SLACK,
      end: overX && at < m.scrollWidth - m.clientWidth - SLACK,
    };
  }
  return {
    scrollable,
    start: overY && m.scrollTop > SLACK,
    end: overY && m.scrollTop < m.scrollHeight - m.clientHeight - SLACK,
  };
}

export interface ScrollArea {
  /** Re-reads the overflow (after the owner changed the content or the orientation). */
  update(): void;
  /** Stops watching; removes what it added. */
  disconnect(): void;
}

const set = (el: HTMLElement, name: string, on: boolean): void => {
  if (on) el.setAttribute(name, "");
  else el.removeAttribute(name);
};

/**
 * Watches `el` (scroll, its size and its children's) and keeps on it: `tabindex="0"`
 * while it scrolls and the owner set no tabindex of its own (a scrollable region must be
 * reachable by keyboard), `role="region"` when it is named (`aria-label` /
 * `aria-labelledby`) and has no role, and `data-scrollable`, `data-overflow-start`,
 * `data-overflow-end` for the stylesheet's fade edges. Browser only.
 */
export function createScrollArea(
  el: HTMLElement,
  orientation: () => ScrollAreaOrientation,
): ScrollArea {
  const ownTabindex = el.hasAttribute("tabindex");
  const ownRole = el.hasAttribute("role");
  let frame = 0;
  const win = el.ownerDocument.defaultView;

  const update = (): void => {
    const o = scrollAreaOverflow(el, orientation());
    set(el, "data-scrollable", o.scrollable);
    set(el, "data-overflow-start", o.start);
    set(el, "data-overflow-end", o.end);
    if (!ownTabindex) {
      if (o.scrollable) el.setAttribute("tabindex", "0");
      else el.removeAttribute("tabindex");
    }
    if (!ownRole) {
      const named =
        el.hasAttribute("aria-label") || el.hasAttribute("aria-labelledby");
      if (named) el.setAttribute("role", "region");
      else el.removeAttribute("role");
    }
  };
  const onScroll = (): void => {
    if (frame || !win) return;
    frame = win.requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  el.addEventListener("scroll", onScroll, { passive: true });
  const resize =
    win && "ResizeObserver" in win ? new win.ResizeObserver(update) : null;
  const observeChildren = (): void => {
    if (!resize) return;
    resize.observe(el);
    for (const child of Array.from(el.children)) resize.observe(child);
  };
  observeChildren();
  const mutations =
    win && "MutationObserver" in win
      ? new win.MutationObserver(() => {
          resize?.disconnect();
          observeChildren();
          update();
        })
      : null;
  mutations?.observe(el, { childList: true });
  update();

  return {
    update,
    disconnect() {
      el.removeEventListener("scroll", onScroll);
      resize?.disconnect();
      mutations?.disconnect();
      if (frame && win) win.cancelAnimationFrame(frame);
      frame = 0;
      for (const name of [
        "data-scrollable",
        "data-overflow-start",
        "data-overflow-end",
      ])
        el.removeAttribute(name);
      if (!ownTabindex) el.removeAttribute("tabindex");
      if (!ownRole) el.removeAttribute("role");
    },
  };
}
