import { defineComponent, type PropType } from "vue";

import { swallowWhenDisabled } from "@surface-one/core";

import { asProp, renderAs } from "../../utils/part";

export type ButtonVariant =
  | "default"
  | "accent"
  | "secondary"
  | "soft"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

export type ButtonGroupOrientation = "horizontal" | "vertical";

/** A disabled link or label has no native `disabled`: `aria-disabled="true"` swallows its clicks. */
const swallowDisabledClick = (event: Event): void => {
  swallowWhenDisabled(event.currentTarget as Element | null, event);
};

/** `<button soneBtn>` — renders a `<button>`; `as="a"` or `:as="NuxtLink"` for a link. */
export const SoneButton = defineComponent({
  name: "SoneButton",
  props: {
    ...asProp,
    variant: { type: String as PropType<ButtonVariant>, default: "default" },
    size: { type: String as PropType<ButtonSize>, default: "default" },
  },
  setup(props, { slots }) {
    return () => {
      const tag = props.as ?? "button";
      return renderAs(
        tag,
        {
          class: "btn",
          "data-slot": "button",
          "data-variant": props.variant,
          "data-size": props.size,
          onClickCapture: tag === "button" ? undefined : swallowDisabledClick,
        },
        slots,
      );
    };
  },
});

/** `[soneButtonGroup]` */
export const SoneButtonGroup = defineComponent({
  name: "SoneButtonGroup",
  props: {
    ...asProp,
    orientation: {
      type: String as PropType<ButtonGroupOrientation>,
      default: "horizontal",
    },
  },
  setup(props, { slots }) {
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "btn-group",
          role: "group",
          "data-slot": "button-group",
          "data-orientation": props.orientation,
        },
        slots,
      );
  },
});
