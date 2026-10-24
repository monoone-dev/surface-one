import { defineComponent, h, type PropType } from "vue";

import { pageSiteHeaderClosesMenu } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSheet } from "../sheet/sheet";

/**
 * `<sone-page-site-header>` — the header of a site (Nuxt UI Header): a `title` link or
 * the `#logo` slot, the `#nav` slot (shown once the header is wide enough) and
 * `#actions`. Below a medium width a menu button opens the `#menu` slot in a sheet
 * (focus trapped, Escape, the scrim or a link close it); `v-model:open` is that sheet.
 * It renders a `<header>`; `sticky` pins it to the top.
 */
export const SonePageSiteHeader = defineComponent({
  name: "SonePageSiteHeader",
  props: {
    /** A text logo, a link to `href`. */
    title: { type: String as PropType<string | null>, default: null },
    href: { type: String, default: "/" },
    /** The narrow-screen menu sheet — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** Pins the header to the top of the scrolling page. */
    sticky: { type: Boolean, default: false },
    /** Names the menu button and the sheet (default: the "Menu" message). */
    menuLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:open": (_open: boolean) => true },
  setup(props, { emit, slots }) {
    const messages = useSoneMessages();
    const open = useModel(
      () => props.open,
      (v) => emit("update:open", v),
    );
    const closeOnLink = (event: Event): void => {
      if (pageSiteHeaderClosesMenu(event.target)) open.set(false);
    };
    return () => {
      const label = props.menuLabel ?? messages.value.pageSiteHeaderMenu;
      const menu = slots.menu;
      return h(
        "sone-page-site-header",
        {
          "data-slot": "page-site-header",
          "data-sticky": props.sticky ? "" : undefined,
        },
        [
          h(
            "header",
            { class: "page-site-header", "data-slot": "page-site-header-bar" },
            [
              h(
                "div",
                {
                  class: "page-site-header-logo",
                  "data-slot": "page-site-header-logo",
                },
                [
                  props.title
                    ? h(
                        "a",
                        { class: "page-site-header-title", href: props.href },
                        props.title,
                      )
                    : null,
                  slots.logo?.(),
                ],
              ),
              h(
                "div",
                {
                  class: "page-site-header-nav",
                  "data-slot": "page-site-header-nav",
                },
                slots.nav?.(),
              ),
              h(
                "div",
                {
                  class: "page-site-header-actions",
                  "data-slot": "page-site-header-actions",
                },
                [
                  slots.actions?.(),
                  menu
                    ? h(
                        SoneButton,
                        {
                          variant: "ghost",
                          size: "icon",
                          type: "button",
                          class: "page-site-header-toggle",
                          "data-slot": "page-site-header-toggle",
                          "aria-haspopup": "dialog",
                          "aria-expanded": open.value ? "true" : "false",
                          "aria-label": label,
                          onClick: () => open.set(true),
                        },
                        () => h(SoneIcon, { icon: "menu" }),
                      )
                    : null,
                ],
              ),
            ],
          ),
          menu && open.value
            ? h(
                SoneSheet,
                {
                  side: "right",
                  ariaLabel: label,
                  onDismiss: () => open.set(false),
                },
                () =>
                  h(
                    "div",
                    {
                      class: "page-site-header-menu",
                      "data-slot": "page-site-header-menu",
                      onClick: closeOnLink,
                    },
                    menu(),
                  ),
              )
            : null,
        ],
      );
    };
  },
});
