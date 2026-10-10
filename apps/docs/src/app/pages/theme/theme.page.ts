import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSegmentedComponent } from "@surface-one/angular/segmented";

import tokenFiles from "../../catalog/tokens.generated.json";
import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import {
  ACCENTS,
  MODES,
  SKINS,
  ThemeService,
  type Accent,
  type ColorMode,
  type Skin,
} from "../../theme/theme.service";

const ROLES = [
  "--surface-base",
  "--surface-raised",
  "--surface-hover",
  "--surface-overlay",
  "--surface-input",
  "--text-primary",
  "--text-secondary",
  "--text-muted",
  "--accent",
  "--accent-hover",
  "--accent-soft",
  "--accent-text",
  "--text-on-accent",
  "--border",
  "--border-strong",
  "--border-subtle",
  "--danger",
  "--danger-soft",
] as const;

const CHART_COLORS = [
  ...Array.from({ length: 8 }, (_, i) => `--chart-${i + 1}`),
  ...Array.from({ length: 5 }, (_, i) => `--chart-seq-${i + 1}`),
  "--chart-positive",
  "--chart-negative",
] as const;

const PALETTES = ["blue", "teal", "green", "orange", "pink"] as const;
const STEPS = [50, 200, 300, 400, 500, 700, 800, 900, 950] as const;
const SIZES = [
  "3xs",
  "2xs",
  "xs",
  "sm",
  "md",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
] as const;
const RADII = ["xs", "sm", "md", "lg", "xl", "pill"] as const;
const SPACES = ["px", "0_5", 1, 2, 3, 4, 5, 6, 7, 8] as const;
const SHADOWS = ["sm", "md", "lg"] as const;

@Component({
  selector: "docs-theme-page",
  imports: [SoneButtonDirective, SoneSegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./theme.page.html",
  styleUrl: "./theme.page.scss",
})
export default class ThemePage {
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(ThemeService);
  private readonly seo = inject(Seo);

  protected readonly roles = ROLES;
  protected readonly chartColors = CHART_COLORS;
  protected readonly palettes = PALETTES;
  protected readonly steps = STEPS;
  protected readonly sizes = SIZES;
  protected readonly radii = RADII;
  protected readonly spaces = SPACES;
  protected readonly shadows = SHADOWS;
  protected readonly files = tokenFiles as { file: string; names: string[] }[];

  protected readonly skinOptions = computed(() =>
    SKINS.map((s) => ({ value: s, label: this.i18n.m().theme.skins[s] })),
  );
  protected readonly modeOptions = computed(() =>
    MODES.map((mode) => ({
      value: mode,
      label: this.i18n.m().colorMode[mode],
    })),
  );
  protected readonly accentOptions = computed(() =>
    ACCENTS.map((a) => ({
      value: a,
      label:
        a === "default"
          ? this.i18n.m().theme.accentDefault
          : this.i18n.m().theme.accents[a],
    })),
  );

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.theme.title,
        description: m.theme.description,
        path: "/theme",
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.theme.title, path: "/theme" },
        ],
      });
    });
  }

  protected setSkin(v: string): void {
    this.theme.setSkin(v as Skin);
  }
  protected setMode(v: string): void {
    this.theme.setMode(v as ColorMode);
  }
  protected setAccent(v: string): void {
    this.theme.setAccent(v as Accent);
  }
}
