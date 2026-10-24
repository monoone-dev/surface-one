import { defineComponent, h, type PropType } from "vue";

import { toHeadingLevel, type HeadingLevel } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

/**
 * `<sone-app-bar>` — the top bar of a screen (the web twin of the React Native
 * `SoneAppBar`): an optional back button, the title as a real heading (`level`, default
 * 1) with a subtitle, and the `#trailing` slot at the end. It renders a `<header>`;
 * `sticky` pins it to the top and its padding clears the notch.
 *
 * `showBack` (or an `@back` listener) draws a back button that emits `back`;
 * `backHref` makes it a link.
 */
export const SoneAppBar = defineComponent({
  name: "SoneAppBar",
  props: {
    title: { type: String, required: true },
    /** A line under the title. */
    subtitle: { type: String as PropType<string | null>, default: null },
    /** The title's heading level, 1–6. */
    level: {
      type: [Number, String] as PropType<HeadingLevel | `${HeadingLevel}`>,
      default: 1,
    },
    /** Shows the back button, which emits `back`. */
    showBack: { type: Boolean, default: false },
    /** Makes the back button a link to this URL. */
    backHref: { type: String as PropType<string | null>, default: null },
    /** The back button's accessible name (default: the "Back" message). */
    backLabel: { type: String as PropType<string | null>, default: null },
    /** Pins the bar to the top of the scrolling page. */
    sticky: { type: Boolean, default: false },
    /** Set by an `@back` listener: shows the back button too. */
    onBack: { type: Function as PropType<() => void>, default: undefined },
  },
  emits: ["back"],
  setup(props, { emit, slots }) {
    const messages = useSoneMessages();
    return () => {
      const level = toHeadingLevel(props.level, 1);
      const label = props.backLabel ?? messages.value.appBarBack;
      const icon = () => h(SoneIcon, { icon: "arrow-left" });
      const back = props.backHref
        ? h(
            SoneButton,
            {
              as: "a",
              variant: "ghost",
              size: "icon",
              class: "app-bar-back",
              "data-slot": "app-bar-back",
              href: props.backHref,
              "aria-label": label,
            },
            icon,
          )
        : props.showBack || props.onBack
          ? h(
              SoneButton,
              {
                variant: "ghost",
                size: "icon",
                type: "button",
                class: "app-bar-back",
                "data-slot": "app-bar-back",
                "aria-label": label,
                onClick: () => emit("back"),
              },
              icon,
            )
          : null;
      return h(
        "sone-app-bar",
        {
          "data-slot": "app-bar",
          "data-sticky": props.sticky ? "" : undefined,
        },
        h("header", { class: "app-bar", "data-slot": "app-bar-header" }, [
          back,
          h(
            "div",
            { class: "app-bar-heading", "data-slot": "app-bar-heading" },
            [
              h(
                `h${level}`,
                { class: "app-bar-title", "data-slot": "app-bar-title" },
                props.title,
              ),
              props.subtitle
                ? h(
                    "p",
                    {
                      class: "app-bar-subtitle",
                      "data-slot": "app-bar-subtitle",
                    },
                    props.subtitle,
                  )
                : null,
            ],
          ),
          h("div", { class: "app-bar-trailing" }, slots.trailing?.()),
        ]),
      );
    };
  },
});
