import { defineComponent, h, nextTick, ref, type PropType } from "vue";

import {
  tabStripKeyAction,
  tabStripPanelId,
  tabStripTabId,
  tabStripTabIndex,
  type TabStripTab,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { definePart } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type { TabStripStatus, TabStripTab } from "@surface-one/core";

/** Content after the tabs, pushed to the end of the strip (a search, an account). */
export const SoneTabStripTrailing = definePart({
  name: "SoneTabStripTrailing",
  tag: "div",
  className: "tab-strip-trailing",
  slot: "tab-strip-trailing",
});

/**
 * `<sone-tab-strip>` — document tabs for a desktop window (the WAI-ARIA Tabs pattern):
 * `v-model:active` is the selected tab's id. `closable` gives every tab a close button
 * (and Delete / ⌘W), `addable` a "New tab" button; `@close` and `@add` report them.
 * ←/→, Home and End move between tabs. The `trailing` slot sits at the end of the strip.
 */
export const SoneTabStrip = defineComponent({
  name: "SoneTabStrip",
  props: {
    tabs: {
      type: Array as PropType<readonly TabStripTab[]>,
      default: () => [],
    },
    /** The selected tab's id — `v-model:active`. */
    active: { type: String as PropType<string | null>, default: null },
    /** Names the tab list (default: the "Tabs" message). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    closable: { type: Boolean, default: false },
    addable: { type: Boolean, default: false },
    /** The id prefix the panels use, so each tab can point at its panel. */
    panelIdPrefix: { type: String, default: "tab-panel" },
  },
  emits: {
    "update:active": (_id: string) => true,
    close: (_id: string) => true,
    add: () => true,
  },
  setup(props, { emit, slots }) {
    const messages = useSoneMessages();
    const active = useModel(
      () => props.active,
      (v) => emit("update:active", v as string),
    );
    const root = ref<HTMLElement | null>(null);
    const focus = (id: string): void => {
      root.value
        ?.querySelector<HTMLElement>(
          `#${CSS.escape(tabStripTabId(props.panelIdPrefix, id))}`,
        )
        ?.focus();
    };
    const onKeydown = (event: KeyboardEvent, index: number): void => {
      const action = tabStripKeyAction(
        event,
        props.tabs,
        index,
        props.closable,
      );
      if (!action) return;
      event.preventDefault();
      if (action.kind === "move") {
        active.set(action.id);
        void nextTick(() => focus(action.id));
      } else {
        emit("close", action.id);
        const next = action.next;
        if (next) requestAnimationFrame(() => focus(next));
      }
    };

    return () => {
      const m = messages.value;
      return h("sone-tab-strip", { ref: root, "data-slot": "tab-strip" }, [
        h(
          "div",
          {
            class: "tab-strip-tabs",
            "data-slot": "tab-strip-list",
            role: "tablist",
            "aria-label": props.ariaLabel ?? m.tabStripLabel,
          },
          props.tabs.map((tab, i) => {
            const selected = tab.id === active.value;
            return h(
              "div",
              {
                key: tab.id,
                class: "tab-strip-tab",
                "data-slot": "tab-strip-tab",
                role: "presentation",
                "data-selected": selected ? "" : undefined,
              },
              [
                h(
                  "button",
                  {
                    type: "button",
                    role: "tab",
                    class: "tab-strip-trigger",
                    "data-slot": "tab-strip-trigger",
                    id: tabStripTabId(props.panelIdPrefix, tab.id),
                    "aria-selected": selected ? "true" : "false",
                    "aria-controls": tabStripPanelId(
                      props.panelIdPrefix,
                      tab.id,
                    ),
                    tabindex: tabStripTabIndex(props.tabs, active.value, i),
                    onClick: () => active.set(tab.id),
                    onKeydown: (e: KeyboardEvent) => onKeydown(e, i),
                  },
                  [
                    h("span", { class: "tab-strip-label" }, tab.label),
                    tab.note
                      ? h(
                          "span",
                          {
                            class: "tab-strip-note",
                            "data-status": tab.status ?? undefined,
                          },
                          tab.note,
                        )
                      : null,
                    tab.status
                      ? h(
                          "span",
                          {
                            class: "tab-strip-status",
                            "data-status": tab.status,
                          },
                          h(
                            "span",
                            { class: "sr-only" },
                            m.tabStripStatus(tab.status),
                          ),
                        )
                      : null,
                  ],
                ),
                props.closable
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "tab-strip-close",
                        "data-slot": "tab-strip-close",
                        tabindex: "-1",
                        "aria-hidden": "true",
                        "aria-label": m.tabStripClose(tab.label),
                        onClick: () => emit("close", tab.id),
                      },
                      h(SoneIcon, { icon: "close" }),
                    )
                  : null,
              ],
            );
          }),
        ),
        props.addable
          ? h(
              "button",
              {
                class: "btn tab-strip-add",
                "data-slot": "button",
                "data-variant": "ghost",
                "data-size": "icon-sm",
                type: "button",
                "aria-label": m.tabStripAdd,
                title: m.tabStripAdd,
                onClick: () => emit("add"),
              },
              h(SoneIcon, { icon: "plus" }),
            )
          : null,
        h("span", { class: "tab-strip-spacer" }),
        slots.trailing?.(),
      ]);
    };
  },
});
