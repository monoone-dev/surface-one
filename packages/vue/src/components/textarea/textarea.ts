import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  watch,
  type PropType,
} from "vue";

import { autosizeTextarea, textareaCount } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";

/**
 * `<SoneTextarea>` — the Vue twin of `textarea[soneTextarea]`: the native `<textarea>`
 * (`v-model`) in the skin's `--textarea-*` look, with `autosize` between `minRows` and
 * `maxRows`, `invalid` and `maxlength`. `showCount` adds the `sone-textarea-count`
 * after it: `12/200`, tinted as the limit nears, with a polite live region that says how
 * many characters are left once few are. Attributes and listeners go to the textarea.
 */
export const SoneTextarea = defineComponent({
  name: "SoneTextarea",
  inheritAttrs: false,
  props: {
    /** The text — `v-model`. */
    modelValue: { type: String, default: "" },
    /** Grow and shrink with the content (the native resize handle goes away). */
    autosize: { type: Boolean, default: false },
    /** The fewest rows an autosizing textarea shows. */
    minRows: { type: Number as PropType<number | null>, default: null },
    /** The most rows it grows to; it scrolls past them. */
    maxRows: { type: Number as PropType<number | null>, default: null },
    /** The native `maxlength`; the counter counts against it. */
    maxlength: { type: Number as PropType<number | null>, default: null },
    /** A failed check: `aria-invalid` and the destructive border and ring. */
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Show the character counter after the textarea. */
    showCount: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
  },
  setup(props, { attrs, emit, expose }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const el = ref<HTMLTextAreaElement | null>(null);
    const count = computed(() => textareaCount(value.value, props.maxlength));

    const fit = (): void => {
      const node = el.value;
      if (!node) return;
      if (!props.autosize) {
        node.style.height = "";
        node.style.overflowY = "";
        return;
      }
      autosizeTextarea(node, {
        minRows: props.minRows,
        maxRows: props.maxRows,
      });
    };
    onMounted(fit);
    onUpdated(fit);
    watch(
      () => [props.autosize, props.minRows, props.maxRows],
      () => void nextTick(fit),
    );
    expose({ focus: () => el.value?.focus() });

    return () => {
      const c = count.value;
      const textarea = h("textarea", {
        ...attrs,
        ref: el,
        "data-slot": "textarea",
        "data-autosize": props.autosize ? "" : undefined,
        value: value.value,
        maxlength: props.maxlength ?? undefined,
        disabled: props.disabled || undefined,
        "aria-invalid": props.invalid ? "true" : attrs["aria-invalid"],
        onInput: (e: Event) => {
          value.set((e.target as HTMLTextAreaElement).value);
          fit();
        },
      });
      if (!props.showCount) return textarea;
      const announcement =
        c.announce && c.remaining !== null
          ? messages.value.textareaRemaining(c.remaining)
          : "";
      return [
        textarea,
        h(
          "sone-textarea-count",
          {
            class: "textarea-count",
            "data-slot": "textarea-count",
            "data-state": c.state,
          },
          [
            h("span", { "aria-hidden": "true" }, c.text),
            h(
              "span",
              { class: "sr-only", "aria-live": "polite" },
              announcement,
            ),
          ],
        ),
      ];
    };
  },
});
