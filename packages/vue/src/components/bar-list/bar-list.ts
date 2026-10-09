import {
  computed,
  defineComponent,
  h,
  type PropType,
  type SlotsType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { chartColor, formatChartNumber } from "../../utils/chart";
import { scaleToPercent, type SoneChartTone } from "../../utils/scale";

export interface SoneBarListItem {
  /** Stable identity (the `key` of each row). */
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** The shown value; defaults to `valueFormat(value)`. */
  readonly valueLabel?: string;
  /** The bar colour; defaults to `accent`. */
  readonly tone?: SoneChartTone;
  /** A native tooltip on the label. */
  readonly title?: string;
}

export type SoneBarListScale = "max" | "total";
export type SoneBarListFormat = (value: number) => string;

/**
 * `<sone-bar-list>` — labelled horizontal bars with the value written next to each. A
 * real `<ul>`; the bar is decoration. The `label` scoped slot (`#label="{ item }"`)
 * replaces a row's label text, like Angular's `<ng-template soneBarListLabel>`.
 */
export const SoneBarList = defineComponent({
  name: "SoneBarList",
  props: {
    items: {
      type: Array as PropType<readonly SoneBarListItem[]>,
      default: () => [],
    },
    scale: { type: String as PropType<SoneBarListScale>, default: "max" },
    max: { type: Number as PropType<number | null>, default: null },
    /** Formats `value` when an item has no `valueLabel`; default: a localized number. */
    valueFormat: {
      type: Function as PropType<SoneBarListFormat | null>,
      default: null,
    },
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  slots: Object as SlotsType<{ label: { item: SoneBarListItem } }>,
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const format = computed<SoneBarListFormat>(
      () =>
        props.valueFormat ??
        ((n) => formatChartNumber(n, messages.value.numberLocale)),
    );
    const full = computed(() => {
      if (props.max !== null && Number.isFinite(props.max)) return props.max;
      const values = props.items
        .map((i) => i.value)
        .filter((v) => Number.isFinite(v) && v > 0);
      return props.scale === "total"
        ? values.reduce((a, b) => a + b, 0)
        : values.reduce((a, b) => Math.max(a, b), 0);
    });
    return () =>
      h(
        "sone-bar-list",
        { "data-slot": "bar-list", "data-scale": props.scale },
        h(
          "ul",
          { class: "bar-list", "aria-label": props.ariaLabel || undefined },
          props.items.map((item) => {
            const pct = scaleToPercent(item.value, full.value);
            return h(
              "li",
              {
                key: item.key,
                class: "bar-list-row",
                "data-slot": "bar-list-item",
                style: { "--_color": chartColor(item.tone ?? "accent") },
              },
              [
                h(
                  "span",
                  {
                    class: "bar-list-label",
                    "data-slot": "bar-list-label",
                    title: item.title,
                  },
                  slots.label ? slots.label({ item }) : [item.label],
                ),
                h(
                  "span",
                  {
                    class: "bar-list-track",
                    "data-slot": "bar-list-track",
                    "aria-hidden": "true",
                  },
                  pct > 0
                    ? [
                        h("span", {
                          class: "bar-list-fill",
                          "data-slot": "bar-list-indicator",
                          style: { width: `${pct}%` },
                        }),
                      ]
                    : [],
                ),
                h(
                  "span",
                  { class: "bar-list-value", "data-slot": "bar-list-value" },
                  item.valueLabel ?? format.value(item.value),
                ),
              ],
            );
          }),
        ),
      );
  },
});
