// The resizable panels, with no framework in it: the Angular `sone-resizable-group`,
// the Vue and React `SoneResizableGroup` (through @surface-one/core) share it. Sizes are
// percentages of the group, one per panel, summing to 100; a handle sits between panel
// `i` and `i + 1` and moves the boundary between them (WAI-ARIA window splitter).

export type ResizableDirection = "horizontal" | "vertical";

/** A panel's limits, in percent of the group. */
export interface ResizablePanelLimits {
  /** Its size before any is stored or bound; `null` shares what the others leave. */
  readonly defaultSize: number | null;
  readonly minSize: number;
  readonly maxSize: number;
  /** It can collapse to `collapsedSize` (dragged well past its minimum, or Enter). */
  readonly collapsible: boolean;
  readonly collapsedSize: number;
}

/** The limits of a panel that sets none. */
export const RESIZABLE_PANEL_DEFAULTS: ResizablePanelLimits = {
  defaultSize: null,
  minSize: 0,
  maxSize: 100,
  collapsible: false,
  collapsedSize: 0,
};

const EPSILON = 1e-6;
const round = (n: number): number => Math.round(n * 1000) / 1000;
const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

/**
 * The sizes before the user moves anything: each panel's `defaultSize`, the rest shared
 * equally by the panels without one, clamped to the limits and scaled to sum to 100.
 */
export function resizableInitialSizes(
  panels: readonly ResizablePanelLimits[],
): number[] {
  if (panels.length === 0) return [];
  const fixed = panels.reduce((sum, p) => sum + (p.defaultSize ?? 0), 0);
  const open = panels.filter((p) => p.defaultSize === null).length;
  const share = open > 0 ? Math.max(0, 100 - fixed) / open : 0;
  const sizes = panels.map((p) =>
    clamp(p.defaultSize ?? share, p.minSize, p.maxSize),
  );
  return resizableNormalize(sizes, panels);
}

/** Scales `sizes` to sum to 100, then settles any panel pushed past its limits. */
export function resizableNormalize(
  sizes: readonly number[],
  panels: readonly ResizablePanelLimits[],
): number[] {
  const total = sizes.reduce((a, b) => a + b, 0);
  const out =
    total > EPSILON
      ? sizes.map((s) => (s / total) * 100)
      : sizes.map(() => 100 / sizes.length);
  // Clamp, then hand the difference to the panels that still have room.
  for (let pass = 0; pass < 3; pass++) {
    let diff = 0;
    out.forEach((s, i) => {
      const c = clamp(s, panels[i].minSize, panels[i].maxSize);
      diff += s - c;
      out[i] = c;
    });
    if (Math.abs(diff) < EPSILON) break;
    for (let i = 0; i < out.length && Math.abs(diff) > EPSILON; i++) {
      const p = panels[i];
      const room = diff > 0 ? p.maxSize - out[i] : out[i] - p.minSize;
      const move = Math.min(room, Math.abs(diff));
      out[i] += Math.sign(diff) * move;
      diff -= Math.sign(diff) * move;
    }
  }
  return out.map(round);
}

const isCollapsed = (size: number, p: ResizablePanelLimits): boolean =>
  p.collapsible && size <= p.collapsedSize + EPSILON && p.minSize > size;

/**
 * Moves the boundary of handle `handle` (between panel `handle` and `handle + 1`) by
 * `delta` percent: the panel on the growing side takes what the panels on the other
 * side can give, nearest first, each down to its minimum. A collapsible panel pushed
 * more than halfway past its minimum collapses; a collapsed one opens (to its minimum)
 * once pulled halfway there. Pass the sizes from the start of a drag and its whole
 * delta, so a drag that comes back undoes what it did.
 */
export function resizableResize(
  sizes: readonly number[],
  panels: readonly ResizablePanelLimits[],
  handle: number,
  delta: number,
): number[] {
  const next = [...sizes];
  if (Math.abs(delta) < EPSILON || handle < 0 || handle >= sizes.length - 1)
    return next;
  const growing = delta > 0 ? handle : handle + 1;
  const order: number[] = [];
  if (delta > 0) for (let i = handle + 1; i < sizes.length; i++) order.push(i);
  else for (let i = handle; i >= 0; i--) order.push(i);

  const g = panels[growing];
  let want = Math.abs(delta);
  const opening = isCollapsed(next[growing], g);
  if (opening) {
    const toMin = g.minSize - next[growing];
    if (want < toMin / 2) return next;
    want = Math.max(want, toMin);
  }
  want = Math.min(want, g.maxSize - next[growing]);

  let taken = 0;
  for (const i of order) {
    const left = want - taken;
    if (left <= EPSILON) break;
    const p = panels[i];
    const above = Math.max(0, next[i] - p.minSize);
    if (left <= above) {
      next[i] -= left;
      taken += left;
      break;
    }
    next[i] -= above;
    taken += above;
    // Past its minimum: a collapsible panel gives the rest up once pushed halfway.
    const rest = left - above;
    const gives = next[i] - p.collapsedSize;
    if (
      p.collapsible &&
      gives > EPSILON &&
      rest >= gives / 2 &&
      sizes[growing] + taken + gives <= g.maxSize + EPSILON
    ) {
      next[i] = p.collapsedSize;
      taken += gives;
    }
  }
  if (opening && sizes[growing] + taken < g.minSize - EPSILON)
    return [...sizes];
  next[growing] += taken;
  return next.map(round);
}

/** What a key on a handle asks for: a delta in percent, a collapse toggle, or nothing. */
export type ResizableKeyAction =
  { readonly delta: number } | { readonly toggle: true } | null;

/**
 * The window-splitter keys for the panel before a handle at `size`: the arrows along
 * `direction` move by `step`, Home / End to its minimum / maximum, Enter collapses or
 * restores it (when collapsible).
 */
export function resizableKeyAction(
  key: string,
  direction: ResizableDirection,
  size: number,
  panel: ResizablePanelLimits,
  step = 10,
): ResizableKeyAction {
  const back = direction === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const on = direction === "horizontal" ? "ArrowRight" : "ArrowDown";
  if (key === back) return { delta: -step };
  if (key === on) return { delta: step };
  if (key === "Home") return { delta: panel.minSize - size };
  if (key === "End") return { delta: panel.maxSize - size };
  if (key === "Enter" && panel.collapsible) return { toggle: true };
  return null;
}

/** Sizes read back from storage: valid only for `count` panels summing to about 100. */
export function resizableParse(
  text: string | null | undefined,
  count: number,
): number[] | null {
  if (!text) return null;
  try {
    const value: unknown = JSON.parse(text);
    if (
      !Array.isArray(value) ||
      value.length !== count ||
      !value.every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
    )
      return null;
    const total = (value as number[]).reduce((a, b) => a + b, 0);
    return Math.abs(total - 100) < 0.5 ? (value as number[]) : null;
  } catch {
    return null;
  }
}

/** Where a group keeps its sizes between visits — `localStorage` fits, or your own. */
export interface ResizableStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The storage key of a group's `autoSaveId`. */
export const resizableStorageKey = (id: string): string =>
  `sone-resizable:${id}`;

/** What the resizable reads from, and writes back to, the group that owns it. */
export interface ResizableHost {
  direction(): ResizableDirection;
  /** The panels' limits, in order. */
  panels(): readonly ResizablePanelLimits[];
  /** The current sizes (one per panel). */
  sizes(): readonly number[];
  /** The user moved a handle; `done` once the drag ends or after a key. */
  setSizes(sizes: number[], done: boolean): void;
  /** The group element (its size turns pixels into percent). */
  group(): HTMLElement | null;
  /** A drag started (`index`) or ended (`null`). */
  dragging?(index: number | null): void;
}

/** The fields of a key event a handle reads. */
export interface ResizableKeyEvent {
  readonly key: string;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

export interface Resizable {
  /** A key on handle `index`. `true` when handled. */
  keyDown(index: number, event: ResizableKeyEvent): boolean;
  /** A press on handle `index` (the element `handle`): drags it until the pointer is released. */
  pointerDown(index: number, event: PointerEvent, handle: HTMLElement): void;
  /** Collapses or restores the panel before handle `index`. */
  toggle(index: number): void;
}

/** The handles' keyboard and pointer behaviour over a group's sizes. */
export function createResizable(host: ResizableHost): Resizable {
  /** The size a collapsed panel goes back to, by panel index. */
  const restore = new Map<number, number>();

  const apply = (next: number[], done: boolean): void => {
    const now = host.sizes();
    if (next.length === now.length && next.every((s, i) => s === now[i])) {
      if (done) host.setSizes(next, true);
      return;
    }
    host.setSizes(next, done);
  };

  const toggle = (index: number): void => {
    const panels = host.panels();
    const sizes = host.sizes();
    const p = panels[index];
    if (!p?.collapsible) return;
    if (isCollapsed(sizes[index], p)) {
      const to = Math.max(restore.get(index) ?? p.minSize, p.minSize);
      apply(resizableResize(sizes, panels, index, to - sizes[index]), true);
    } else {
      restore.set(index, sizes[index]);
      const next = [...sizes];
      const gives = next[index] - p.collapsedSize;
      // Give the space to the panel after it (within its maximum).
      const after = panels[index + 1];
      if (!after || next[index + 1] + gives > after.maxSize + EPSILON) return;
      next[index] = p.collapsedSize;
      next[index + 1] += gives;
      apply(next.map(round), true);
    }
  };

  return {
    keyDown(index, event) {
      if (event.defaultPrevented) return false;
      const sizes = host.sizes();
      const panels = host.panels();
      if (!panels[index] || !panels[index + 1]) return false;
      const action = resizableKeyAction(
        event.key,
        host.direction(),
        sizes[index],
        panels[index],
      );
      if (!action) return false;
      event.preventDefault();
      if ("toggle" in action) toggle(index);
      else apply(resizableResize(sizes, panels, index, action.delta), true);
      return true;
    },
    pointerDown(index, event, handle) {
      if (event.button !== 0 || !event.isPrimary) return;
      const group = host.group();
      if (!group) return;
      event.preventDefault();
      handle.focus({ preventScroll: true });
      const horizontal = host.direction() === "horizontal";
      const rect = group.getBoundingClientRect();
      const total = horizontal ? rect.width : rect.height;
      if (total <= 0) return;
      const start = horizontal ? event.clientX : event.clientY;
      const from = [...host.sizes()];
      handle.setPointerCapture?.(event.pointerId);
      host.dragging?.(index);
      const move = (e: PointerEvent): void => {
        if (e.pointerId !== event.pointerId) return;
        const delta =
          (((horizontal ? e.clientX : e.clientY) - start) / total) * 100;
        apply(resizableResize(from, host.panels(), index, delta), false);
      };
      const end = (e: PointerEvent): void => {
        if (e.pointerId !== event.pointerId) return;
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", end);
        handle.removeEventListener("pointercancel", end);
        handle.removeEventListener("lostpointercapture", end);
        host.dragging?.(null);
        apply([...host.sizes()], true);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
      handle.addEventListener("lostpointercapture", end);
    },
    toggle,
  };
}
