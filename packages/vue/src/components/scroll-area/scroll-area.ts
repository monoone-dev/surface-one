import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";

import {
  createScrollArea,
  type ScrollArea,
  type ScrollAreaOrientation,
} from "@surface-one/core";

import { asProp, flag, renderAs, toElement } from "../../utils/part";

/**
 * `<SoneScrollArea>` — the Vue twin of `[soneScrollArea]`: a scroll container with thin,
 * token-coloured scrollbars that keeps the browser's own scrolling (no emulated
 * scrollbar). Give it a height (a width for `horizontal`); `orientation` picks the axes.
 * While it overflows it is a keyboard stop (`tabindex="0"`, unless you set one), a named
 * one (`aria-label`) is a `region`, and `fade` softens the edges where content is hidden.
 */
export const SoneScrollArea = defineComponent({
  name: "SoneScrollArea",
  props: {
    ...asProp,
    orientation: {
      type: String as PropType<ScrollAreaOrientation>,
      default: "vertical",
    },
    /** Fade the content out at the edges where more of it is hidden. */
    fade: { type: Boolean, default: false },
  },
  setup(props, { slots, expose }) {
    const root = ref<unknown>(null);
    let area: ScrollArea | null = null;
    onMounted(() => {
      const el = toElement(root.value);
      if (el) area = createScrollArea(el, () => props.orientation);
    });
    watch(
      () => props.orientation,
      () => void nextTick(() => area?.update()),
    );
    onBeforeUnmount(() => area?.disconnect());
    expose({ update: () => area?.update() });
    return () =>
      renderAs(
        props.as ?? "div",
        {
          ref: root,
          class: "scroll-area",
          "data-slot": "scroll-area",
          "data-orientation": props.orientation,
          "data-fade": flag(props.fade),
        },
        slots,
      );
  },
});
