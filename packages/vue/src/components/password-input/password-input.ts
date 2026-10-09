import { defineComponent, h, ref, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type PasswordAutocomplete = "current-password" | "new-password" | "off";

const EYE_OFF = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M1.8 12S6 4.8 12 4.8 22.2 12 22.2 12 18 19.2 12 19.2 1.8 12 1.8 12z",
      }),
      h("circle", { cx: "12", cy: "12", r: "3.1" }),
      h("path", { d: "M3.5 3.5l17 17" }),
    ],
  );

/**
 * `<sone-password-input>` — a password field with a show / hide toggle button
 * (`aria-pressed`); `v-model` (a string), `v-model:visible`.
 */
export const SonePasswordInput = defineComponent({
  name: "SonePasswordInput",
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: "" },
    visible: { type: Boolean, default: false },
    autocomplete: {
      type: String as PropType<PasswordAutocomplete>,
      default: "current-password",
    },
    placeholder: { type: String, default: "" },
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    ariaDescribedby: { type: String as PropType<string | null>, default: null },
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    /** The toggle's name (default: the "Show password" message). */
    toggleLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:visible": (_visible: boolean) => true,
  },
  setup(props, { emit, attrs, expose }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const visible = useModel(
      () => props.visible,
      (v) => emit("update:visible", v),
    );
    const field = ref<HTMLInputElement | null>(null);
    expose({ focus: () => field.value?.focus() });

    return () => {
      const { host, control } = splitAttrs(attrs);
      const label = props.toggleLabel ?? messages.value.showPassword;
      return h(
        "sone-password-input",
        {
          ...host,
          "data-slot": "password-input",
          "data-visible": visible.value ? "" : undefined,
        },
        h(
          SoneInputGroup,
          { invalid: props.invalid, disabled: props.disabled },
          () => [
            h("input", {
              ...control,
              ref: field,
              "data-slot": "input-group-control",
              spellcheck: "false",
              autocapitalize: "off",
              type: visible.value ? "text" : "password",
              value: value.value,
              placeholder: props.placeholder,
              disabled: props.disabled,
              readonly: props.readonly,
              id: props.inputId ?? undefined,
              name: props.name ?? undefined,
              autocomplete: props.autocomplete,
              "aria-label": props.ariaLabel ?? undefined,
              "aria-describedby": props.ariaDescribedby ?? undefined,
              "aria-invalid": props.invalid ? "true" : undefined,
              onInput: (e: Event) =>
                value.set((e.target as HTMLInputElement).value),
            }),
            h(SoneInputGroupAddon, { as: "span", align: "inline-end" }, () =>
              h(
                SoneButton,
                {
                  variant: "ghost",
                  size: "icon-xs",
                  type: "button",
                  "data-slot": "password-input-toggle",
                  disabled: props.disabled,
                  "aria-pressed": visible.value ? "true" : "false",
                  "aria-label": label,
                  title: label,
                  onClick: () => visible.set(!visible.value),
                },
                () =>
                  visible.value ? EYE_OFF() : h(SoneIcon, { icon: "eye" }),
              ),
            ),
          ],
        ),
      );
    };
  },
});
