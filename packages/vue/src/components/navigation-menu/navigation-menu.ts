import {
  computed,
  defineComponent,
  inject,
  mergeProps,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  useId,
  watch,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";

import { createNavigationMenu, type NavigationMenu } from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, definePart, renderAs, toElement } from "../../utils/part";

interface RootContext {
  readonly value: Ref<string | null>;
  readonly controller: NavigationMenu;
}

interface ItemContext {
  readonly key: ComputedRef<string>;
  readonly contentId: string;
  readonly open: ComputedRef<boolean>;
  readonly trigger: Ref<HTMLElement | null>;
  readonly content: Ref<HTMLElement | null>;
}

const ROOT: InjectionKey<RootContext> = Symbol("SoneNavigationMenu");
const ITEM: InjectionKey<ItemContext> = Symbol("SoneNavigationMenuItem");

function useRoot(part: string): RootContext {
  const root = inject(ROOT, null);
  if (!root) throw new Error(`${part} needs a SoneNavigationMenu`);
  return root;
}

function useItem(part: string): ItemContext {
  const item = inject(ITEM, null);
  if (!item) throw new Error(`${part} needs a SoneNavigationMenuItem`);
  return item;
}

/**
 * `<SoneNavigationMenu>` — the Vue twin of `nav[soneNavigationMenu]`: site navigation
 * (shadcn/ui and Radix NavigationMenu), not an ARIA menu. One content is open at a
 * time (`v-model:value`); it opens on click, ArrowDown or a hover after `openDelay`,
 * and closes `closeDelay` after the pointer leaves, on Escape, on a click outside and
 * when focus leaves the menu. Closed contents stay in the page (`hidden`).
 */
export const SoneNavigationMenu = defineComponent({
  name: "SoneNavigationMenu",
  props: {
    ...asProp,
    /** The open item's `value`, or `null` — `v-model:value`. */
    value: { type: String as PropType<string | null>, default: null },
    /** ms from resting the pointer on a trigger to opening (when nothing is open yet). */
    openDelay: { type: Number, default: 200 },
    /** ms from leaving an item to closing. */
    closeDelay: { type: Number, default: 150 },
  },
  emits: { "update:value": (_value: string | null) => true },
  setup(props, { slots, emit }) {
    const value = useModel(
      () => props.value,
      (v) => emit("update:value", v),
    );
    const root = ref<unknown>(null);
    const controller = createNavigationMenu({
      value: () => value.value,
      setValue: (v) => {
        if (value.value !== v) value.set(v);
      },
      openDelay: () => props.openDelay,
      closeDelay: () => props.closeDelay,
      afterRender: (fn) => void nextTick(fn),
    });
    provide(ROOT, { value, controller });

    const onPointerDown = (event: PointerEvent): void => {
      const el = toElement(root.value);
      if (el) controller.pointerDown(el, event.target);
    };
    watch(value, (v, _old, onCleanup) => {
      if (v === null || typeof document === "undefined") return;
      document.addEventListener("pointerdown", onPointerDown, true);
      onCleanup(() =>
        document.removeEventListener("pointerdown", onPointerDown, true),
      );
    });
    onBeforeUnmount(() => {
      controller.cancel();
      document.removeEventListener("pointerdown", onPointerDown, true);
    });

    return () =>
      renderAs(
        props.as ?? "nav",
        {
          ref: root,
          class: "navigation-menu",
          "data-slot": "navigation-menu",
          onFocusout: (event: FocusEvent) => {
            const el = toElement(root.value);
            if (el) controller.focusOut(el, event.relatedTarget);
          },
        },
        slots,
      );
  },
});

/** `[soneNavigationMenuList]` — the `<ul>` of top-level items; arrow keys move along it. */
export const SoneNavigationMenuList = defineComponent({
  name: "SoneNavigationMenuList",
  props: { ...asProp },
  setup(props, { slots }) {
    const root = useRoot("SoneNavigationMenuList");
    return () =>
      renderAs(
        props.as ?? "ul",
        {
          class: "navigation-menu-list",
          "data-slot": "navigation-menu-list",
          onKeydown: (event: KeyboardEvent) =>
            root.controller.listKeyDown(
              event.currentTarget as HTMLElement,
              event,
            ),
        },
        slots,
      );
  },
});

/** `[soneNavigationMenuItem]` — one `<li>`: a link, or a trigger and its content. */
export const SoneNavigationMenuItem = defineComponent({
  name: "SoneNavigationMenuItem",
  props: {
    ...asProp,
    /** What `v-model:value` of the menu says when this item is open (generated when left out). */
    value: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const root = useRoot("SoneNavigationMenuItem");
    const id = `sone-navigation-menu-${useId()}`;
    const key = computed(() => props.value ?? id);
    const item: ItemContext = {
      key,
      contentId: `${id}-content`,
      open: computed(() => root.value.value === key.value),
      trigger: shallowRef(null),
      content: shallowRef(null),
    };
    provide(ITEM, item);
    return () =>
      renderAs(
        props.as ?? "li",
        {
          class: "navigation-menu-item",
          "data-slot": "navigation-menu-item",
          onPointerenter: (event: PointerEvent) => {
            if (item.trigger.value)
              root.controller.itemEnter(key.value, event.pointerType);
          },
          onPointerleave: (event: PointerEvent) =>
            root.controller.itemLeave(event.pointerType),
        },
        slots,
      );
  },
});

/** `[soneNavigationMenuTrigger]` — the button that reveals its item's content. */
export const SoneNavigationMenuTrigger = defineComponent({
  name: "SoneNavigationMenuTrigger",
  inheritAttrs: false,
  props: { ...asProp },
  setup(props, { attrs, slots }) {
    const root = useRoot("SoneNavigationMenuTrigger");
    const item = useItem("SoneNavigationMenuTrigger");
    const el = ref<unknown>(null);
    watch(el, (v) => (item.trigger.value = toElement(v)));
    return () => {
      const tag = props.as ?? "button";
      const open = item.open.value;
      return renderAs(
        tag,
        mergeProps(tag === "button" ? { type: "button" } : {}, attrs, {
          ref: el,
          class: "navigation-menu-trigger",
          "data-slot": "navigation-menu-trigger",
          "aria-expanded": open ? "true" : "false",
          "aria-controls": item.contentId,
          "data-state": open ? "open" : "closed",
          onClick: () => root.controller.triggerClick(item.key.value),
          onKeydown: (event: KeyboardEvent) =>
            root.controller.triggerKeyDown(
              item.key.value,
              event,
              () => item.content.value,
            ),
        }),
        slots,
      );
    };
  },
});

/** `[soneNavigationMenuContent]` — the panel of links its trigger reveals, under the item. */
export const SoneNavigationMenuContent = defineComponent({
  name: "SoneNavigationMenuContent",
  inheritAttrs: false,
  props: { ...asProp },
  setup(props, { attrs, slots }) {
    const root = useRoot("SoneNavigationMenuContent");
    const item = useItem("SoneNavigationMenuContent");
    const el = ref<unknown>(null);
    watch(el, (v) => (item.content.value = toElement(v)));
    return () => {
      const open = item.open.value;
      return renderAs(
        props.as ?? "div",
        mergeProps(attrs, {
          ref: el,
          class: "navigation-menu-content",
          "data-slot": "navigation-menu-content",
          id: item.contentId,
          hidden: open ? undefined : "",
          "data-state": open ? "open" : "closed",
          onKeydown: (event: KeyboardEvent) =>
            root.controller.contentKeyDown(event, item.trigger.value),
          onClick: (event: MouseEvent) => {
            const target = event.target;
            if (target instanceof Element && target.closest("a[href]"))
              root.controller.linkClick();
          },
        }),
        slots,
      );
    };
  },
});

/** `[soneNavigationMenuLink]` — a link; `active` marks the current page (`aria-current="page"`). */
export const SoneNavigationMenuLink = definePart({
  name: "SoneNavigationMenuLink",
  tag: "a",
  className: "navigation-menu-link",
  slot: "navigation-menu-link",
  props: { active: { type: Boolean, default: false } },
  attrs: (p) => ({
    "aria-current": p.active ? "page" : undefined,
    "data-active": p.active ? "" : undefined,
  }),
});
