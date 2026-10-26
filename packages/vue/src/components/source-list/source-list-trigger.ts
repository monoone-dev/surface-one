import { defineComponent, h } from "vue";

import { useSoneMessages } from "../../composables/messages";

/**
 * `button[soneSourceListTrigger]` — the sources behind an answer folded into one chip: up to
 * three stacked marks (the default slot) and a count (“6 sources”). A plain button: open the
 * full `SoneSourceList` from it and set `aria-expanded` / `aria-controls` for what it opens.
 */
export const SoneSourceListTrigger = defineComponent({
  name: "SoneSourceListTrigger",
  props: {
    /** How many sources there are (the count on the chip). */
    count: { type: Number, default: 0 },
    type: {
      type: String as () => "button" | "submit" | "reset",
      default: "button",
    },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    return () =>
      h("button", { type: props.type, "data-slot": "source-list-trigger" }, [
        h(
          "span",
          { "data-slot": "source-list-trigger-marks", "aria-hidden": "true" },
          slots.default?.(),
        ),
        h(
          "span",
          { "data-slot": "source-list-trigger-label" },
          messages.value.sourceListCount(Math.max(0, Math.round(props.count))),
        ),
      ]);
  },
});
