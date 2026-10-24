import {
  computed,
  defineComponent,
  inject,
  provide,
  ref,
  type InjectionKey,
  type PropType,
} from "vue";

import { moveGroupFocus } from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, flag } from "../../utils/part";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
export type TabsVariant = "default" | "line";
/** `single`: one item pressed at a time (pressing it again clears it); `multiple`: any number. */
export type ToggleGroupType = "single" | "multiple";
/** The group's value: the pressed item's value (`single`) or the pressed values (`multiple`). */
export type ToggleGroupValue = string | readonly string[] | null;

const toList = (v: ToggleGroupValue | undefined): readonly string[] =>
  v == null ? [] : typeof v === "string" ? [v] : v;

interface ToggleGroupContext {
  readonly variant: () => ToggleVariant;
  readonly size: () => ToggleSize;
  readonly type: () => ToggleGroupType | null;
  readonly disabled: () => boolean;
  readonly tabStop: () => string | null;
  readonly isOn: (value: string) => boolean;
  readonly toggle: (value: string) => void;
  readonly focused: (value: string) => void;
}

const TOGGLE_GROUP: InjectionKey<ToggleGroupContext> =
  Symbol("SoneToggleGroup");

const variantProp = {
  type: String as PropType<ToggleVariant>,
  default: "default",
} as const;
const sizeProp = {
  type: String as PropType<ToggleSize>,
  default: "default",
} as const;
const orientationProp = {
  type: String as PropType<ToggleOrientation>,
  default: "horizontal",
} as const;

/**
 * `[soneToggleGroup]` — a set of toggle buttons; arrow keys move between them. Without
 * `type` each item takes its own `pressed`; with `type="single"` / `"multiple"` the group
 * presses the items that carry a `value` (`v-model`) and is one Tab stop (roving tabindex).
 */
export const SoneToggleGroup = defineComponent({
  name: "SoneToggleGroup",
  props: {
    ...asProp,
    variant: variantProp,
    size: sizeProp,
    /** The gap between items in spacing units; 0 joins them into one bar. */
    spacing: { type: Number, default: 0 },
    orientation: orientationProp,
    /** Fill the container's width on one row, every item an equal share. */
    stretch: { type: Boolean, default: false },
    /** The group presses its items (`single` / `multiple`); unset, each item's `pressed` decides. */
    type: {
      type: String as PropType<ToggleGroupType | null>,
      default: null,
    },
    /** The pressed value (`single`, `null` for none) or values (`multiple`): `v-model`. */
    modelValue: {
      type: [String, Array] as PropType<ToggleGroupValue>,
      default: null,
    },
    /** Every item disabled. */
    disabled: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_value: ToggleGroupValue) => true,
  },
  setup(props, { slots, emit, attrs }) {
    const value = useModel<ToggleGroupValue>(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const focusedValue = ref<string | null>(null);
    const isOn = (v: string): boolean => toList(value.value).includes(v);
    provide(TOGGLE_GROUP, {
      variant: () => props.variant,
      size: () => props.size,
      type: () => props.type,
      disabled: () => props.disabled,
      tabStop: () =>
        props.type
          ? (focusedValue.value ?? toList(value.value)[0] ?? null)
          : null,
      isOn,
      toggle: (v) => {
        if (props.disabled) return;
        const on = isOn(v);
        if (props.type === "multiple") {
          const list = toList(value.value);
          value.set(on ? list.filter((x) => x !== v) : [...list, v]);
        } else {
          value.set(on ? null : v);
        }
      },
      focused: (v) => (focusedValue.value = v),
    });
    const onKeydown = (e: KeyboardEvent): void =>
      moveGroupFocus(
        e.currentTarget as HTMLElement,
        "toggle-group-item",
        props.orientation === "vertical",
        e,
      );
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "toggle-group",
          "data-slot": "toggle-group",
          "data-variant": props.variant,
          "data-size": props.size,
          "data-spacing": props.spacing,
          "data-orientation": props.orientation,
          "data-stretch": flag(props.stretch),
          role: attrs["role"] ?? (props.type ? "group" : undefined),
          style: { "--toggle-group-spacing": props.spacing },
          onKeydown,
        },
        slots,
      );
  },
});

/**
 * `[soneToggleGroupItem]` — takes its variant and size from the group, and its pressed
 * state too when it has a `value` in a group with `type`.
 */
export const SoneToggleGroupItem = defineComponent({
  name: "SoneToggleGroupItem",
  props: {
    ...asProp,
    pressed: { type: Boolean, default: false },
    /** Its value in a group with `type`: the group presses it. */
    value: { type: String as PropType<string | null>, default: null },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const group = inject(TOGGLE_GROUP, null);
    const variant = computed(() => group?.variant() ?? "default");
    const size = computed(() => group?.size() ?? "default");
    const grouped = computed(() => !!group?.type() && props.value !== null);
    const on = computed(() =>
      grouped.value && group ? group.isOn(props.value!) : props.pressed,
    );
    const disabled = computed(
      () => props.disabled || (group?.disabled() ?? false),
    );
    const tabindex = computed(() => {
      const stop = group?.tabStop() ?? null;
      return stop === null ? undefined : props.value === stop ? 0 : -1;
    });
    return () =>
      renderAs(
        props.as ?? "button",
        {
          class: "toggle",
          "data-slot": "toggle-group-item",
          "data-variant": variant.value,
          "data-size": size.value,
          "data-state": on.value ? "on" : "off",
          "aria-pressed": String(on.value),
          disabled: disabled.value || undefined,
          tabindex: tabindex.value,
          onClick: () => {
            if (grouped.value && !disabled.value) group?.toggle(props.value!);
          },
          onFocus: () => {
            if (props.value !== null) group?.focused(props.value);
          },
        },
        slots,
      );
  },
});

/** `[soneToggle]` — a single two-state button. */
export const SoneToggle = defineComponent({
  name: "SoneToggle",
  props: {
    ...asProp,
    variant: variantProp,
    size: sizeProp,
    pressed: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    return () =>
      renderAs(
        props.as ?? "button",
        {
          class: "toggle",
          "data-slot": "toggle",
          "data-variant": props.variant,
          "data-size": props.size,
          "data-state": props.pressed ? "on" : "off",
          "aria-pressed": String(props.pressed),
        },
        slots,
      );
  },
});

/**
 * `[soneTabsList]` — give it `role="tablist"` (and its triggers `role="tab"`) for real
 * tabs; without the roles it is a row of pressed / not-pressed buttons.
 */
export const SoneTabsList = defineComponent({
  name: "SoneTabsList",
  props: {
    ...asProp,
    variant: { type: String as PropType<TabsVariant>, default: "default" },
    orientation: orientationProp,
    /** Fill the container's width, every trigger an equal share. */
    stretch: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    const onKeydown = (e: KeyboardEvent): void =>
      moveGroupFocus(
        e.currentTarget as HTMLElement,
        "tabs-trigger",
        props.orientation === "vertical",
        e,
      );
    return () => {
      const isTablist = attrs["role"] === "tablist";
      return renderAs(
        props.as ?? "div",
        {
          class: "tabs-list",
          "data-slot": "tabs-list",
          "data-variant": props.variant,
          "data-orientation": props.orientation,
          "data-stretch": flag(props.stretch),
          "aria-orientation":
            isTablist && props.orientation === "vertical"
              ? "vertical"
              : undefined,
          onKeydown,
        },
        slots,
      );
    };
  },
});

export const SoneTabsTrigger = defineComponent({
  name: "SoneTabsTrigger",
  props: {
    ...asProp,
    active: { type: Boolean, default: false },
    /** An icon-only trigger. */
    icon: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const isTab = attrs["role"] === "tab";
      return renderAs(
        props.as ?? "button",
        {
          class: "tabs-trigger",
          "data-slot": "tabs-trigger",
          "data-state": props.active ? "active" : "inactive",
          "aria-selected": isTab ? String(props.active) : undefined,
          // A tablist is one Tab stop (WAI-ARIA Tabs): the active tab; arrows move between tabs.
          tabindex: isTab ? (props.active ? 0 : -1) : undefined,
          "aria-pressed": isTab ? undefined : String(props.active),
          "data-icon": flag(props.icon),
        },
        slots,
      );
    };
  },
});
