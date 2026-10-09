import { computed, defineComponent, h, type PropType } from "vue";

import type { AlertVariant } from "../alert/alert";

export type BannerKind = "info" | "success" | "warning" | "danger";

const stroke = {
  stroke: "currentColor",
  "stroke-width": "1.5",
} as const;

const ring = () => h("circle", { cx: "8", cy: "8", r: "6.25", ...stroke });

const GLYPHS: Record<BannerKind, () => ReturnType<typeof h>[]> = {
  success: () => [
    ring(),
    h("path", {
      d: "m5.4 8.2 1.8 1.8 3.4-3.6",
      ...stroke,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ],
  warning: () => [
    h("path", {
      d: "M7.13 2.5a1 1 0 0 1 1.74 0l5.4 9.5a1 1 0 0 1-.87 1.5H2.6a1 1 0 0 1-.87-1.5l5.4-9.5Z",
      ...stroke,
      "stroke-linejoin": "round",
    }),
    h("path", { d: "M8 6.2v3", ...stroke, "stroke-linecap": "round" }),
    h("circle", { cx: "8", cy: "11.3", r: "0.85", fill: "currentColor" }),
  ],
  danger: () => [
    ring(),
    h("path", { d: "M8 4.9v3.5", ...stroke, "stroke-linecap": "round" }),
    h("circle", { cx: "8", cy: "10.9", r: "0.85", fill: "currentColor" }),
  ],
  info: () => [
    ring(),
    h("path", { d: "M8 7.4v3.7", ...stroke, "stroke-linecap": "round" }),
    h("circle", { cx: "8", cy: "5.05", r: "0.85", fill: "currentColor" }),
  ],
};

/** `<sone-banner>` — a one-line alert with its kind's glyph; `danger` / `warning` are announced at once. */
export const SoneBanner = defineComponent({
  name: "SoneBanner",
  props: {
    kind: { type: String as PropType<BannerKind>, default: "info" },
  },
  setup(props, { slots }) {
    const variant = computed<AlertVariant>(() =>
      props.kind === "danger" ? "destructive" : props.kind,
    );
    return () =>
      h(
        "sone-banner",
        {
          class: "alert",
          "data-slot": "alert",
          "data-variant": variant.value,
          role:
            props.kind === "danger" || props.kind === "warning"
              ? "alert"
              : "status",
        },
        [
          h(
            "svg",
            { viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" },
            (GLYPHS[props.kind] ?? GLYPHS.info)(),
          ),
          h("span", { class: "banner-body" }, slots.default?.()),
        ],
      );
  },
});
