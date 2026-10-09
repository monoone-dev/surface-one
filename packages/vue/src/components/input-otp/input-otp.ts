import { computed, defineComponent, h, ref, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";

/** Digits only — the default `pattern`. */
export const SONE_OTP_DIGITS = "^\\d+$";
/** Latin letters and digits. */
export const SONE_OTP_ALPHANUMERIC = "^[a-zA-Z0-9]+$";

const NUMERIC = ["^\\d+$", "^[0-9]+$", "^\\d*$", "^[0-9]*$"];

const SEPARATOR = () =>
  h("svg", { viewBox: "0 0 16 16", fill: "none" }, [
    h("path", {
      d: "M4 8h8",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
    }),
  ]);

/**
 * `<sone-input-otp>` — a one-time code; `v-model` (a string). One real
 * `<input autocomplete="one-time-code">` lies transparent over the slots, as in
 * @surface-one/angular, so paste, autofill and screen readers just work.
 */
export const SoneInputOtp = defineComponent({
  name: "SoneInputOtp",
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: "" },
    length: { type: Number, default: 6 },
    pattern: {
      type: [String, RegExp] as PropType<string | RegExp>,
      default: SONE_OTP_DIGITS,
    },
    groups: {
      type: Array as PropType<readonly number[] | null>,
      default: null,
    },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** Extra ids for `aria-describedby` on the real input. */
    ariaDescribedby: { type: String as PropType<string | null>, default: null },
    inputId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    complete: (_code: string) => true,
  },
  setup(props, { emit, attrs, expose }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const focused = ref(false);
    const field = ref<HTMLInputElement | null>(null);

    const size = computed(() => {
      const n = Math.trunc(props.length);
      return Number.isFinite(n) && n > 0 ? n : 6;
    });
    const charTest = computed(() => {
      const p = props.pattern;
      const re = typeof p === "string" ? new RegExp(p) : p;
      return new RegExp(re.source, re.flags.replace(/[gy]/g, ""));
    });
    const layout = computed(() => {
      const n = size.value;
      const g = (props.groups ?? []).map((x) => Math.trunc(x));
      const ok =
        g.length > 0 &&
        g.every((x) => x > 0) &&
        g.reduce((a, b) => a + b) === n;
      let at = 0;
      return (ok ? g : [n]).map((count) =>
        Array.from({ length: count }, () => at++),
      );
    });
    const clean = (raw: string): string =>
      Array.from(raw)
        .filter((ch) => charTest.value.test(ch))
        .slice(0, size.value)
        .join("");

    const caretToEnd = (): void => {
      const el = field.value;
      if (!el) return;
      const end = el.value.length;
      if (el.selectionStart !== end || el.selectionEnd !== end)
        el.setSelectionRange(end, end);
    };
    const onInput = (e: Event): void => {
      const el = e.target as HTMLInputElement;
      const v = clean(el.value);
      if (el.value !== v) el.value = v;
      value.set(v);
      caretToEnd();
      if (v.length === size.value) emit("complete", v);
    };
    expose({ focus: () => field.value?.focus() });

    return () => {
      const { host, control } = splitAttrs(attrs);
      const chars = Array.from(clean(value.value));
      const active = Math.min(chars.length, size.value - 1);
      const groups = layout.value;
      return h(
        "sone-input-otp",
        {
          ...host,
          "data-slot": "input-otp",
          "data-disabled": props.disabled ? "" : undefined,
          "data-invalid": props.invalid ? "" : undefined,
        },
        [
          h("input", {
            ...control,
            ref: field,
            class: "otp-input",
            "data-slot": "input-otp-input",
            type: "text",
            autocomplete: "one-time-code",
            spellcheck: "false",
            autocapitalize: "off",
            value: chars.join(""),
            disabled: props.disabled,
            id: props.inputId ?? undefined,
            name: props.name ?? undefined,
            maxlength: size.value,
            inputmode: NUMERIC.includes(charTest.value.source)
              ? "numeric"
              : "text",
            "aria-label": props.ariaLabel ?? undefined,
            "aria-describedby": props.ariaDescribedby ?? undefined,
            "aria-invalid": props.invalid ? "true" : undefined,
            onInput,
            onFocus: () => {
              focused.value = true;
              caretToEnd();
            },
            onBlur: () => (focused.value = false),
            onClick: caretToEnd,
            onSelect: caretToEnd,
            onKeyup: caretToEnd,
          }),
          h(
            "div",
            { class: "otp-slots", "aria-hidden": "true" },
            groups.flatMap((group, gi) => [
              h(
                "div",
                {
                  key: `g${gi}`,
                  class: "otp-group",
                  "data-slot": "input-otp-group",
                },
                group.map((slot) => {
                  const isActive = focused.value && slot === active;
                  return h(
                    "div",
                    {
                      key: slot,
                      class: "otp-slot",
                      "data-slot": "input-otp-slot",
                      "data-active": isActive ? "" : undefined,
                      "data-filled": chars[slot] ? "" : undefined,
                    },
                    [
                      chars[slot] ?? "",
                      isActive && !chars[slot]
                        ? h("span", { class: "otp-caret" })
                        : null,
                    ],
                  );
                }),
              ),
              gi < groups.length - 1
                ? h(
                    "div",
                    {
                      key: `s${gi}`,
                      class: "otp-separator",
                      "data-slot": "input-otp-separator",
                    },
                    [SEPARATOR()],
                  )
                : null,
            ]),
          ),
        ],
      );
    };
  },
});
