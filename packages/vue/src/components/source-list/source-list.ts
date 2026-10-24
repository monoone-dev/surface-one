import {
  Fragment,
  computed,
  defineComponent,
  h,
  ref,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";

export type SourceListVariant = "chip" | "row";
export type SourceListSize = "default" | "sm";

/** What a `SoneSourceList` template ref exposes. */
export interface SoneSourceListExposed {
  /** Every item shows (past `limit`). */
  readonly expanded: boolean;
  /** Shows every item, or only the first `limit` again. */
  toggle(): void;
}

/**
 * `<sone-source-list>` — the sources behind an answer, as wrapping chips or a list of rows,
 * with an optional label and count. Past `limit` the rest fold behind a "+N more" (chips) or
 * "Show all (N)" (rows) toggle. The `#item` slot draws one source (`{ item }`); `#icon`
 * sits before the label.
 */
export const SoneSourceList = defineComponent({
  name: "SoneSourceList",
  props: {
    items: { type: Array as PropType<readonly unknown[]>, default: () => [] },
    /** A stable key per item. */
    trackBy: {
      type: Function as PropType<(item: never) => string>,
      required: true,
    },
    variant: { type: String as PropType<SourceListVariant>, default: "row" },
    size: { type: String as PropType<SourceListSize>, default: "default" },
    /** The heading over the sources; none when empty. */
    label: { type: String, default: "" },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** A count badge beside the label. */
    showCount: { type: Boolean, default: false },
    /** How many show before the toggle; `null` shows them all. */
    limit: { type: Number as PropType<number | null>, default: null },
    columns: { type: Number as PropType<1 | 2>, default: 1 },
    /** A `<ul role="list">` (default: for rows) or a plain wrapper (default: for chips). */
    list: { type: Boolean as PropType<boolean | null>, default: null },
  },
  slots: Object as SlotsType<{ item: { item: never }; icon: object }>,
  setup(props, { slots, expose }) {
    const messages = useSoneMessages();
    const expanded = ref(false);
    const toggle = (): void => {
      expanded.value = !expanded.value;
    };
    expose({
      get expanded() {
        return expanded.value;
      },
      toggle,
    } satisfies SoneSourceListExposed);

    const isList = computed(() => props.list ?? props.variant === "row");
    const hiddenCount = computed(() =>
      props.limit === null ? 0 : Math.max(0, props.items.length - props.limit),
    );
    const visible = computed(() =>
      expanded.value || props.limit === null
        ? props.items
        : props.items.slice(0, props.limit),
    );

    const draw = (item: unknown): VNodeChild =>
      slots.item?.({ item: item as never });

    const toggleButton = () => {
      const m = messages.value;
      if (props.variant === "chip") {
        return h(
          SoneButton,
          { variant: "link", size: "sm", type: "button", onClick: toggle },
          () =>
            expanded.value
              ? m.sourceListShowLess
              : m.sourceListMore(hiddenCount.value),
        );
      }
      return h(
        SoneButton,
        {
          variant: "link",
          size: "xs",
          type: "button",
          class: "source-list-toggle",
          onClick: toggle,
          "aria-expanded": expanded.value ? "true" : "false",
        },
        () =>
          expanded.value
            ? m.sourceListShowFewer
            : m.sourceListShowAll(props.items.length),
      );
    };

    return () =>
      h(
        "sone-source-list",
        {
          "data-slot": "source-list",
          "data-variant": props.variant,
          "data-size": props.size,
          "data-columns": props.columns,
        },
        h(
          "div",
          {
            class: "source-list",
            "data-slot": "source-list-body",
            "aria-label": props.ariaLabel ?? undefined,
          },
          [
            props.label
              ? h(
                  "div",
                  {
                    class: "source-list-head",
                    "data-slot": "source-list-header",
                  },
                  [
                    slots.icon?.({}),
                    h(
                      "span",
                      {
                        class: "source-list-label",
                        "data-slot": "source-list-label",
                      },
                      props.label,
                    ),
                    props.showCount
                      ? h(
                          SoneBadge,
                          { variant: "secondary" },
                          () => `${props.items.length}`,
                        )
                      : null,
                  ],
                )
              : null,
            isList.value
              ? h(
                  "ul",
                  {
                    class: "source-list-items",
                    "data-slot": "source-list-items",
                    role: "list",
                  },
                  visible.value.map((item) =>
                    h(
                      "li",
                      {
                        key: props.trackBy(item as never),
                        class: "source-list-item",
                        "data-slot": "source-list-item",
                      },
                      [draw(item)],
                    ),
                  ),
                )
              : h(
                  "div",
                  {
                    class: "source-list-items",
                    "data-slot": "source-list-items",
                  },
                  visible.value.map((item) =>
                    h(Fragment, { key: props.trackBy(item as never) }, [
                      draw(item),
                    ]),
                  ),
                ),
            hiddenCount.value > 0 ? toggleButton() : null,
          ],
        ),
      );
  },
});
