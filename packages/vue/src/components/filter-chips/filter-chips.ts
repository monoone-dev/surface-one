import { defineComponent, h, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { SoneBadge, type BadgeVariant } from "../badge/badge";
import {
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../toggle-group/toggle-group";

export type FilterChipTone =
  "default" | "danger" | "warning" | "success" | "accent";

export interface FilterChipOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  /** Shown in a badge after the label; leave it out (or `null`) for none. */
  readonly count?: number | null;
  /** Tints the count badge (`danger` for errors, `warning` for warnings). */
  readonly tone?: FilterChipTone;
  readonly disabled?: boolean;
}

export type FilterChipsVariant = "toggle" | "tabs";
export type FilterChipsSize = "sm" | "default";

const TONE_BADGE: Record<FilterChipTone, BadgeVariant> = {
  default: "secondary",
  danger: "destructive",
  warning: "warning",
  success: "success",
  accent: "accent",
};

/**
 * `<sone-filter-chips>` — one-of-many filter buttons rendered from data, with an optional
 * count badge per option. `variant="toggle"` is an outline Toggle Group of separate chips;
 * `variant="tabs"` is a Tabs list. Either way each option is a toggle button
 * (`aria-pressed`) in a labelled `role="group"` — a filter, not a tab panel — with
 * arrow-key, Home and End navigation. `v-model` binds the selected option's value.
 */
export const SoneFilterChips = defineComponent({
  name: "SoneFilterChips",
  props: {
    options: {
      type: Array as PropType<readonly FilterChipOption[]>,
      required: true,
    },
    /** The selected option's value (`v-model`). */
    modelValue: { type: String as PropType<string | null>, default: null },
    variant: {
      type: String as PropType<FilterChipsVariant>,
      default: "toggle",
    },
    /** The chip size of `variant="toggle"` (the tabs list has one size). */
    size: { type: String as PropType<FilterChipsSize>, default: "sm" },
    /** Names the group ("Filter by level"). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { emit }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v as string),
    );
    const select = (option: FilterChipOption): void => {
      if (!option.disabled) value.set(option.value);
    };
    const label = (option: FilterChipOption) => [
      option.label,
      option.count != null
        ? h(
            SoneBadge,
            { class: "count", variant: TONE_BADGE[option.tone ?? "default"] },
            () => String(option.count),
          )
        : null,
    ];

    return () => {
      const tabs = props.variant === "tabs";
      const group = {
        role: "group",
        class: "list",
        "aria-label": props.ariaLabel ?? undefined,
      };
      const items = () =>
        props.options.map((option) =>
          h(
            tabs ? SoneTabsTrigger : SoneToggleGroupItem,
            {
              key: option.value,
              type: "button",
              ...(tabs
                ? { active: value.value === option.value }
                : { pressed: value.value === option.value }),
              disabled: !!option.disabled,
              onClick: () => select(option),
            },
            () => label(option),
          ),
        );
      return h(
        "sone-filter-chips",
        { "data-slot": "filter-chips", "data-variant": props.variant },
        tabs
          ? h(SoneTabsList, group, items)
          : h(
              SoneToggleGroup,
              {
                ...group,
                variant: "outline",
                spacing: 2,
                size: props.size === "sm" ? "sm" : "default",
              },
              items,
            ),
      );
    };
  },
});
