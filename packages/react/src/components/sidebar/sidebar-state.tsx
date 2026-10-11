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

import {
  SONE_SIDEBAR_DEFAULT_CONFIG,
  createSidebarActions,
  type SoneSidebarConfig,
  type SoneSidebarState,
} from "@surface-one/core";

// The config, its defaults (the same storage keys as @surface-one/angular and
// @surface-one/vue) and the actions are shared with the Vue package.
export {
  SONE_SIDEBAR_DEFAULT_CONFIG,
  type SoneSidebarConfig,
  type SoneSidebarState,
} from "@surface-one/core";

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

  const actions = useMemo(
    () =>
      createSidebarActions(config, {
        get open() {
          return live.current.open;
        },
        set open(value) {
          live.current.open = value;
          setOpenState(value);
        },
        get dragged() {
          return live.current.dragged;
        },
        set dragged(value) {
          live.current.dragged = value;
          setDragged(value);
        },
        get resizing() {
          return live.current.resizing;
        },
        set resizing(value) {
          live.current.resizing = value;
          setResizingState(value);
        },
      }),
    [config],
  );

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
