import { defineComponent, h, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { SoneIcon, type ShellIcon } from "../icon/icon";
import {
  SoneToggleGroup,
  SoneToggleGroupItem,
  type ToggleOrientation,
  type ToggleSize,
  type ToggleVariant,
} from "../toggle-group/toggle-group";

export interface SegmentOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: ShellIcon;
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
}

/** `<sone-segmented>` — pick one of a few options; `v-model` (the option's value). */
export const SoneSegmented = defineComponent({
  name: "SoneSegmented",
  props: {
    options: {
      type: Array as PropType<readonly SegmentOption[]>,
      required: true,
    },
    modelValue: { type: String, default: "" },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    size: { type: String as PropType<ToggleSize>, default: "default" },
    variant: { type: String as PropType<ToggleVariant>, default: "outline" },
    orientation: {
      type: String as PropType<ToggleOrientation>,
      default: "horizontal",
    },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { emit }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    return () =>
      h(
        "sone-segmented",
        { "data-slot": "segmented" },
        h(
          SoneToggleGroup,
          {
            variant: props.variant,
            size: props.size,
            orientation: props.orientation,
            role: "group",
            "aria-label": props.ariaLabel ?? undefined,
          },
          () =>
            props.options.map((o) => {
              const glyphOnly = !!o.iconOnly && !!o.icon;
              return h(
                SoneToggleGroupItem,
                {
                  key: o.value,
                  type: "button",
                  pressed: value.value === o.value,
                  disabled: o.disabled ?? false,
                  "aria-label": glyphOnly ? o.label : undefined,
                  title: glyphOnly ? o.label : undefined,
                  onClick: () => value.set(o.value),
                },
                () => [
                  o.icon
                    ? h(SoneIcon, {
                        icon: o.icon,
                        inline: glyphOnly ? null : "start",
                      })
                    : null,
                  glyphOnly ? null : o.label,
                ],
              );
            }),
        ),
      );
  },
});
