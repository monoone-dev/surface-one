import {
  computed,
  inject,
  onMounted,
  provide,
  reactive,
  readonly,
  toRefs,
  type App,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";

import {
  SONE_SIDEBAR_DEFAULT_CONFIG,
  createSidebarActions,
  type SidebarStore,
  type SoneSidebarConfig,
  type SoneSidebarState,
} from "@surface-one/core";

// The config, its defaults (the same storage keys as @surface-one/angular) and the
// actions are shared with the React package.
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
  const store = reactive<SidebarStore>({
    open: config.defaultOpen,
    dragged: null,
    resizing: false,
  });
  const { open, dragged, resizing } = toRefs(store);
  const actions = createSidebarActions(config, store);

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
    ...actions,
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
