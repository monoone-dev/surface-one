import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  computed,
  inject,
  input,
  type Provider,
} from "@angular/core";

export type LogoSize = "xs" | "sm" | "default" | "lg";
export type LogoBrand = "surface-one" | "index-one" | "ivy";
export type LogoKind = "tile" | "mark";

/**
 * Where the brand SVGs are served from. Copy `@surface-one/tokens/brand` into the
 * app's assets (an `angular.json` asset glob) and point this at that folder.
 */
export const SONE_LOGO_ASSET_BASE = new InjectionToken<string>(
  "SONE_LOGO_ASSET_BASE",
  { factory: () => "assets/brand/" },
);

export function provideSoneLogoAssets(base: string): Provider {
  return {
    provide: SONE_LOGO_ASSET_BASE,
    useValue: base.endsWith("/") ? base : `${base}/`,
  };
}

const ASSET_STEM: Record<LogoBrand, Record<LogoKind, string>> = {
  "surface-one": {
    tile: "surface-one-{mode}-icon",
    mark: "surface-one-{mode}-mark",
  },
  "index-one": {
    tile: "index-one-{mode}-symbol",
    mark: "index-one-{mode}-symbol",
  },
  ivy: { tile: "ivy-{mode}-icon", mark: "ivy-{mode}-mark" },
};

@Component({
  selector: "sone-logo",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "logo",
    "data-slot": "logo",
    "[attr.data-size]": "size()",
    "[attr.data-brand]": "brand()",
    "[attr.data-kind]": "kind()",
  },
  templateUrl: "./logo.component.html",
  styleUrl: "./logo.component.scss",
})
export class SoneLogoComponent {
  readonly size = input<LogoSize>("default");
  readonly brand = input<LogoBrand>("surface-one");
  readonly kind = input<LogoKind>("tile");
  readonly label = input<string>("");

  private readonly base = inject(SONE_LOGO_ASSET_BASE);
  private readonly stem = computed(() => ASSET_STEM[this.brand()][this.kind()]);
  protected readonly lightSrc = computed(
    () => `${this.base}${this.stem().replace("{mode}", "light")}.svg`,
  );
  protected readonly darkSrc = computed(
    () => `${this.base}${this.stem().replace("{mode}", "dark")}.svg`,
  );
}
