"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** The React twin of the Angular `SoneSidebarConfig` (`provideSoneSidebarConfig`). */
export interface SoneSidebarConfig {
  readonly defaultOpen: boolean;
  readonly openStorageKey: string | null;
  readonly widthStorageKey: string | null;
  readonly defaultWidth: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
}

// The same storage keys as @surface-one/angular and @surface-one/vue: an app moving
// between them keeps every user's sidebar width and state.
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

/**
 * The sidebar's shared state — what the Angular `SoneSidebarService` holds: open or
 * collapsed, the dragged width and whether a drag is in progress.
 */
export interface SoneSidebarContext {
  readonly open: boolean;
  readonly state: SoneSidebarState;
  readonly width: number;
  /** The dragged width as CSS (`"312px"`), `null` for the stylesheet's default. */
  readonly widthCss: string | null;
  readonly resizing: boolean;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
  setOpen(open: boolean): void;
  toggleSidebar(): void;
  setWidth(requested: number): void;
  setResizing(resizing: boolean): void;
  resetWidth(): void;
  /** Reads the stored state and width (client only). `SoneSidebarProvider` calls it on mount. */
  restore(): void;
}

const SidebarConfigContext = createContext<Partial<SoneSidebarConfig>>({});

/** The sidebar state of the subtree (from `SoneSidebarWrapper` or `SoneSidebarProvider`). */
export const SONE_SIDEBAR = createContext<SoneSidebarContext | null>(null);

export interface SoneSidebarConfigProviderProps {
  readonly config: Partial<SoneSidebarConfig>;
  readonly children?: ReactNode;
}

/** The app-wide sidebar config: `<SoneSidebarConfigProvider config={{ openStorageKey: null }}>`. */
export function SoneSidebarConfigProvider({
  config,
  children,
}: SoneSidebarConfigProviderProps) {
  const outer = useContext(SidebarConfigContext);
  const value = useMemo(() => ({ ...outer, ...config }), [outer, config]);
  return (
    <SidebarConfigContext.Provider value={value}>
      {children}
    </SidebarConfigContext.Provider>
  );
}

/**
 * A sidebar state (the twin of the Vue `createSoneSidebar`). Nothing touches storage
 * until `restore()`, so the server and the first client render agree (no hydration
 * mismatch). The config is read once, on the first render.
 */
function useSidebarState(
  overrides: Partial<SoneSidebarConfig> = {},
): SoneSidebarContext {
  const app = useContext(SidebarConfigContext);
  const [config] = useState<SoneSidebarConfig>(() => ({
    ...SONE_SIDEBAR_DEFAULT_CONFIG,
    ...app,
    ...overrides,
  }));
  const [open, setOpenState] = useState(config.defaultOpen);
  const [dragged, setDragged] = useState<number | null>(null);
  const [resizing, setResizingState] = useState(false);

  // The latest values, so the actions can run several times between two renders.
  const live = useRef({ open, dragged, resizing });

  const actions = useMemo(() => {
    const clamp = (width: number): number =>
      Math.round(Math.min(config.maxWidth, Math.max(config.minWidth, width)));
    const putOpen = (value: boolean): void => {
      live.current.open = value;
      setOpenState(value);
    };
    const putDragged = (value: number | null): void => {
      live.current.dragged = value;
      setDragged(value);
    };
    const setOpen = (value: boolean): void => {
      putOpen(value);
      writeValue(config.openStorageKey, String(value));
    };
    return {
      setOpen,
      toggleSidebar: () => setOpen(!live.current.open),
      setWidth(requested: number) {
        const width = clamp(requested);
        if (width === live.current.dragged) return;
        putDragged(width);
        if (!live.current.resizing)
          writeValue(config.widthStorageKey, String(width));
      },
      setResizing(value: boolean) {
        live.current.resizing = value;
        setResizingState(value);
        if (!value) {
          const width = live.current.dragged;
          writeValue(
            config.widthStorageKey,
            width === null ? null : String(width),
          );
        }
      },
      resetWidth() {
        putDragged(null);
        writeValue(config.widthStorageKey, null);
      },
      restore() {
        putOpen(readBoolean(config.openStorageKey, live.current.open));
        putDragged(
          readWidth(config.widthStorageKey, clamp) ?? live.current.dragged,
        );
      },
    };
  }, [config]);

  return useMemo(
    () => ({
      open,
      state: open ? "expanded" : "collapsed",
      width: dragged ?? config.defaultWidth,
      widthCss: dragged === null ? null : `${dragged}px`,
      resizing,
      minWidth: config.minWidth,
      maxWidth: config.maxWidth,
      keyboardShortcut: config.keyboardShortcut,
      ...actions,
    }),
    [open, dragged, resizing, config, actions],
  );
}

export interface SoneSidebarProviderProps {
  /** The config of this state, over the app's `SoneSidebarConfigProvider` (read once). */
  readonly config?: Partial<SoneSidebarConfig>;
  readonly children?: ReactNode;
}

/**
 * Creates a sidebar state for its subtree — what `SoneSidebarWrapper` does when no
 * ancestor provides one. Put it above the wrapper to own the state and drive it
 * (`useSoneSidebar()`) from outside the sidebar; the stored values load on mount.
 */
export function SoneSidebarProvider({
  config,
  children,
}: SoneSidebarProviderProps) {
  const sidebar = useSidebarState(config);
  const { restore } = sidebar;
  useEffect(() => restore(), [restore]);
  return (
    <SONE_SIDEBAR.Provider value={sidebar}>{children}</SONE_SIDEBAR.Provider>
  );
}

/** The nearest sidebar state (from `SoneSidebarWrapper` or `SoneSidebarProvider`). */
export function useSoneSidebar(): SoneSidebarContext {
  const sidebar = useContext(SONE_SIDEBAR);
  if (!sidebar) {
    throw new Error(
      "useSoneSidebar() needs a SoneSidebarWrapper or SoneSidebarProvider above it",
    );
  }
  return sidebar;
}

// Persistence is best-effort: storage reads/writes are guarded and fall back to the
// defaults, so a storage failure (or the server, with no localStorage) never breaks
// navigation.
function readBoolean(key: string | null, fallback: boolean): boolean {
  if (!key) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch {
    return fallback;
  }
}

function readWidth(
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

function writeValue(key: string | null, value: string | null): void {
  if (!key) return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // The sidebar's state is a convenience; storage failure must not break navigation.
  }
}
