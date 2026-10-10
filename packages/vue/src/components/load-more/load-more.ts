import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";
import { SoneSpinner } from "../spinner/spinner";

export type LoadMoreAlign = "start" | "center";

/**
 * `<sone-load-more>` — the "Show more" button at the end of a paged list. It emits
 * `load`; the owner fetches the next page and sets `busy` meanwhile (the button stays
 * focusable, `aria-disabled`, and shows a spinner with `busyLabel`). `remaining` adds the
 * count left to the label — "Show more (12)" — and hides the whole thing at 0. When the
 * last page failed, set `error`: the message is announced (`role="alert"`) and the button
 * becomes `retryLabel`.
 */
export const SoneLoadMore = defineComponent({
  name: "SoneLoadMore",
  props: {
    /** The next page is loading. */
    busy: { type: Boolean, default: false },
    /** How many items are left; shown in the label, and `0` hides the control. `null` = unknown. */
    remaining: { type: Number as PropType<number | null>, default: null },
    /** Why the last load failed; shown above a retry button. */
    error: { type: String as PropType<string | null>, default: null },
    /** Default: the "Show more" message. */
    label: { type: String as PropType<string | null>, default: null },
    /** Default: the "Loading…" message. */
    busyLabel: { type: String as PropType<string | null>, default: null },
    /** Default: the "Try again" message. */
    retryLabel: { type: String as PropType<string | null>, default: null },
    align: { type: String as PropType<LoadMoreAlign>, default: "center" },
  },
  emits: {
    /** Load the next page (or retry the failed one). Never emitted while `busy`. */
    load: () => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const state = computed(() =>
      props.busy ? "loading" : props.error ? "error" : "idle",
    );
    const done = computed(
      () => props.remaining === 0 && !props.error && !props.busy,
    );
    const text = computed(() => {
      if (props.busy) return props.busyLabel ?? messages.value.showMoreBusy;
      if (props.error) return props.retryLabel ?? messages.value.showMoreRetry;
      const label = props.label ?? messages.value.showMore;
      const n = props.remaining;
      return n === null ? label : `${label} (${n})`;
    });
    const onClick = (): void => {
      if (!props.busy) emit("load");
    };
    return () => {
      const busy = props.busy ? "true" : undefined;
      return h(
        "sone-load-more",
        {
          "data-slot": "load-more",
          "data-align": props.align,
          "data-state": state.value,
          hidden: done.value || undefined,
        },
        [
          props.error
            ? h(
                "p",
                {
                  class: "error",
                  "data-slot": "load-more-error",
                  role: "alert",
                },
                props.error,
              )
            : null,
          h(
            SoneButton,
            {
              variant: "ghost",
              size: "sm",
              type: "button",
              class: "button",
              "aria-disabled": busy,
              "aria-busy": busy,
              onClick,
            },
            () => [
              props.busy
                ? h(SoneSpinner, {
                    size: 14,
                    label: null,
                    "data-icon": "inline-start",
                  })
                : null,
              text.value,
            ],
          ),
        ],
      );
    };
  },
});
