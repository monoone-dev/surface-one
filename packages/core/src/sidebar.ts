// The sidebar's state machine and its rail, without a framework: the Vue
// `createSoneSidebar` / `SoneSidebarRail` and the React `SoneSidebarProvider` /
// `SoneSidebarRail` wrap these in refs or state.

/** The twin of the Angular `SoneSidebarConfig` (`provideSoneSidebarConfig`). */
export interface SoneSidebarConfig {
  readonly defaultOpen: boolean;
  readonly openStorageKey: string | null;
  readonly widthStorageKey: string | null;
  readonly defaultWidth: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
}

// The same storage keys as @surface-one/angular: an app moving between the packages
// keeps every user's sidebar width and state.
export const SONE_SIDEBAR_DEFAULT_CONFIG: SoneSidebarConfig = {
  defaultOpen: true,
  openStorageKey: "index-one.shell.sidebarExpanded",
  widthStorageKey: "index-one.shell.sidebarWidth",
  defaultWidth: 256,
  minWidth: 200,
  maxWidth: 480,
  keyboardShortcut: "b",
};

export type SoneSidebarState = "expanded" | "collapsed";

/** Where a framework keeps the three values the actions read and write. */
export interface SidebarStore {
  open: boolean;
  /** The dragged width, `null` for the stylesheet's default. */
  dragged: number | null;
  resizing: boolean;
}

export interface SidebarActions {
  setOpen(open: boolean): void;
  toggleSidebar(): void;
  setWidth(requested: number): void;
  setResizing(resizing: boolean): void;
  resetWidth(): void;
  /** Reads the stored state and width (client only). */
  restore(): void;
}

/** `width` rounded and kept between the config's minimum and maximum. */
export function clampSidebarWidth(
  config: Pick<SoneSidebarConfig, "minWidth" | "maxWidth">,
  width: number,
): number {
  return Math.round(
    Math.min(config.maxWidth, Math.max(config.minWidth, width)),
  );
}

/**
 * The sidebar's actions over `store`. Nothing touches storage until `restore()`, so
 * the server and the first client render agree (no hydration mismatch).
 */
export function createSidebarActions(
  config: SoneSidebarConfig,
  store: SidebarStore,
): SidebarActions {
  const clamp = (width: number): number => clampSidebarWidth(config, width);
  const setOpen = (value: boolean): void => {
    store.open = value;
    writeStoredValue(config.openStorageKey, String(value));
  };
  return {
    setOpen,
    toggleSidebar: () => setOpen(!store.open),
    setWidth(requested) {
      const width = clamp(requested);
      if (width === store.dragged) return;
      store.dragged = width;
      if (!store.resizing)
        writeStoredValue(config.widthStorageKey, String(width));
    },
    setResizing(value) {
      store.resizing = value;
      if (!value) {
        const width = store.dragged;
        writeStoredValue(
          config.widthStorageKey,
          width === null ? null : String(width),
        );
      }
    },
    resetWidth() {
      store.dragged = null;
      writeStoredValue(config.widthStorageKey, null);
    },
    restore() {
      store.open = readStoredBoolean(config.openStorageKey, store.open);
      store.dragged =
        readStoredWidth(config.widthStorageKey, clamp) ?? store.dragged;
    },
  };
}

// Persistence is best-effort: storage reads/writes are guarded and fall back to the
// defaults, so a storage failure (or the server, with no localStorage) never breaks
// navigation.
export function readStoredBoolean(
  key: string | null,
  fallback: boolean,
): boolean {
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch {
    return fallback;
  }
}

export function readStoredWidth(
  key: string | null,
  clamp: (width: number) => number,
): number | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const width = Number(raw);
    return Number.isFinite(width) ? clamp(width) : null;
  } catch {
    return null;
  }
}

export function writeStoredValue(
  key: string | null,
  value: string | null,
): void {
  if (!key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // The sidebar's state is a convenience; storage failure must not break navigation.
  }
}

export const SIDEBAR_RAIL_KEY_STEP_PX = 16;
export const SIDEBAR_RAIL_KEY_STEP_SHIFT_MULTIPLIER = 4;
export const SIDEBAR_RAIL_DRAG_THRESHOLD_PX = 3;

/** What the rail reads and drives: the sidebar state as plain values. */
export interface SidebarRailTarget {
  readonly open: boolean;
  readonly width: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  setResizing(resizing: boolean): void;
  setWidth(requested: number): void;
  resetWidth(): void;
  toggleSidebar(): void;
}

/** The fields of a DOM or React pointer event the rail reads. */
export interface RailPointerEvent {
  readonly button: number;
  readonly pointerId: number;
  readonly clientX: number;
  readonly currentTarget: EventTarget | null;
  preventDefault(): void;
}

export interface RailKeyEvent {
  readonly key: string;
  readonly shiftKey: boolean;
  preventDefault(): void;
}

export interface SidebarRail {
  pointerDown(event: RailPointerEvent): void;
  pointerMove(event: RailPointerEvent): void;
  /** pointerup, pointercancel and lostpointercapture. */
  pointerEnd(event: RailPointerEvent): void;
  click(event: { readonly altKey: boolean }): void;
  keyDown(event: RailKeyEvent): void;
}

/**
 * The behaviour of `[soneSidebarRail]`. Collapsed, it is a button that expands the
 * sidebar. Expanded, it is a focusable splitter: a click collapses, a drag resizes
 * (the click that ends a drag is swallowed), ⌥-click resets the width; the arrow
 * keys step the width (Shift for bigger steps), Home / End jump to the minimum /
 * maximum and Enter resets it. `sidebar()` is read on every event.
 */
export function createSidebarRail(
  sidebar: () => SidebarRailTarget | null,
): SidebarRail {
  let press: {
    pointerId: number;
    startX: number;
    startWidth: number;
    dragging: boolean;
  } | null = null;
  let swallowClick = false;

  return {
    pointerDown(event) {
      swallowClick = false;
      const target = sidebar();
      if (!target || !target.open || event.button !== 0) return;
      event.preventDefault();
      (event.currentTarget as Element | null)?.setPointerCapture?.(
        event.pointerId,
      );
      press = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: target.width,
        dragging: false,
      };
    },
    pointerMove(event) {
      const target = sidebar();
      if (!target || !press || press.pointerId !== event.pointerId) return;
      const dx = event.clientX - press.startX;
      if (!press.dragging) {
        if (Math.abs(dx) < SIDEBAR_RAIL_DRAG_THRESHOLD_PX) return;
        press.dragging = true;
        target.setResizing(true);
      }
      target.setWidth(press.startWidth + dx);
    },
    pointerEnd(event) {
      const current = press;
      if (!current || current.pointerId !== event.pointerId) return;
      press = null;
      if (current.dragging) {
        swallowClick = true;
        sidebar()?.setResizing(false);
      }
    },
    click(event) {
      if (swallowClick) {
        swallowClick = false;
        return;
      }
      const target = sidebar();
      if (!target) return;
      if (event.altKey && target.open) {
        target.resetWidth();
        return;
      }
      target.toggleSidebar();
    },
    keyDown(event) {
      const target = sidebar();
      if (!target || !target.open) return;
      const step =
        SIDEBAR_RAIL_KEY_STEP_PX *
        (event.shiftKey ? SIDEBAR_RAIL_KEY_STEP_SHIFT_MULTIPLIER : 1);
      const width = target.width;
      let next: number;
      switch (event.key) {
        case "ArrowLeft":
          next = width - step;
          break;
        case "ArrowRight":
          next = width + step;
          break;
        case "Home":
          next = target.minWidth;
          break;
        case "End":
          next = target.maxWidth;
          break;
        case "Enter":
          event.preventDefault();
          target.resetWidth();
          return;
        default:
          return;
      }
      event.preventDefault();
      target.setWidth(next);
    },
  };
}
