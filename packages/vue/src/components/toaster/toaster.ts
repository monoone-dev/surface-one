import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type ToastKind = "info" | "success" | "danger";

export interface SoneToast {
  id: number;
  message: string;
  kind: ToastKind;
  action?: { label: string };
  secondaryAction?: { label: string };
}

/**
 * `<sone-toaster>` — renders the toasts its owner keeps (`:toasts`) in a polite live
 * region, each with an optional secondary and primary action and a close button. The
 * owner owns the queue: drop a toast on `dismiss` (and on `action` if it should go).
 */
export const SoneToaster = defineComponent({
  name: "SoneToaster",
  props: {
    toasts: { type: Array as PropType<readonly SoneToast[]>, required: true },
  },
  emits: {
    /** The close button of the toast with this id was pressed. */
    dismiss: (_id: number) => true,
    /** The primary action of the toast with this id was pressed. */
    action: (_id: number) => true,
    /** The secondary action of the toast with this id was pressed. */
    secondaryAction: (_id: number) => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-toaster",
        { "data-slot": "toaster" },
        props.toasts.length > 0
          ? h(
              "div",
              {
                class: "toast-viewport",
                "aria-live": "polite",
                "aria-atomic": "false",
              },
              props.toasts.map((t) =>
                h(
                  "div",
                  {
                    key: t.id,
                    class: ["toast", `is-${t.kind}`],
                    "data-slot": "toast",
                    "data-kind": t.kind,
                    role: "status",
                  },
                  [
                    h("span", { class: "toast-msg" }, t.message),
                    t.secondaryAction
                      ? h(
                          SoneButton,
                          {
                            variant: "ghost",
                            size: "sm",
                            type: "button",
                            class: "toast-action",
                            onClick: () => emit("secondaryAction", t.id),
                          },
                          () => t.secondaryAction!.label,
                        )
                      : null,
                    t.action
                      ? h(
                          SoneButton,
                          {
                            size: "sm",
                            type: "button",
                            class: "toast-action",
                            onClick: () => emit("action", t.id),
                          },
                          () => t.action!.label,
                        )
                      : null,
                    h(
                      SoneButton,
                      {
                        variant: "ghost",
                        size: "icon-xs",
                        type: "button",
                        class: "toast-close",
                        "aria-label": messages.value.dismissNotification,
                        onClick: () => emit("dismiss", t.id),
                      },
                      () => h(SoneIcon, { icon: "close" }),
                    ),
                  ],
                ),
              ),
            )
          : undefined,
      );
  },
});
