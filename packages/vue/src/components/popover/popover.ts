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
  type VNode,
} from "vue";

import {
  createPopoverTrigger,
  type FloatingAlign,
  type FloatingSide,
  type PopoverTrigger,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, definePart, renderAs, toElement } from "../../utils/part";

interface PopoverContext {
  readonly open: Ref<boolean>;
  readonly controller: PopoverTrigger;
  readonly trigger: Ref<unknown>;
  readonly positioner: Ref<HTMLElement | null>;
  readonly contentId: string;
  close(): void;
}

const POPOVER: InjectionKey<PopoverContext> = Symbol("SonePopover");

const roleProp = {
  /** `dialog` by default; `null` (or another role) when the panel is not one. */
  role: { type: String as PropType<string | null>, default: "dialog" },
} as const;

/** The `.popover` surface — the markup of `[sonePopover]`. */
function surface(
  tag: Parameters<typeof renderAs>[0],
  role: string | null,
  attrs: Record<string, unknown>,
  slots: Parameters<typeof renderAs>[2],
) {
  return renderAs(
    tag,
    mergeProps(
      { class: "popover", "data-slot": "popover", role: role ?? undefined },
      attrs,
    ),
    slots,
  );
}

/** True when `nodes` hold a trigger or a content part (directly or in a fragment). */
function hasParts(nodes: readonly unknown[]): boolean {
  return nodes.some((node) => {
    const vnode = node as VNode;
    if (
      vnode?.type === SonePopoverTrigger ||
      vnode?.type === SonePopoverContent
    )
      return true;
    return (
      vnode?.type === Fragment &&
      Array.isArray(vnode.children) &&
      hasParts(vnode.children)
    );
  });
}

/**
 * `<SonePopover>` — the popover root (spartan/ui Popover): it holds `v-model:open` and
 * the placement (`side`, `align`, `offset`, `keepOpenOnOutsideClick`) for its
 * `SonePopoverTrigger` and `SonePopoverContent`. Without those parts (and without
 * `open`) it is the bare `.popover` surface, as it used to be.
 */
export const SonePopover = defineComponent({
  name: "SonePopover",
  inheritAttrs: false,
  props: {
    ...asProp,
    ...roleProp,
    /** Shown or not — `v-model:open`. */
    open: { type: Boolean, default: undefined },
    /** The side of the trigger the panel opens on; it flips when that side lacks room. */
    side: { type: String as PropType<FloatingSide>, default: "bottom" },
    /** Alignment along the trigger's edge. */
    align: { type: String as PropType<FloatingAlign>, default: "start" },
    /** Gap between the trigger and the panel, in px. */
    offset: { type: Number, default: 4 },
    /** Keep the panel open on a click outside it (Escape still closes it). */
    keepOpenOnOutsideClick: { type: Boolean, default: false },
  },
  emits: { "update:open": (_open: boolean) => true },
  setup(props, { attrs, slots, emit, expose }) {
    const open = useModel(
      () => props.open ?? false,
      (value) => emit("update:open", value),
    );
    const trigger = ref<unknown>(null);
    const positioner = ref<HTMLElement | null>(null);
    const controller = createPopoverTrigger({
      trigger: () => toElement(trigger.value),
      positioner: () => positioner.value,
      isOpen: () => open.value,
      setOpen: (value) => {
        if (open.value !== value) open.set(value);
      },
      side: () => props.side,
      align: () => props.align,
      offset: () => props.offset,
      keepOpenOnOutsideClick: () => props.keepOpenOnOutsideClick,
    });
    const close = (): void => controller.close(true);
    provide(POPOVER, {
      open,
      controller,
      trigger,
      positioner,
      contentId: `sone-popover-${useId()}`,
      close,
    });

    onMounted(() => {
      if (open.value) controller.attached();
      // After the DOM update: the positioner is on <body> (or gone).
      watch(
        open,
        (isOpen) => (isOpen ? controller.attached() : controller.detached()),
        { flush: "post" },
      );
    });
    onBeforeUnmount(controller.detached);
    expose({
      /** Closes the popover; with `restoreFocus`, focus goes back to the trigger. */
      close: (restoreFocus?: boolean) => controller.close(restoreFocus),
      /** Re-measures and re-places the open panel (after its content changed size). */
      reposition: () => controller.reposition(),
    });

    return () => {
      const children = slots.default?.({ close }) ?? [];
      if (props.open !== undefined || hasParts(children))
        return h(Fragment, children);
      return surface(props.as ?? "div", props.role, attrs, {
        default: () => children,
      });
    };
  },
});

/**
 * `[sonePopoverTrigger]` — the button that opens its `SonePopover` (a `<button>` unless
 * `as` says otherwise): `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
 * A click toggles; Escape closes and Tab moves into the open panel.
 */
export const SonePopoverTrigger = defineComponent({
  name: "SonePopoverTrigger",
  inheritAttrs: false,
  props: { ...asProp },
  setup(props, { attrs, slots }) {
    const popover = inject(POPOVER, null);
    if (!popover) throw new Error("SonePopoverTrigger needs a SonePopover");
    const { controller } = popover;
    return () => {
      const tag = props.as ?? "button";
      const isOpen = popover.open.value;
      return renderAs(
        tag,
        mergeProps(tag === "button" ? { type: "button" } : {}, attrs, {
          ref: popover.trigger,
          "aria-haspopup": "dialog",
          "aria-expanded": isOpen ? "true" : "false",
          "aria-controls": isOpen ? popover.contentId : undefined,
          "data-state": isOpen ? "open" : "closed",
          onClick: () => controller.triggerClick(),
          onKeydown: controller.triggerKeyDown,
        }),
        slots,
      );
    };
  },
});

/**
 * `[sonePopover]` / `[sonePopoverContent]` — the panel. Inside a `SonePopover` it is
 * rendered while open, in an `.overlay-positioner` on `<body>` placed next to the
 * trigger; its slot gets `close` (focus goes back to the trigger). Alone it is the bare
 * `.popover` surface. `role="dialog"` by default: name it with `aria-labelledby`.
 */
export const SonePopoverContent = defineComponent({
  name: "SonePopoverContent",
  inheritAttrs: false,
  props: { ...asProp, ...roleProp },
  setup(props, { attrs, slots }) {
    const popover = inject(POPOVER, null);
    return () => {
      const tag = props.as ?? "div";
      if (!popover)
        return surface(tag, props.role, attrs, {
          default: () => slots.default?.({ close: () => undefined }) ?? [],
        });
      if (!popover.open.value) return null;
      return h(
        Teleport,
        { to: "body" },
        h(
          "div",
          {
            ref: popover.positioner,
            class: "overlay-positioner",
            "data-slot": "overlay-positioner",
          },
          surface(
            tag,
            props.role,
            mergeProps(attrs, { id: popover.contentId, "data-state": "open" }),
            { default: () => slots.default?.({ close: popover.close }) ?? [] },
          ),
        ),
      );
    };
  },
});

/** `[sonePopoverHeader]` — the title and description at the top of a popover. */
export const SonePopoverHeader = definePart({
  name: "SonePopoverHeader",
  tag: "div",
  className: "popover-header",
  slot: "popover-header",
});

/** `[sonePopoverTitle]` — the popover's title; give it an `id` the popover names itself by. */
export const SonePopoverTitle = definePart({
  name: "SonePopoverTitle",
  tag: "p",
  className: "popover-title",
  slot: "popover-title",
});

/** `[sonePopoverDescription]` — a secondary line under the title. */
export const SonePopoverDescription = definePart({
  name: "SonePopoverDescription",
  tag: "p",
  className: "popover-description",
  slot: "popover-description",
});
