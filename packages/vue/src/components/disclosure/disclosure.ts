import { defineComponent, h, useId, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { flag } from "../../utils/part";

/**
 * `<sone-disclosure>` — a show / hide section (one accordion item): the `#summary`
 * slot is the trigger, the default slot the panel. `v-model:open`.
 */
export const SoneDisclosure = defineComponent({
  name: "SoneDisclosure",
  props: {
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Names the panel region; by default the trigger does. */
    panelLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:open": (_value: boolean) => true },
  setup(props, { emit, slots }) {
    const open = useModel(
      () => props.open,
      (v) => emit("update:open", v),
    );
    const uid = `sone-disclosure-${useId()}`;
    const panelId = `${uid}-panel`;
    const triggerId = `${uid}-trigger`;
    const toggle = (): void => {
      if (!props.disabled) open.set(!open.value);
    };
    return () => {
      const state = open.value ? "open" : "closed";
      return h(
        "sone-disclosure",
        null,
        h(
          "div",
          {
            class: "disc-wrap",
            "data-slot": "accordion-item",
            "data-state": state,
            "data-disabled": flag(props.disabled),
          },
          [
            h(
              "button",
              {
                type: "button",
                class: "disc-trigger",
                "data-slot": "accordion-trigger",
                "data-state": state,
                id: triggerId,
                disabled: props.disabled,
                "aria-expanded": String(open.value),
                "aria-controls": panelId,
                onClick: toggle,
              },
              [
                h(
                  "svg",
                  {
                    class: "disc-chevron collapsible-icon",
                    width: "16",
                    height: "16",
                    viewBox: "0 0 12 12",
                    "data-slot": "accordion-trigger-icon",
                    fill: "none",
                    "aria-hidden": "true",
                  },
                  h("path", {
                    d: "M4 2l4 4-4 4",
                    stroke: "currentColor",
                    "stroke-width": "1.5",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                  }),
                ),
                h("span", { class: "disc-summary" }, slots["summary"]?.()),
              ],
            ),
            h(
              "div",
              {
                class: "disc-panel",
                "data-slot": "accordion-content",
                role: "region",
                "data-state": state,
                id: panelId,
                hidden: !open.value,
                "aria-labelledby": props.panelLabel ? undefined : triggerId,
                "aria-label": props.panelLabel ?? undefined,
              },
              slots.default?.(),
            ),
          ],
        ),
      );
    };
  },
});
