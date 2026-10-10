import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject, signal } from "@angular/core";

export type ColorMode = "system" | "light" | "dark";
export type Skin =
  "studio" | "paper" | "minimalist" | "neumorphism" | "material" | "surface";
export type Accent = "default" | "blue" | "teal" | "green" | "orange" | "pink";

export const SKINS: readonly Skin[] = [
  "studio",
  "paper",
  "minimalist",
  "neumorphism",
  "material",
  "surface",
];
export const MODES: readonly ColorMode[] = ["system", "light", "dark"];
export const ACCENTS: readonly Accent[] = [
  "default",
  "blue",
  "teal",
  "green",
  "orange",
  "pink",
];

/** Must match the inline script in index.html. */
const STORAGE_KEY = "sone-docs-theme";

interface Stored {
  mode?: ColorMode;
  skin?: Skin;
  accent?: Accent;
}

/**
 * The three appearance axes of the site, mirrored onto <html> exactly as a
 * SurfaceOne app does it. The inline script in index.html applies the stored
 * choice before the first paint; this service keeps it in sync afterwards.
 */
@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly mode = signal<ColorMode>("system");
  readonly skin = signal<Skin>("studio");
  readonly accent = signal<Accent>("default");

  constructor() {
    if (!this.browser) return;
    const stored = this.read();
    this.mode.set(stored.mode ?? "system");
    this.skin.set(stored.skin ?? "studio");
    this.accent.set(stored.accent ?? "default");
  }

  setMode(mode: ColorMode): void {
    this.mode.set(mode);
    this.apply();
  }

  setSkin(skin: Skin): void {
    this.skin.set(skin);
    this.apply();
  }

  setAccent(accent: Accent): void {
    this.accent.set(accent);
    this.apply();
  }

  /** Re-reads the stored choice, e.g. after another tab or a framed page changed it. */
  sync(): void {
    if (!this.browser) return;
    const stored = this.read();
    this.mode.set(stored.mode ?? "system");
    this.skin.set(stored.skin ?? "studio");
    this.accent.set(stored.accent ?? "default");
    this.apply();
  }

  reset(): void {
    this.mode.set("system");
    this.skin.set("studio");
    this.accent.set("default");
    this.apply();
  }

  private apply(): void {
    if (!this.browser) return;
    const mode = this.mode();
    if (mode === "system") this.root.removeAttribute("data-theme");
    else this.root.setAttribute("data-theme", mode);
    this.root.setAttribute("data-skin", this.skin());
    const accent = this.accent();
    if (accent === "default") this.root.removeAttribute("data-accent");
    else this.root.setAttribute("data-accent", accent);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, skin: this.skin(), accent } satisfies Stored),
      );
    } catch {
      // Private mode or blocked storage: the choice lasts for this page only.
    }
  }

  private read(): Stored {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Stored;
    } catch {
      return {};
    }
  }
}
