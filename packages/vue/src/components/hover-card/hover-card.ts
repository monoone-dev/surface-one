import {
  Fragment,
  Teleport,
  defineComponent,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useId,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";

import {
  createHoverCardTrigger,
  type FloatingAlign,
  type FloatingSide,
  type HoverCardTrigger,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, toElement } from "../../utils/part";

interface HoverCardContext {
  readonly open: Ref<boolean>;
  readonly controller: HoverCardTrigger;
  readonly trigger: Ref<unknown>;
  readonly positioner: Ref<HTMLElement | null>;
  readonly contentId: string;
}

const HOVER_CARD: InjectionKey<HoverCardContext> = Symbol("SoneHoverCard");

/**
 * `<SoneHoverCard>` — the hover card root (spartan/ui HoverCard, Radix HoverCard): it
 * holds `v-model:open`, the delays (`openDelay` 700, `closeDelay` 300, `openOnFocus`)
 * and the placement (`side`, `align`, `offset`) for its `SoneHoverCardTrigger` and
 * `SoneHoverCardContent`.
 */
export const SoneHoverCard = defineComponent({
  name: "SoneHoverCard",
  props: {
    /** Shown or not — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** ms from hovering or focusing the trigger to opening. */
    openDelay: { type: Number, default: 700 },
    /** ms from leaving the trigger and the card to closing. */
    closeDelay: { type: Number, default: 300 },
    /** Open on keyboard focus too. */
    openOnFocus: { type: Boolean, default: true },
    /** The side of the trigger the card opens on; it flips when that side lacks room. */
    side: { type: String as PropType<FloatingSide>, default: "bottom" },
    /** Alignment along the trigger's edge (centred, as in shadcn/ui). */
    align: { type: String as PropType<FloatingAlign>, default: "center" },
    /** Gap between the trigger and the card, in px. */
    offset: { type: Number, default: 4 },
  },
  emits: { "update:open": (_open: boolean) => true },
  setup(props, { slots, emit, expose }) {
    const open = useModel(
      () => props.open,
      (value) => emit("update:open", value),
    );
    const trigger = ref<unknown>(null);
    const positioner = ref<HTMLElement | null>(null);
    const controller = createHoverCardTrigger({
      trigger: () => toElement(trigger.value),
      positioner: () => positioner.value,
      isOpen: () => open.value,
      setOpen: (value) => {
        if (open.value !== value) open.set(value);
      },
      side: () => props.side,
      align: () => props.align,
      offset: () => props.offset,
      keepOpenOnOutsideClick: () => false,
      openDelay: () => props.openDelay,
      closeDelay: () => props.closeDelay,
      openOnFocus: () => props.openOnFocus,
    });
    provide(HOVER_CARD, {
      open,
      controller,
      trigger,
      positioner,
      contentId: `sone-hover-card-${useId()}`,
    });

    onMounted(() => {
      if (open.value) controller.attached();
      watch(
        open,
        (isOpen) => (isOpen ? controller.attached() : controller.detached()),
        { flush: "post" },
      );
    });
    onBeforeUnmount(controller.detached);
    expose({
      /** Closes the card. */
      close: () => controller.close(false),
      /** Re-measures and re-places the open card (after its content changed size). */
      reposition: () => controller.reposition(),
    });

    return () => h(Fragment, slots.default?.() ?? []);
  },
});

/**
 * `[soneHoverCardTrigger]` — the link (an `<a>` unless `as` says otherwise) that
 * previews its `SoneHoverCard` on hover and focus; it is `aria-describedby` the card
 * while it shows. On a touch screen the first tap opens the card.
 */
export const SoneHoverCardTrigger = defineComponent({
  name: "SoneHoverCardTrigger",
  inheritAttrs: false,
  props: { ...asProp },
  setup(props, { attrs, slots }) {
    const card = inject(HOVER_CARD, null);
    if (!card) throw new Error("SoneHoverCardTrigger needs a SoneHoverCard");
    const { controller } = card;
    return () => {
      const isOpen = card.open.value;
      return renderAs(
        props.as ?? "a",
        mergeProps(attrs, {
          ref: card.trigger,
          "aria-describedby": isOpen ? card.contentId : undefined,
          "data-state": isOpen ? "open" : "closed",
          onPointerdown: controller.pointerDown,
          onPointerenter: controller.pointerEnter,
          onPointerleave: controller.pointerLeave,
          onFocusin: () => controller.focusIn(),
          onFocusout: controller.focusOut,
          onClick: controller.triggerClick,
          onKeydown: controller.triggerKeyDown,
        }),
        slots,
      );
    };
  },
});

/**
 * `[soneHoverCard]` / `[soneHoverCardContent]` — the card: rendered while open, in an
 * `.overlay-positioner` on `<body>` placed next to the trigger. No role: it describes
 * its trigger.
 */
export const SoneHoverCardContent = defineComponent({
  name: "SoneHoverCardContent",
  inheritAttrs: false,
  props: { ...asProp },
  setup(props, { attrs, slots }) {
    const card = inject(HOVER_CARD, null);
    if (!card) throw new Error("SoneHoverCardContent needs a SoneHoverCard");
    return () => {
      if (!card.open.value) return null;
      return h(
        Teleport,
        { to: "body" },
        h(
          "div",
          {
            ref: card.positioner,
            class: "overlay-positioner",
            "data-slot": "overlay-positioner",
          },
          renderAs(
            props.as ?? "div",
            mergeProps(
              {
                class: "popover hover-card",
                "data-slot": "hover-card",
                id: card.contentId,
                "data-state": "open",
              },
              attrs,
            ),
            slots,
          ),
        ),
      );
    };
  },
});
