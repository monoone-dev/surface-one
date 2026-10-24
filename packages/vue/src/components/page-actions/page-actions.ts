import { defineComponent, h, ref, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { definePart } from "../../utils/part";
import { flatten } from "../../utils/vnodes";
import { SoneRowMenu, type SoneRowMenuExposed } from "../row-menu/row-menu";

/** `[sonePageActionsStatus]` — your own status beside (or instead of) the `status` text. */
export const SonePageActionsStatus = definePart({
  name: "SonePageActionsStatus",
  tag: "span",
  slot: "page-actions-status",
});

/** `[sonePageActionsLead]` — buttons before the ⋯ menu (favourite, share). */
export const SonePageActionsLead = definePart({
  name: "SonePageActionsLead",
  tag: "span",
  slot: "page-actions-lead",
});

/** What a `SonePageActions` template ref exposes. */
export interface SonePageActionsExposed {
  readonly isOpen: boolean;
  /** Closes the menu. */
  close(): void;
}

/**
 * `<sone-page-actions>` — the actions at the end of a page header: a muted status
 * ("Edited Oct 08"), the `SonePageActionsStatus` and `SonePageActionsLead` parts, then a
 * prominent ⋯ `SoneRowMenu` holding every other child (the menu items).
 */
export const SonePageActions = defineComponent({
  name: "SonePageActions",
  props: {
    status: { type: String as PropType<string | null>, default: null },
    /** The menu trigger's accessible name (default: the "More actions" message). */
    label: { type: String, default: undefined },
    tooltip: { type: String as PropType<string | null>, default: null },
    disabled: { type: Boolean, default: false },
    showMenu: { type: Boolean, default: true },
  },
  emits: {
    openChange: (open: boolean) => typeof open === "boolean",
  },
  setup(props, { slots, emit, expose }) {
    const messages = useSoneMessages();
    const open = ref(false);
    const menu = ref<SoneRowMenuExposed | null>(null);
    const exposed: SonePageActionsExposed = {
      get isOpen() {
        return open.value;
      },
      close: () => menu.value?.close(),
    };
    expose(exposed);

    const onOpenChange = (value: boolean): void => {
      open.value = value;
      emit("openChange", value);
    };

    return () => {
      const nodes = flatten(slots.default?.());
      const status = nodes.filter((n) => n.type === SonePageActionsStatus);
      const lead = nodes.filter((n) => n.type === SonePageActionsLead);
      const items = nodes.filter(
        (n) =>
          n.type !== SonePageActionsStatus && n.type !== SonePageActionsLead,
      );
      return h(
        "sone-page-actions",
        {
          "data-slot": "page-actions",
          "data-state": open.value && props.showMenu ? "open" : "closed",
        },
        [
          props.status
            ? h(
                "span",
                {
                  class: "page-actions-status",
                  "data-slot": "page-actions-status",
                },
                props.status,
              )
            : null,
          ...status,
          ...lead,
          props.showMenu
            ? h(
                SoneRowMenu,
                {
                  ref: menu,
                  prominent: true,
                  label: props.label ?? messages.value.pageActionsMore,
                  tooltip: props.tooltip,
                  disabled: props.disabled,
                  onOpenChange,
                },
                { default: () => items },
              )
            : null,
        ],
      );
    };
  },
});
