import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  useId,
  type InjectionKey,
  type PropType,
  type Ref,
  type ShallowRef,
} from "vue";

import {
  createResizable,
  resizableInitialSizes,
  resizableParse,
  resizableStorageKey,
  type Resizable,
  type ResizableDirection,
  type ResizablePanelLimits,
  type ResizableStorage,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { flag } from "../../utils/part";

interface PanelEntry {
  readonly el: HTMLElement;
  readonly id: string;
  readonly limits: () => ResizablePanelLimits;
}

interface GroupContext {
  readonly direction: () => ResizableDirection;
  readonly panels: ShallowRef<readonly PanelEntry[]>;
  readonly handles: ShallowRef<readonly HTMLElement[]>;
  readonly layout: Ref<readonly number[]>;
  readonly dragging: Ref<number | null>;
  readonly resizable: Resizable;
  registerPanel(entry: PanelEntry): () => void;
  registerHandle(el: HTMLElement): () => void;
}

/** Adds `item` to `list` in document order; returns the function that removes it. */
function insert<T>(
  list: ShallowRef<readonly T[]>,
  item: T,
  elOf: (item: T) => HTMLElement,
): () => void {
  list.value = [...list.value, item].sort((a, b) =>
    elOf(a).compareDocumentPosition(elOf(b)) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1,
  );
  return () => {
    list.value = list.value.filter((i) => i !== item);
  };
}

const GROUP: InjectionKey<GroupContext> = Symbol("SoneResizableGroup");

function useGroup(part: string): GroupContext {
  const group = inject(GROUP, null);
  if (!group) throw new Error(`${part} needs a SoneResizableGroup`);
  return group;
}

/**
 * `<SoneResizableGroup>` — the Vue twin of `sone-resizable-group`: resizable panels side
 * by side (`direction="horizontal"`) or stacked (`vertical`), sizes in percent as
 * `v-model:sizes`. Handles are WAI-ARIA window splitters (drag, arrows, Home / End,
 * Enter). `autoSaveId` with a `storage` (`localStorage`, or your own) keeps the sizes.
 */
export const SoneResizableGroup = defineComponent({
  name: "SoneResizableGroup",
  props: {
    direction: {
      type: String as PropType<ResizableDirection>,
      default: "horizontal",
    },
    /** The panels' sizes in percent — `v-model:sizes`. Empty: their defaults. */
    sizes: {
      type: Array as PropType<readonly number[]>,
      default: () => [],
    },
    /** Keep the sizes in `storage` under this id. */
    autoSaveId: { type: String as PropType<string | null>, default: null },
    /** Where `autoSaveId` keeps them — pass `localStorage`, or your own. */
    storage: {
      type: Object as PropType<ResizableStorage | null>,
      default: null,
    },
  },
  emits: { "update:sizes": (_sizes: number[]) => true },
  setup(props, { slots, emit }) {
    const sizes = useModel<readonly number[]>(
      () => props.sizes,
      (v) => emit("update:sizes", [...v]),
    );
    const root = shallowRef<HTMLElement | null>(null);
    const panels = shallowRef<readonly PanelEntry[]>([]);
    const handles = shallowRef<readonly HTMLElement[]>([]);
    const dragging = shallowRef<number | null>(null);
    const limits = computed(() => panels.value.map((p) => p.limits()));
    const layout = computed(() =>
      sizes.value.length === limits.value.length
        ? sizes.value
        : resizableInitialSizes(limits.value),
    );
    const resizable = createResizable({
      direction: () => props.direction,
      panels: () => limits.value,
      sizes: () => layout.value,
      group: () => root.value,
      setSizes: (next, done) => {
        sizes.set(next);
        if (done && props.autoSaveId && props.storage)
          props.storage.setItem(
            resizableStorageKey(props.autoSaveId),
            JSON.stringify(next),
          );
      },
      dragging: (i) => (dragging.value = i),
    });
    provide(GROUP, {
      direction: () => props.direction,
      panels,
      handles,
      layout,
      dragging,
      resizable,
      registerPanel: (entry) => insert(panels, entry, (p) => p.el),
      registerHandle: (el) => insert(handles, el, (h) => h),
    });
    onMounted(() => {
      if (!props.autoSaveId || !props.storage) return;
      const stored = resizableParse(
        props.storage.getItem(resizableStorageKey(props.autoSaveId)),
        panels.value.length,
      );
      if (stored) sizes.set(stored);
    });

    return () =>
      h(
        "sone-resizable-group",
        {
          ref: root,
          class: "resizable-group",
          "data-slot": "resizable-group",
          "data-direction": props.direction,
          "data-dragging": flag(dragging.value !== null),
        },
        slots.default?.(),
      );
  },
});

/** `<sone-resizable-panel>` — one panel; its size is a percentage of the group. */
export const SoneResizablePanel = defineComponent({
  name: "SoneResizablePanel",
  props: {
    /** Its size before any is bound or stored (percent); left out, it shares the rest. */
    defaultSize: { type: Number as PropType<number | null>, default: null },
    minSize: { type: Number, default: 0 },
    maxSize: { type: Number, default: 100 },
    /** It collapses to `collapsedSize` when dragged well past `minSize`, or on Enter. */
    collapsible: { type: Boolean, default: false },
    collapsedSize: { type: Number, default: 0 },
    id: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const group = useGroup("SoneResizablePanel");
    const el = shallowRef<HTMLElement | null>(null);
    const fallbackId = `sone-resizable-panel-${useId()}`;
    const entry = shallowRef<PanelEntry | null>(null);
    let unregister: (() => void) | null = null;
    onMounted(() => {
      if (!el.value) return;
      entry.value = {
        el: el.value,
        get id() {
          return props.id ?? fallbackId;
        },
        limits: () => ({
          defaultSize: props.defaultSize,
          minSize: props.minSize,
          maxSize: props.maxSize,
          collapsible: props.collapsible,
          collapsedSize: props.collapsedSize,
        }),
      };
      unregister = group.registerPanel(entry.value);
    });
    onBeforeUnmount(() => unregister?.());
    return () => {
      const at = entry.value ? group.panels.value.indexOf(entry.value) : -1;
      const size = at >= 0 ? group.layout.value[at] : undefined;
      const fallback = props.defaultSize;
      const grow = size ?? fallback;
      return h(
        "sone-resizable-panel",
        {
          ref: el,
          class: "resizable-panel",
          "data-slot": "resizable-panel",
          id: props.id ?? fallbackId,
          style:
            grow === null || grow === undefined
              ? undefined
              : { flex: `${grow} 1 0px` },
          "data-size": size,
          "data-collapsed": flag(
            size !== undefined &&
              props.collapsible &&
              size <= props.collapsedSize &&
              size < props.minSize,
          ),
        },
        slots.default?.(),
      );
    };
  },
});

/** `<sone-resizable-handle>` — the window splitter between two panels; `withHandle` draws a grip. */
export const SoneResizableHandle = defineComponent({
  name: "SoneResizableHandle",
  props: {
    /** Draw a grip on the handle. */
    withHandle: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** The splitter's name (default: the `resizableHandle` message). */
    label: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const group = useGroup("SoneResizableHandle");
    const messages = useSoneMessages();
    const el = shallowRef<HTMLElement | null>(null);
    let unregister: (() => void) | null = null;
    onMounted(() => {
      if (el.value) unregister = group.registerHandle(el.value);
    });
    onBeforeUnmount(() => unregister?.());
    return () => {
      const index = el.value ? group.handles.value.indexOf(el.value) : -1;
      const before = index >= 0 ? group.panels.value[index] : undefined;
      const limits = before?.limits();
      const size = index >= 0 ? group.layout.value[index] : undefined;
      return h(
        "sone-resizable-handle",
        {
          ref: el,
          class: "resizable-handle",
          "data-slot": "resizable-handle",
          role: "separator",
          tabindex: props.disabled ? undefined : "0",
          "aria-label": props.label ?? messages.value.resizableHandle,
          "aria-orientation":
            group.direction() === "horizontal" ? "vertical" : "horizontal",
          "aria-valuenow": size === undefined ? undefined : Math.round(size),
          "aria-valuemin": limits?.minSize ?? 0,
          "aria-valuemax": limits?.maxSize ?? 100,
          "aria-controls": before?.id,
          "aria-disabled": props.disabled ? "true" : undefined,
          "data-direction": group.direction(),
          "data-dragging": flag(index >= 0 && group.dragging.value === index),
          onKeydown: (e: KeyboardEvent) => {
            if (!props.disabled) group.resizable.keyDown(index, e);
          },
          onPointerdown: (e: PointerEvent) => {
            if (!props.disabled && el.value)
              group.resizable.pointerDown(index, e, el.value);
          },
        },
        props.withHandle
          ? h("div", { class: "resizable-grip", "data-slot": "resizable-grip" })
          : undefined,
      );
    };
  },
});
