import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowReactive,
  shallowRef,
  type InjectionKey,
  type PropType,
  type ShallowRef,
  type VNode,
} from "vue";

import {
  asProp,
  definePart,
  flag,
  renderAs,
  toElement,
} from "../../utils/part";
import { flatten, hasPart } from "../../utils/vnodes";

export type ChoiceOrientation = "vertical" | "horizontal";

interface ChoiceCardEntry {
  readonly el: ShallowRef<HTMLElement | null>;
  readonly selected: () => boolean;
}

interface ChoiceGroupContext {
  register(card: ChoiceCardEntry): void;
  unregister(card: ChoiceCardEntry): void;
  readonly tabStop: () => ChoiceCardEntry | undefined;
  /** The tab stop among the cards the group's own slot renders, known while rendering. */
  readonly renderedStop: () => VNode | undefined;
}

const CHOICE_GROUP: InjectionKey<ChoiceGroupContext> =
  Symbol("SoneChoiceGroup");

/** A boolean prop as written in a template: `selected`, `:selected="true"` or `selected=""`. */
const isOn = (value: unknown): boolean =>
  value === true || value === "" || value === "true";

// Read from the DOM at event time on purpose: owners bind the native `disabled`
// (or a disabled `<fieldset>` wraps the set).
function isDisabled(el: HTMLElement | null): boolean {
  return (
    !!el &&
    (el.matches(":disabled") || el.getAttribute("aria-disabled") === "true")
  );
}

const KEYS = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];

/**
 * `[soneChoiceGroup]` — a `radiogroup` of choice cards: one Tab stop (the checked
 * card), arrow keys move AND select, as a native radio group does.
 */
export const SoneChoiceGroup = defineComponent({
  name: "SoneChoiceGroup",
  props: {
    ...asProp,
    orientation: {
      type: String as PropType<ChoiceOrientation | null>,
      default: null,
    },
  },
  setup(props, { slots }) {
    const cards = shallowReactive<ChoiceCardEntry[]>([]);
    const inDomOrder = (): ChoiceCardEntry[] =>
      [...cards].sort((a, b) =>
        a.el.value && b.el.value
          ? a.el.value.compareDocumentPosition(b.el.value) &
            Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1
          : 0,
      );
    // The checked card, else the first ENABLED one — a disabled first card would
    // leave the group with no reachable Tab stop.
    const tabStop = computed(() => {
      const all = inDomOrder();
      return (
        all.find((c) => c.selected()) ??
        all.find((c) => !isDisabled(c.el.value)) ??
        all[0]
      );
    });
    let renderedStop: VNode | undefined;
    provide(CHOICE_GROUP, {
      register: (card) => void cards.push(card),
      unregister: (card) => {
        const i = cards.indexOf(card);
        if (i >= 0) cards.splice(i, 1);
      },
      tabStop: () => tabStop.value,
      renderedStop: () => renderedStop,
    });

    const onKeydown = (event: KeyboardEvent): void => {
      if (!KEYS.includes(event.key)) return;
      const enabled = inDomOrder().filter((c) => !isDisabled(c.el.value));
      if (enabled.length === 0) return;
      const current = enabled.findIndex(
        (c) => !!c.el.value?.contains(event.target as Node),
      );
      let next: number;
      switch (event.key) {
        case "Home":
          next = 0;
          break;
        case "End":
          next = enabled.length - 1;
          break;
        case "ArrowDown":
        case "ArrowRight":
          next = current < 0 ? 0 : (current + 1) % enabled.length;
          break;
        default:
          next =
            current < 0
              ? enabled.length - 1
              : (current - 1 + enabled.length) % enabled.length;
      }
      event.preventDefault();
      const target = enabled[next];
      target?.el.value?.focus();
      if (target && !target.selected()) target.el.value?.click();
    };

    return () => {
      const children = slots.default?.() ?? [];
      // The server renders each card before the next one registers, so a later
      // checked card is not known yet: pick the tab stop from the slot's vnodes.
      const own = flatten(children).filter((v) => v.type === SoneChoiceCard);
      renderedStop =
        own.find((v) => isOn(v.props?.["selected"])) ??
        own.find((v) => !isOn(v.props?.["disabled"])) ??
        own[0];
      return renderAs(
        props.as ?? "div",
        {
          role: "radiogroup",
          "data-slot": "choice-group",
          "aria-orientation": props.orientation ?? undefined,
          onKeydown,
        },
        { default: () => children },
      );
    };
  },
});

/**
 * `[soneChoiceCard]` — a large selectable card (a `<button>` by default). Inside a
 * `SoneChoiceGroup` it is a `radio`; alone it is a pressed / not-pressed toggle.
 */
export const SoneChoiceCard = defineComponent({
  name: "SoneChoiceCard",
  props: {
    ...asProp,
    selected: { type: Boolean, default: false },
    orientation: {
      type: String as PropType<ChoiceOrientation>,
      default: "vertical",
    },
  },
  setup(props, { slots, attrs }) {
    const group = inject(CHOICE_GROUP, null);
    const el = shallowRef<HTMLElement | null>(null);
    const entry: ChoiceCardEntry = { el, selected: () => props.selected };
    group?.register(entry);
    onBeforeUnmount(() => group?.unregister(entry));
    const instance = getCurrentInstance();
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));

    const isTabStop = (): boolean => {
      if (!group) return false;
      // Until mounted (server render, hydration) the group's render-time answer;
      // then the registered cards in DOM order, which also sees nested cards.
      const stop = mounted.value ? undefined : group.renderedStop();
      return stop ? stop === instance?.vnode : group.tabStop() === entry;
    };

    return () => {
      const role = group ? "radio" : (attrs["role"] as string | undefined);
      const isRadio = role === "radio";
      const children = slots.default?.() ?? [];
      return renderAs(
        props.as ?? "button",
        {
          ref: (r: unknown) => (el.value = toElement(r)),
          class: "choice-card",
          "data-slot": "choice-card",
          role,
          "data-state": props.selected ? "checked" : "unchecked",
          "data-orientation": props.orientation,
          "data-with-indicator": flag(
            hasPart(flatten(children), SoneChoiceCardIndicator),
          ),
          "aria-checked": isRadio ? String(props.selected) : undefined,
          "aria-pressed": isRadio ? undefined : String(props.selected),
          tabindex: group ? (isTabStop() ? 0 : -1) : undefined,
        },
        { default: () => children },
      );
    };
  },
});

export const SoneChoiceCardTitle = definePart({
  name: "SoneChoiceCardTitle",
  tag: "span",
  className: "choice-card-title",
  slot: "choice-card-title",
});

export const SoneChoiceCardDescription = definePart({
  name: "SoneChoiceCardDescription",
  tag: "span",
  className: "choice-card-description",
  slot: "choice-card-description",
});

/** The check / radio dot; a card with one makes room for it. */
export const SoneChoiceCardIndicator = defineComponent({
  name: "SoneChoiceCardIndicator",
  props: asProp,
  setup(props, { slots }) {
    return () =>
      renderAs(
        props.as ?? "span",
        {
          class: "choice-card-indicator",
          "data-slot": "choice-card-indicator",
          "aria-hidden": "true",
        },
        slots,
      );
  },
});
