import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  useId,
  type InjectionKey,
  type PropType,
} from "vue";

import {
  isAccordionItemOpen,
  moveGroupFocus,
  toggleAccordionValue,
  type AccordionType,
  type AccordionValue,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, definePart, flag, renderAs } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type { AccordionType, AccordionValue };

interface AccordionContext {
  readonly disabled: () => boolean;
  isOpen(item: string): boolean;
  toggle(item: string): void;
}

interface AccordionItemContext {
  readonly open: () => boolean;
  readonly disabled: () => boolean;
  readonly triggerId: string;
  readonly contentId: string;
  toggle(): void;
}

const ACCORDION: InjectionKey<AccordionContext> = Symbol("SoneAccordion");
const ITEM: InjectionKey<AccordionItemContext> = Symbol("SoneAccordionItem");

const state = (open: boolean) => (open ? "open" : "closed");

function useItem(part: string): AccordionItemContext {
  const item = inject(ITEM, null);
  if (!item) throw new Error(`${part} needs a SoneAccordionItem`);
  return item;
}

/**
 * `[soneAccordion]` — headed sections that show and hide their content (WAI-ARIA
 * Accordion). `type`, `collapsible`, `v-model` with the open item values.
 */
export const SoneAccordion = defineComponent({
  name: "SoneAccordion",
  props: {
    ...asProp,
    modelValue: {
      type: [String, Array] as PropType<AccordionValue>,
      default: null,
    },
    type: { type: String as PropType<AccordionType>, default: "single" },
    collapsible: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: { "update:modelValue": (_value: AccordionValue) => true },
  setup(props, { slots, emit }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    provide(ACCORDION, {
      disabled: () => props.disabled,
      isOpen: (item) => isAccordionItemOpen(value.value, item),
      toggle: (item) => {
        const next = toggleAccordionValue(
          value.value,
          item,
          props.type,
          props.collapsible,
        );
        if (next !== value.value) value.set(next);
      },
    });
    const onKeydown = (event: KeyboardEvent): void => {
      const el = event.currentTarget as HTMLElement;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-slot="accordion"]') !== el) return;
      moveGroupFocus(el, "accordion-trigger", true, event);
    };
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "accordion",
          "data-slot": "accordion",
          "data-orientation": "vertical",
          "data-disabled": flag(props.disabled),
          onKeydown,
        },
        slots,
      );
  },
});

/** `[soneAccordionItem]` — one section: a trigger and its content. */
export const SoneAccordionItem = defineComponent({
  name: "SoneAccordionItem",
  props: {
    ...asProp,
    /** Names the item in the accordion's value; unique by default. */
    value: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const root = inject(ACCORDION, null);
    if (!root) throw new Error("SoneAccordionItem needs a SoneAccordion");
    const uid = `sone-accordion-item-${useId()}`;
    const itemValue = computed(() => props.value ?? uid);
    const open = computed(() => root.isOpen(itemValue.value));
    const disabled = computed(() => props.disabled || root.disabled());
    provide(ITEM, {
      open: () => open.value,
      disabled: () => disabled.value,
      triggerId: `${uid}-trigger`,
      contentId: `${uid}-content`,
      toggle: () => {
        if (!disabled.value) root.toggle(itemValue.value);
      },
    });
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "accordion-item",
          "data-slot": "accordion-item",
          "data-state": state(open.value),
          "data-disabled": flag(disabled.value),
        },
        slots,
      );
  },
});

/**
 * `<sone-accordion-trigger>` — the item's heading (`level`) with the button that opens
 * and closes it. The `#icon` slot (or a `SoneAccordionIcon`) replaces the chevron.
 */
export const SoneAccordionTrigger = defineComponent({
  name: "SoneAccordionTrigger",
  props: {
    /** The heading level of the trigger (`aria-level`). */
    level: { type: Number, default: 3 },
  },
  setup(props, { slots }) {
    const item = useItem("SoneAccordionTrigger");
    return () => {
      const open = item.open();
      const disabled = item.disabled();
      return h(
        "sone-accordion-trigger",
        {
          class: "accordion-header",
          "data-slot": "accordion-header",
          role: "heading",
          "aria-level": String(props.level),
          "data-state": state(open),
        },
        h(
          "button",
          {
            type: "button",
            class: "accordion-trigger",
            "data-slot": "accordion-trigger",
            id: item.triggerId,
            "aria-controls": item.contentId,
            "aria-expanded": String(open),
            "data-state": state(open),
            "data-disabled": flag(disabled),
            disabled,
            onClick: item.toggle,
          },
          [
            h("span", { class: "accordion-trigger-label" }, slots.default?.()),
            slots["icon"]?.() ??
              h(
                "span",
                {
                  class: "accordion-icon",
                  "data-slot": "accordion-trigger-icon",
                  "aria-hidden": "true",
                },
                h(SoneIcon, { icon: "chevron-down" }),
              ),
          ],
        ),
      );
    };
  },
});

/** `[soneAccordionContent]` — the region the trigger shows, hidden while closed. */
export const SoneAccordionContent = defineComponent({
  name: "SoneAccordionContent",
  props: { ...asProp },
  setup(props, { slots }) {
    const item = useItem("SoneAccordionContent");
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "accordion-content",
          "data-slot": "accordion-content",
          role: "region",
          id: item.contentId,
          "aria-labelledby": item.triggerId,
          "data-state": state(item.open()),
          "data-disabled": flag(item.disabled()),
          hidden: !item.open(),
        },
        slots,
      );
  },
});

/** `[soneAccordionIcon]` — your own icon in place of the chevron (the trigger's `#icon` slot). */
export const SoneAccordionIcon = definePart({
  name: "SoneAccordionIcon",
  tag: "span",
  className: "accordion-icon",
  slot: "accordion-trigger-icon",
  static: { "aria-hidden": "true" },
});
