import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { asProp, definePart, renderAs } from "../../utils/part";
import { SoneButton } from "../button/button";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

const CLOSE = () =>
  h("svg", { viewBox: "0 0 20 20", fill: "none", "aria-hidden": "true" }, [
    h("path", {
      d: "m5.5 5.5 9 9M14.5 5.5l-9 9",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
    }),
  ]);

/**
 * `[soneAlert]` — `dismissible` adds a close button at the end and emits
 * `dismissed`; the owner removes the alert.
 */
export const SoneAlert = defineComponent({
  name: "SoneAlert",
  props: {
    ...asProp,
    variant: { type: String as PropType<AlertVariant>, default: "default" },
    dismissible: { type: Boolean, default: false },
    /** The close button's name (default: the "Dismiss" message). */
    closeLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { dismissed: () => true },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    return () => {
      const label = props.closeLabel ?? messages.value.dismiss;
      const content = slots.default?.() ?? [];
      return renderAs(
        props.as ?? "div",
        {
          class: "alert",
          "data-slot": "alert",
          "data-variant": props.variant,
          "data-dismissible": props.dismissible ? "" : undefined,
        },
        {
          default: () => [
            ...content,
            ...(props.dismissible
              ? [
                  h(
                    SoneButton,
                    {
                      variant: "ghost",
                      size: "icon-xs",
                      type: "button",
                      class: "alert-close",
                      "data-slot": "alert-close",
                      "aria-label": label,
                      title: label,
                      onClick: () => emit("dismissed"),
                    },
                    () => CLOSE(),
                  ),
                ]
              : []),
          ],
        },
      );
    };
  },
});

export const SoneAlertTitle = definePart({
  name: "SoneAlertTitle",
  tag: "p",
  className: "alert-title",
  slot: "alert-title",
});

export const SoneAlertDescription = definePart({
  name: "SoneAlertDescription",
  tag: "p",
  className: "alert-description",
  slot: "alert-description",
});

export const SoneAlertAction = definePart({
  name: "SoneAlertAction",
  tag: "div",
  className: "alert-action",
  slot: "alert-action",
});
