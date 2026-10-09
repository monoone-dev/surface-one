import {
  computed,
  defineComponent,
  h,
  inject,
  type App,
  type InjectionKey,
  type PropType,
} from "vue";

export type LogoSize = "xs" | "sm" | "default" | "lg";
export type LogoBrand = "surface-one" | "index-one" | "ivy";
export type LogoKind = "tile" | "mark";

/**
 * Where the brand SVGs are served from. Copy `@surface-one/tokens/brand` into the app's
 * public folder (Nuxt: `public/brand/`) — the default is `/brand/`.
 */
export const SONE_LOGO_ASSET_BASE: InjectionKey<string> = Symbol(
  "SONE_LOGO_ASSET_BASE",
);

export function provideSoneLogoAssets(app: App, base: string): void {
  app.provide(SONE_LOGO_ASSET_BASE, base.endsWith("/") ? base : `${base}/`);
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

/** `<sone-logo>` — a brand mark; the light and dark files swap with the theme. */
export const SoneLogo = defineComponent({
  name: "SoneLogo",
  props: {
    size: { type: String as PropType<LogoSize>, default: "default" },
    brand: { type: String as PropType<LogoBrand>, default: "surface-one" },
    kind: { type: String as PropType<LogoKind>, default: "tile" },
    /** The accessible name; empty = decorative. */
    label: { type: String, default: "" },
  },
  setup(props) {
    const base = inject(SONE_LOGO_ASSET_BASE, "/brand/");
    const src = computed(
      () => (mode: "light" | "dark") =>
        `${base}${ASSET_STEM[props.brand][props.kind].replace("{mode}", mode)}.svg`,
    );
    const image = (mode: "light" | "dark") =>
      h("img", {
        class: `logo-image logo-image-${mode}`,
        src: src.value(mode),
        alt: props.label,
        "aria-hidden": props.label ? undefined : "true",
        draggable: "false",
      });
    return () =>
      h(
        "sone-logo",
        {
          class: "logo",
          "data-slot": "logo",
          "data-size": props.size,
          "data-brand": props.brand,
          "data-kind": props.kind,
        },
        [image("light"), image("dark")],
      );
  },
});
