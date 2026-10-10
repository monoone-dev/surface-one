import { defineComponent, h, type PropType } from "vue";

import { asProp, definePart, renderAs } from "../../utils/part";

export type InputGroupAddonAlign =
  "inline-start" | "inline-end" | "block-start" | "block-end";

/** `[soneInputGroup]` — a control with addons (icons, text, buttons) inside one frame. */
export const SoneInputGroup = defineComponent({
  name: "SoneInputGroup",
  props: {
    ...asProp,
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Take the free space of a flex row (`flex: 1`, may shrink). */
    fill: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () => {
      const tag = props.as ?? "div";
      return renderAs(
        tag,
        {
          // A <form> keeps its implicit form role.
          role: tag === "form" ? undefined : "group",
          "data-slot": "input-group",
          "data-invalid": props.invalid ? "true" : undefined,
          "data-disabled": props.disabled ? "true" : undefined,
          "data-fill": props.fill ? "" : undefined,
        },
        slots,
      );
    };
  },
});

/** An addon; a click on its empty area focuses the group's control. */
export const SoneInputGroupAddon = defineComponent({
  name: "SoneInputGroupAddon",
  props: {
    ...asProp,
    align: {
      type: String as PropType<InputGroupAddonAlign>,
      default: "inline-start",
    },
  },
  setup(props, { slots }) {
    const focusControl = (e: MouseEvent): void => {
      const target = e.target as Element | null;
      if (target?.closest("button, a, input, select, textarea, [tabindex]"))
        return;
      const group = (e.currentTarget as HTMLElement).closest(
        '[data-slot="input-group"]',
      );
      group
        ?.querySelector<HTMLElement>(
          'input[data-slot="input-group-control"], textarea[data-slot="input-group-control"], ' +
            '[data-slot="input-group-control"] input',
        )
        ?.focus();
    };
    return () =>
      renderAs(
        props.as ?? "div",
        {
          role: "group",
          "data-slot": "input-group-addon",
          "data-align": props.align,
          onClick: focusControl,
        },
        slots,
      );
  },
});

function defineControl(name: string, tag: "input" | "textarea") {
  return defineComponent({
    name,
    props: {
      modelValue: {
        type: [String, Number] as PropType<string | number | null>,
        default: undefined,
      },
    },
    emits: { "update:modelValue": (_value: string) => true },
    setup(props, { emit }) {
      return () =>
        h(tag, {
          "data-slot": "input-group-control",
          ...(props.modelValue !== undefined && {
            value: props.modelValue ?? "",
          }),
          onInput: (e: Event) =>
            emit(
              "update:modelValue",
              (e.target as HTMLInputElement | HTMLTextAreaElement).value,
            ),
        });
    },
  });
}

/** The group's `<input>`, `v-model`-able; every other attribute falls through to it. */
export const SoneInputGroupInput = defineControl(
  "SoneInputGroupInput",
  "input",
);

/** The group's `<textarea>`, `v-model`-able. */
export const SoneInputGroupTextarea = defineControl(
  "SoneInputGroupTextarea",
  "textarea",
);

export const SoneInputGroupText = definePart({
  name: "SoneInputGroupText",
  tag: "span",
  slot: "input-group-text",
});
