import {
  computed,
  defineComponent,
  h,
  mergeProps,
  ref,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type SearchFieldSize = "sm" | "default";

/**
 * `<sone-search-field>` — a search box on the Input Group: a leading search glyph, the
 * field (`role="searchbox"`) and, when `clearable` and not empty, a clear button at the
 * end. `v-model` (a string).
 *
 * Enter emits `submit` with the current text. Escape clears a `clearable` field that has
 * text; on an empty (or non-clearable) field it emits `escape` — close the panel that
 * holds it there. The exposed `focus()` focuses the field, `clear()` empties it.
 * `class` / `style` style the host; every other attribute and listener goes to the field.
 */
export const SoneSearchField = defineComponent({
  name: "SoneSearchField",
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: "" },
    size: { type: String as PropType<SearchFieldSize>, default: "default" },
    /** Default: the "Search" message. */
    placeholder: { type: String as PropType<string | null>, default: null },
    /** The field's accessible name (default: the "Search" message; `null` for none). */
    ariaLabel: { type: String as PropType<string | null>, default: undefined },
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    /** Shows a clear button while the field has text; Escape clears it too. */
    clearable: { type: Boolean, default: false },
    /** The clear button's accessible name (default: the "Clear search" message). */
    clearLabel: { type: String as PropType<string | null>, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    /** Enter was pressed; carries the current text. */
    submit: (_value: string) => true,
    /** Escape was pressed on an empty or non-clearable field. */
    escape: () => true,
  },
  setup(props, { emit, attrs, expose }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const field = ref<HTMLInputElement | null>(null);
    const focus = (): void => field.value?.focus();
    const clear = (): void => {
      value.set("");
      focus();
    };
    expose({ focus, clear });

    const showClear = computed(
      () => props.clearable && value.value !== "" && !props.disabled,
    );

    const onKeydown = (e: KeyboardEvent): void => {
      if (e.isComposing) return;
      if (e.key === "Enter") {
        e.preventDefault();
        emit("submit", value.value);
      } else if (e.key === "Escape") {
        if (props.clearable && value.value !== "") {
          e.preventDefault();
          e.stopPropagation();
          value.set("");
        } else {
          emit("escape");
        }
      }
    };

    return () => {
      const { host, control } = splitAttrs(attrs);
      const clearLabel = props.clearLabel ?? messages.value.clearSearch;
      const ariaLabel =
        props.ariaLabel === undefined ? messages.value.search : props.ariaLabel;
      return h(
        "sone-search-field",
        { ...host, "data-slot": "search-field", "data-size": props.size },
        h(SoneInputGroup, { disabled: props.disabled }, () => [
          h(SoneInputGroupAddon, { as: "span" }, () =>
            h(SoneIcon, { icon: "search" }),
          ),
          h(
            "input",
            mergeProps(control, {
              ref: field,
              "data-slot": "input-group-control",
              type: "text",
              role: "searchbox",
              enterkeyhint: "search",
              autocomplete: "off",
              spellcheck: "false",
              value: value.value,
              placeholder: props.placeholder ?? messages.value.search,
              disabled: props.disabled,
              id: props.inputId ?? undefined,
              name: props.name ?? undefined,
              "aria-label": ariaLabel ?? undefined,
              onInput: (e: Event) =>
                value.set((e.target as HTMLInputElement).value),
              onKeydown,
            }),
          ),
          showClear.value
            ? h(SoneInputGroupAddon, { as: "span", align: "inline-end" }, () =>
                h(
                  SoneButton,
                  {
                    variant: "ghost",
                    size: "icon-xs",
                    type: "button",
                    class: "search-field-clear",
                    "aria-label": clearLabel,
                    title: clearLabel,
                    onClick: clear,
                  },
                  () => h(SoneIcon, { icon: "close" }),
                ),
              )
            : null,
        ]),
      );
    };
  },
});
