import {
  Injectable,
  InjectionToken,
  computed,
  inject,
  signal,
  type ValueProvider,
} from "@angular/core";

export interface SoneSidebarConfig {
  readonly defaultOpen: boolean;
  readonly openStorageKey: string | null;
  readonly widthStorageKey: string | null;
  readonly defaultWidth: number;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly keyboardShortcut: string;
}

// Storage keys match the pre-existing shell values on purpose — a new key
// would silently reset every user's sidebar on upgrade.
export const SONE_SIDEBAR_DEFAULT_CONFIG: SoneSidebarConfig = {
  defaultOpen: true,
  openStorageKey: "index-one.shell.sidebarExpanded",
  widthStorageKey: "index-one.shell.sidebarWidth",
  defaultWidth: 256,
  minWidth: 200,
  maxWidth: 480,
  keyboardShortcut: "b",
};

export const SONE_SIDEBAR_CONFIG = new InjectionToken<SoneSidebarConfig>(
  "SoneSidebarConfig",
);

export function provideSoneSidebarConfig(
  config: Partial<SoneSidebarConfig>,
): ValueProvider {
  return {
    provide: SONE_SIDEBAR_CONFIG,
    useValue: { ...SONE_SIDEBAR_DEFAULT_CONFIG, ...config },
  };
}

export type SoneSidebarState = "expanded" | "collapsed";

// Persistence is best-effort: storage reads/writes are guarded and fall back
// to defaults so a storage failure never breaks navigation.
@Injectable({ providedIn: "root" })
export class SoneSidebarService {
  private readonly config =
    inject(SONE_SIDEBAR_CONFIG, { optional: true }) ??
    SONE_SIDEBAR_DEFAULT_CONFIG;

  private readonly _open = signal(
    readBoolean(this.config.openStorageKey, this.config.defaultOpen),
  );
  private readonly _width = signal<number | null>(
    readWidth(this.config.widthStorageKey, (w) => this.clamp(w)),
  );
  private readonly _resizing = signal(false);

  readonly open = this._open.asReadonly();
  readonly state = computed<SoneSidebarState>(() =>
    this._open() ? "expanded" : "collapsed",
  );
  readonly width = computed(() => this._width() ?? this.config.defaultWidth);
  readonly widthCss = computed(() => {
    const width = this._width();
    return width === null ? null : `${width}px`;
  });
  readonly resizing = this._resizing.asReadonly();

  readonly minWidth = this.config.minWidth;
  readonly maxWidth = this.config.maxWidth;
  readonly keyboardShortcut = this.config.keyboardShortcut;

  setOpen(open: boolean): void {
    this._open.set(open);
    writeValue(this.config.openStorageKey, String(open));
  }

  toggleSidebar(): void {
    this.setOpen(!this._open());
  }

  setWidth(requested: number): void {
    const width = this.clamp(requested);
    if (width === this._width()) return;
    this._width.set(width);
    if (!this._resizing()) {
      writeValue(this.config.widthStorageKey, String(width));
    }
  }

  setResizing(resizing: boolean): void {
    this._resizing.set(resizing);
    if (!resizing) {
      const width = this._width();
      writeValue(
        this.config.widthStorageKey,
        width === null ? null : String(width),
      );
    }
  }

  resetWidth(): void {
    this._width.set(null);
    writeValue(this.config.widthStorageKey, null);
  }

  private clamp(width: number): number {
    return Math.round(
      Math.min(this.config.maxWidth, Math.max(this.config.minWidth, width)),
    );
  }
}

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
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // The sidebar's state is a convenience; storage failure must not break navigation.
  }
}
