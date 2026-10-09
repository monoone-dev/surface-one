import { defineComponent, type PropType } from "vue";

import { asProp, renderAs } from "../../utils/part";

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

export type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

export type ButtonGroupOrientation = "horizontal" | "vertical";

/** A disabled link or label has no native `disabled`: `aria-disabled="true"` swallows its clicks. */
function swallowWhenDisabled(event: Event): void {
  const el = event.currentTarget as HTMLElement | null;
  if (el?.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

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
          onClickCapture: tag === "button" ? undefined : swallowWhenDisabled,
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
