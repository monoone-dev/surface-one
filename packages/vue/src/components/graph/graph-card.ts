import { computed, defineComponent, h, type PropType } from "vue";

import { graphCardPlacement, type GraphSceneAnchor } from "@surface-one/core";
import { SoneButton } from "../button/button";

/**
 * `<sone-graph-card>` — the node card of a graph. Floating, it sits above (or below,
 * near the top edge) the node at `anchor` and ignores the pointer; `pinned`, it docks to
 * the bottom-left corner and offers the `openLabel` action. The default slot replaces
 * the heading and meta lines. `data-node-x` / `data-node-y` expose the node's on-screen
 * position for tests.
 */
export const SoneGraphCard = defineComponent({
  name: "SoneGraphCard",
  props: {
    anchor: {
      type: Object as PropType<GraphSceneAnchor | null>,
      default: null,
    },
    heading: { type: String, required: true },
    meta: { type: String, default: "" },
    /** Any CSS colour for the swatch, e.g. `var(--graph-note)`. */
    tone: { type: String, default: "var(--graph-ink)" },
    square: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    /** The text of the open action of a pinned card; `null` hides it. */
    openLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { open: () => true },
  setup(props, { slots, emit }) {
    const placement = computed(() =>
      graphCardPlacement(props.anchor, props.pinned),
    );
    return () => {
      const p = placement.value;
      const body = slots.default?.();
      return h(
        "sone-graph-card",
        {
          "data-slot": "graph-card",
          "data-state": props.pinned ? "pinned" : "floating",
          class: p.below ? "is-below" : undefined,
          style: {
            left: p.left === null ? undefined : `${p.left}px`,
            top: p.top === null ? undefined : `${p.top}px`,
          },
          "data-node-x": props.anchor?.x,
          "data-node-y": props.anchor?.y,
        },
        [
          h(
            "div",
            { class: "gcard-text" },
            body ?? [
              h(
                "span",
                { class: "gcard-title", "data-slot": "graph-card-title" },
                props.heading,
              ),
              props.meta
                ? h(
                    "span",
                    { class: "gcard-meta", "data-slot": "graph-card-meta" },
                    [
                      h("span", {
                        class: ["gcard-swatch", { "is-square": props.square }],
                        style: { background: props.tone },
                        "aria-hidden": "true",
                      }),
                      props.meta,
                    ],
                  )
                : null,
            ],
          ),
          props.pinned && props.openLabel
            ? h(
                SoneButton,
                {
                  variant: "outline",
                  size: "xs",
                  type: "button",
                  onClick: () => emit("open"),
                },
                () => props.openLabel,
              )
            : null,
        ],
      );
    };
  },
});
