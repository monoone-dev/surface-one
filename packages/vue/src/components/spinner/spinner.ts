import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";

/** `<sone-spinner>` — `role="status"` with a label (default: the "Loading" message); `:label="null"` for a decorative one. */
export const SoneSpinner = defineComponent({
  name: "SoneSpinner",
  props: {
    size: { type: Number, default: 16 },
    label: { type: String as PropType<string | null>, default: undefined },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () => {
      const label =
        props.label === undefined ? messages.value.loading : props.label;
      return h(
        "sone-spinner",
        { "data-slot": "spinner" },
        h(
          "svg",
          {
            class: "spinner-glyph",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            role: label ? "status" : undefined,
            "aria-label": label || undefined,
            "aria-hidden": label ? undefined : "true",
            style: { width: `${props.size}px`, height: `${props.size}px` },
          },
          h("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" }),
        ),
      );
    };
  },
});
