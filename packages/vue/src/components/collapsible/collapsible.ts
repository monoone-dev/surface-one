import {
  defineComponent,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type PropType,
} from "vue";

import { useModel } from "../../utils/model";
import { asProp, definePart, flag, renderAs } from "../../utils/part";

interface CollapsibleContext {
  readonly expanded: () => boolean;
  readonly disabled: () => boolean;
  readonly contentId: () => string;
  setContentId(id: string | undefined): void;
  toggle(): void;
}

const COLLAPSIBLE: InjectionKey<CollapsibleContext> = Symbol("SoneCollapsible");

const state = (open: boolean) => (open ? "open" : "closed");

/** `[soneCollapsible]` — `v-model:expanded`. */
export const SoneCollapsible = defineComponent({
  name: "SoneCollapsible",
  props: {
    ...asProp,
    expanded: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: { "update:expanded": (_value: boolean) => true },
  setup(props, { slots, emit }) {
    const expanded = useModel(
      () => props.expanded,
      (v) => emit("update:expanded", v),
    );
    const fallbackId = `sone-collapsible-${useId()}-content`;
    const ownId = ref<string | undefined>();
    provide(COLLAPSIBLE, {
      expanded: () => expanded.value,
      disabled: () => props.disabled,
      contentId: () => ownId.value ?? fallbackId,
      setContentId: (id) => (ownId.value = id),
      toggle: () => {
        if (!props.disabled) expanded.set(!expanded.value);
      },
    });
    return () =>
      renderAs(
        props.as ?? "div",
        {
          "data-slot": "collapsible",
          "data-state": state(expanded.value),
          "data-disabled": flag(props.disabled),
        },
        slots,
      );
  },
});

/** `button[soneCollapsibleTrigger]` */
export const SoneCollapsibleTrigger = defineComponent({
  name: "SoneCollapsibleTrigger",
  props: {
    type: {
      type: String as PropType<"button" | "submit" | "reset">,
      default: "button",
    },
  },
  setup(props, { slots }) {
    const root = inject(COLLAPSIBLE, null);
    return () =>
      renderAs(
        "button",
        {
          class: "collapsible-trigger",
          "data-slot": "collapsible-trigger",
          type: props.type,
          onClick: () => root?.toggle(),
          ...(root && {
            "aria-controls": root.contentId(),
            "aria-expanded": String(root.expanded()),
            "data-state": state(root.expanded()),
            disabled: root.disabled(),
            "data-disabled": flag(root.disabled()),
          }),
        },
        slots,
      );
  },
});

/** `[soneCollapsibleContent]` — `hidden` while collapsed. */
export const SoneCollapsibleContent = defineComponent({
  name: "SoneCollapsibleContent",
  props: {
    ...asProp,
    id: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const root = inject(COLLAPSIBLE);
    if (!root)
      throw new Error("SoneCollapsibleContent needs a SoneCollapsible");
    watch(
      () => props.id,
      (id) => root.setContentId(id),
      { immediate: true },
    );
    onBeforeUnmount(() => root.setContentId(undefined));
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "collapsible-content",
          "data-slot": "collapsible-content",
          id: root.contentId(),
          "data-state": state(root.expanded()),
          "data-disabled": flag(root.disabled()),
          hidden: !root.expanded(),
        },
        slots,
      );
  },
});

export const SoneCollapsibleIcon = definePart({
  name: "SoneCollapsibleIcon",
  tag: "span",
  className: "collapsible-icon",
  slot: "collapsible-icon",
  static: { "aria-hidden": "true" },
});
