import {
  computed,
  inject,
  onMounted,
  provide,
  readonly,
  ref,
  type App,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";

/** The Vue twin of the Angular `SoneSidebarConfig` (`provideSoneSidebarConfig`). */
export interface SoneSidebarConfig {
  readonly defaultOpen: boolean;
  readonly openStorageKey: string | null;
  readonly widthStorageKey: string | null;
  readonly defaultWidth: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
}

// The same storage keys as @surface-one/angular: an app moving between the two keeps
// every user's sidebar width and state.
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
  readonly open: Readonly<Ref<boolean>>;
  readonly state: ComputedRef<SoneSidebarState>;
  readonly width: ComputedRef<number>;
  /** The dragged width as CSS (`"312px"`), `null` for the stylesheet's default. */
  readonly widthCss: ComputedRef<string | null>;
  readonly resizing: Readonly<Ref<boolean>>;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
  setOpen(open: boolean): void;
  toggleSidebar(): void;
  setWidth(requested: number): void;
  setResizing(resizing: boolean): void;
  resetWidth(): void;
  /** Reads the stored state and width (client only). `provideSoneSidebar` calls it on mount; call it yourself when you provide state from `createSoneSidebar()` directly. */
  restore(): void;
}

const SIDEBAR_CONFIG: InjectionKey<Partial<SoneSidebarConfig>> =
  Symbol("SoneSidebarConfig");
export const SONE_SIDEBAR: InjectionKey<SoneSidebarContext> =
  Symbol("SoneSidebar");

/** The app-wide sidebar config: `provideSoneSidebarConfig(app, { openStorageKey: null })`. */
export function provideSoneSidebarConfig(
  app: App,
  config: Partial<SoneSidebarConfig>,
): void {
  app.provide(SIDEBAR_CONFIG, config);
}

/**
 * A sidebar state. Nothing touches storage until `restore()`, so the server and the
 * first client render agree (no hydration mismatch); the stored values follow on mount.
 */
export function createSoneSidebar(
  overrides: Partial<SoneSidebarConfig> = {},
): SoneSidebarContext {
  const config: SoneSidebarConfig = {
    ...SONE_SIDEBAR_DEFAULT_CONFIG,
    ...overrides,
  };
  const clamp = (width: number): number =>
    Math.round(Math.min(config.maxWidth, Math.max(config.minWidth, width)));

  const open = ref(config.defaultOpen);
  const dragged = ref<number | null>(null);
  const resizing = ref(false);

  const setOpen = (value: boolean): void => {
    open.value = value;
    writeValue(config.openStorageKey, String(value));
  };

  return {
    open: readonly(open),
    state: computed(() => (open.value ? "expanded" : "collapsed")),
    width: computed(() => dragged.value ?? config.defaultWidth),
    widthCss: computed(() =>
      dragged.value === null ? null : `${dragged.value}px`,
    ),
    resizing: readonly(resizing),
    minWidth: config.minWidth,
    maxWidth: config.maxWidth,
    keyboardShortcut: config.keyboardShortcut,
    setOpen,
    toggleSidebar: () => setOpen(!open.value),
    setWidth(requested) {
      const width = clamp(requested);
      if (width === dragged.value) return;
      dragged.value = width;
      if (!resizing.value) writeValue(config.widthStorageKey, String(width));
    },
    setResizing(value) {
      resizing.value = value;
      if (!value) {
        writeValue(
          config.widthStorageKey,
          dragged.value === null ? null : String(dragged.value),
        );
      }
    },
    resetWidth() {
      dragged.value = null;
      writeValue(config.widthStorageKey, null);
    },
    restore() {
      open.value = readBoolean(config.openStorageKey, open.value);
      dragged.value = readWidth(config.widthStorageKey, clamp) ?? dragged.value;
    },
  };
}

/**
 * Creates a sidebar state for this component's subtree and provides it — what
 * `SoneSidebarWrapper` does when no ancestor provides one. Call it in `setup` to own
 * the state (and drive it) above the wrapper; the stored values load on mount.
 */
export function provideSoneSidebar(
  config: Partial<SoneSidebarConfig> = {},
): SoneSidebarContext {
  const app = inject(SIDEBAR_CONFIG, {});
  const sidebar = createSoneSidebar({ ...app, ...config });
  provide(SONE_SIDEBAR, sidebar);
  onMounted(() => sidebar.restore());
  return sidebar;
}

/** The nearest sidebar state (from `SoneSidebarWrapper` or `provideSoneSidebar`). */
export function useSoneSidebar(): SoneSidebarContext {
  const sidebar = inject(SONE_SIDEBAR, null);
  if (!sidebar) {
    throw new Error(
      "useSoneSidebar() needs a SoneSidebarWrapper or provideSoneSidebar() above it",
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
