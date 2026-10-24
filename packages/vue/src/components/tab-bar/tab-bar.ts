import { defineComponent, h, type PropType } from "vue";

import {
  tabBarCurrent,
  tabBarItemKind,
  tabBarShowsLabel,
  type TabBarItem,
  type TabBarLabels,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneIcon } from "../icon/icon";

export type { TabBarItem, TabBarLabels } from "@surface-one/core";

/**
 * `<sone-tab-bar>` — mobile-style bottom navigation for the web (the twin of the React
 * Native `SoneTabBar`): a `nav` of `items`, each a link (`href`, `aria-current="page"`
 * while active) or a button, with an icon and the active tab's label (`labels="always"`
 * shows every one). `v-model` is the active tab's value. `floating` (the default) is a
 * centred pill that sticks to the bottom; `:floating="false"` a full-width bar.
 */
export const SoneTabBar = defineComponent({
  name: "SoneTabBar",
  props: {
    items: { type: Array as PropType<readonly TabBarItem[]>, required: true },
    /** The active tab's value — `v-model`. */
    modelValue: { type: String as PropType<string | null>, default: null },
    /** Names the navigation landmark (default: the "Tab bar" message). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** `active` shows the active tab's label only; `always` every label. */
    labels: { type: String as PropType<TabBarLabels>, default: "active" },
    /** A centred pill (the default); `false` is a full-width bar. */
    floating: { type: Boolean, default: true },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v as string),
    );
    const select = (item: TabBarItem): void => {
      if (!item.disabled) value.set(item.value);
    };
    return () =>
      h(
        "sone-tab-bar",
        {
          "data-slot": "tab-bar",
          "data-floating": props.floating ? "" : undefined,
          "data-labels": props.labels,
        },
        h(
          "nav",
          {
            class: "tab-bar",
            "data-slot": "tab-bar-nav",
            "aria-label": props.ariaLabel ?? messages.value.tabBarLabel,
          },
          h(
            "ul",
            { class: "tab-bar-list", role: "list" },
            props.items.map((item) => {
              const active = item.value === value.value;
              const link = tabBarItemKind(item) === "link";
              const content = [
                item.icon ? h(SoneIcon, { icon: item.icon }) : null,
                h(
                  "span",
                  {
                    class: [
                      "tab-bar-label",
                      { "sr-only": !tabBarShowsLabel(props.labels, active) },
                    ],
                  },
                  item.label,
                ),
              ];
              return h(
                "li",
                { key: item.value, class: "tab-bar-cell" },
                h(
                  link ? "a" : "button",
                  {
                    type: link ? undefined : "button",
                    class: "tab-bar-item",
                    "data-slot": "tab-bar-item",
                    href: link ? item.href : undefined,
                    disabled: link ? undefined : (item.disabled ?? false),
                    "data-active": active ? "" : undefined,
                    "aria-current": tabBarCurrent(item, active) ?? undefined,
                    onClick: () => select(item),
                  },
                  content,
                ),
              );
            }),
          ),
        ),
      );
  },
});
