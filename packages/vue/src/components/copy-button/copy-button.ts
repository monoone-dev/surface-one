import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import {
  SoneButton,
  type ButtonSize,
  type ButtonVariant,
} from "../button/button";
import { SoneIcon } from "../icon/icon";

async function writeClipboard(value: string): Promise<void> {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard?.writeText) {
    await clipboard.writeText(value);
    return;
  }
  // No async Clipboard API (an insecure origin): the legacy copy command.
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("copy command refused");
}

/**
 * `<sone-copy-button>` — copies `value` on click, shows "Copied" for `resetAfter` ms
 * and announces it in a polite live region (as in @surface-one/angular).
 */
export const SoneCopyButton = defineComponent({
  name: "SoneCopyButton",
  props: {
    value: { type: String, required: true },
    label: { type: String as PropType<string | null>, default: null },
    copiedLabel: { type: String as PropType<string | null>, default: null },
    variant: { type: String as PropType<ButtonVariant>, default: "outline" },
    size: { type: String as PropType<ButtonSize | null>, default: null },
    iconOnly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    resetAfter: { type: Number, default: 1500 },
  },
  emits: {
    copied: (_value: string) => true,
    copyError: (_error: unknown) => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const isCopied = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const clearTimer = (): void => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };
    onBeforeUnmount(clearTimer);

    const label = computed(() => props.label ?? messages.value.copy);
    const copiedLabel = computed(
      () => props.copiedLabel ?? messages.value.copied,
    );
    const text = computed(() =>
      isCopied.value ? copiedLabel.value : label.value,
    );

    const copy = async (): Promise<void> => {
      const value = props.value;
      try {
        await writeClipboard(value);
      } catch (error) {
        clearTimer();
        isCopied.value = false;
        emit("copyError", error);
        return;
      }
      isCopied.value = true;
      emit("copied", value);
      clearTimer();
      timer = setTimeout(() => {
        timer = null;
        isCopied.value = false;
      }, props.resetAfter);
    };

    return () =>
      h(
        "sone-copy-button",
        {
          "data-slot": "copy-button",
          "data-state": isCopied.value ? "copied" : "idle",
        },
        [
          h(
            SoneButton,
            {
              type: "button",
              variant: props.variant,
              size: props.size ?? (props.iconOnly ? "icon-sm" : "sm"),
              disabled: props.disabled,
              "aria-label": props.iconOnly ? text.value : undefined,
              title: props.iconOnly ? text.value : undefined,
              onClick: copy,
            },
            () => [
              h(SoneIcon, {
                icon: isCopied.value ? "check" : "copy",
                inline: props.iconOnly ? null : "start",
              }),
              props.iconOnly ? null : text.value,
            ],
          ),
          h(
            "span",
            {
              class: "sr-only",
              "aria-live": "polite",
              "data-slot": "copy-button-status",
            },
            isCopied.value ? copiedLabel.value : "",
          ),
        ],
      );
  },
});
