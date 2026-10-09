import {
  computed,
  defineComponent,
  inject,
  provide,
  type InjectionKey,
  type PropType,
} from "vue";

import { asProp, renderAs, flag } from "../../utils/part";

export type ToggleVariant = "default" | "outline";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
export type TabsVariant = "default" | "line";

/** Arrow keys (and Home / End) move focus between the enabled items of a group. */
function moveFocus(
  host: HTMLElement,
  slot: string,
  vertical: boolean,
  e: KeyboardEvent,
): void {
  const prev = vertical ? "ArrowUp" : "ArrowLeft";
  const next = vertical ? "ArrowDown" : "ArrowRight";
  if (e.key !== prev && e.key !== next && e.key !== "Home" && e.key !== "End")
    return;
  const items = Array.from(
    host.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
  ).filter(
    (el) =>
      !(el as HTMLButtonElement).disabled &&
      el.getAttribute("aria-disabled") !== "true",
  );
  const at = items.indexOf(document.activeElement as HTMLElement);
  if (at < 0 || items.length < 2) return;
  const to =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? items.length - 1
        : (at + (e.key === next ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  items[to]?.focus();
}

interface ToggleGroupContext {
  readonly variant: () => ToggleVariant;
  readonly size: () => ToggleSize;
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

/** `[soneToggleGroup]` — a set of toggle buttons; arrow keys move between them. */
export const SoneToggleGroup = defineComponent({
  name: "SoneToggleGroup",
  props: {
    ...asProp,
    variant: variantProp,
    size: sizeProp,
    /** The gap between items in spacing units; 0 joins them into one bar. */
    spacing: { type: Number, default: 0 },
    orientation: orientationProp,
  },
  setup(props, { slots }) {
    provide(TOGGLE_GROUP, {
      variant: () => props.variant,
      size: () => props.size,
    });
    const onKeydown = (e: KeyboardEvent): void =>
      moveFocus(
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
          style: { "--toggle-group-spacing": props.spacing },
          onKeydown,
        },
        slots,
      );
  },
});

/** `[soneToggleGroupItem]` — takes its variant and size from the group. */
export const SoneToggleGroupItem = defineComponent({
  name: "SoneToggleGroupItem",
  props: { ...asProp, pressed: { type: Boolean, default: false } },
  setup(props, { slots }) {
    const group = inject(TOGGLE_GROUP, null);
    const variant = computed(() => group?.variant() ?? "default");
    const size = computed(() => group?.size() ?? "default");
    return () =>
      renderAs(
        props.as ?? "button",
        {
          class: "toggle",
          "data-slot": "toggle-group-item",
          "data-variant": variant.value,
          "data-size": size.value,
          "data-state": props.pressed ? "on" : "off",
          "aria-pressed": String(props.pressed),
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
  },
  setup(props, { slots, attrs }) {
    const onKeydown = (e: KeyboardEvent): void =>
      moveFocus(
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
