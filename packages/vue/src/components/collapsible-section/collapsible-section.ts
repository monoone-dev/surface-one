import { defineComponent, h, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { SoneBadge } from "../badge/badge";
import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleTrigger,
} from "../collapsible/collapsible";

const CHEVRON = () =>
  h(
    "svg",
    {
      class: "collapsible-icon",
      "data-slot": "collapsible-icon",
      "aria-hidden": "true",
      viewBox: "0 0 16 16",
      fill: "none",
    },
    h("path", {
      d: "M6 4l4 4-4 4",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  );

/**
 * `<sone-collapsible-section>` — a titled section that folds, built on the Collapsible: a
 * full-width header button (chevron, `title`, optional `subtitle` and a secondary-badge
 * `count`) that keeps `aria-expanded` / `aria-controls` in sync, and the default slot below
 * it. `v-model:open` binds the state. The `#actions` slot sits at the end of the header,
 * outside the button.
 */
export const SoneCollapsibleSection = defineComponent({
  name: "SoneCollapsibleSection",
  props: {
    /** The section's name, shown in the header button. */
    title: { type: String, required: true },
    /** A quiet line after the title (a date range, a source). */
    subtitle: { type: String as PropType<string | null>, default: null },
    /** A count in a secondary badge after the title; `null` hides it. */
    count: {
      type: [Number, String] as PropType<number | string | null>,
      default: null,
    },
    /** Whether the body is shown (`v-model:open`). */
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: { "update:open": (_open: boolean) => true },
  setup(props, { slots, emit }) {
    const open = useModel(
      () => props.open,
      (v) => emit("update:open", v),
    );
    return () =>
      h(
        "sone-collapsible-section",
        {
          "data-slot": "collapsible-section",
          "data-state": open.value ? "open" : "closed",
        },
        h(
          SoneCollapsible,
          {
            class: "section",
            expanded: open.value,
            disabled: props.disabled,
            "onUpdate:expanded": (v: boolean) => open.set(v),
          },
          () => [
            h(
              "div",
              { class: "header", "data-slot": "collapsible-section-header" },
              [
                h(SoneCollapsibleTrigger, { class: "trigger" }, () => [
                  CHEVRON(),
                  h("span", { class: "heading" }, [
                    h(
                      "span",
                      {
                        class: "title",
                        "data-slot": "collapsible-section-title",
                      },
                      props.title,
                    ),
                    props.subtitle
                      ? h(
                          "span",
                          {
                            class: "subtitle",
                            "data-slot": "collapsible-section-subtitle",
                          },
                          props.subtitle,
                        )
                      : null,
                  ]),
                  props.count !== null
                    ? h(
                        SoneBadge,
                        {
                          variant: "secondary",
                          "data-slot": "collapsible-section-count",
                        },
                        () => String(props.count),
                      )
                    : null,
                ]),
                h("div", { class: "actions" }, slots.actions?.()),
              ],
            ),
            h(
              SoneCollapsibleContent,
              { class: "body", "data-slot": "collapsible-section-content" },
              () => slots.default?.(),
            ),
          ],
        ),
      );
  },
});
