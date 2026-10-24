import { defineComponent, h, type PropType } from "vue";

import { SoneDialog, type DialogSize } from "../dialog/dialog";

/**
 * `<sone-command-dialog>` — a `SoneDialog` sized and padded for a command palette
 * (shadcn/ui CommandDialog). Put a `SoneCommand` in it; render it with `v-if` and
 * close it on `dismiss`, like any dialog. Escape, the scrim and focus return come
 * from the dialog.
 */
export const SoneCommandDialog = defineComponent({
  name: "SoneCommandDialog",
  props: {
    /** Names the dialog for assistive technology. */
    label: { type: String, required: true },
    size: { type: String as PropType<DialogSize>, default: "md" },
  },
  emits: { dismiss: () => true },
  setup(props, { emit, slots }) {
    return () =>
      h("sone-command-dialog", { "data-slot": "command-dialog" }, [
        h(
          SoneDialog,
          {
            class: "command-dialog",
            size: props.size,
            ariaLabel: props.label,
            showClose: false,
            onDismiss: () => emit("dismiss"),
          },
          slots,
        ),
      ]);
  },
});
