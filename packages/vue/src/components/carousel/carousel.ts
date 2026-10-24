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
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
  type ShallowRef,
} from "vue";

import {
  createCarousel,
  type Carousel,
  type CarouselOrientation,
  type ShellIcon,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneIcon } from "../icon/icon";

type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

interface CarouselContext {
  readonly index: Ref<number>;
  readonly orientation: () => CarouselOrientation;
  readonly slides: ShallowRef<readonly HTMLElement[]>;
  readonly track: ShallowRef<HTMLElement | null>;
  readonly trackId: string;
  readonly controller: Carousel;
  /** Bumped when the controller's derived state changes. */
  readonly version: Ref<number>;
  readonly playing: Ref<boolean>;
  readonly slideRoleDescription: () => string | null;
  register(el: HTMLElement): () => void;
}

const CAROUSEL: InjectionKey<CarouselContext> = Symbol("SoneCarousel");

function useCarousel(part: string): CarouselContext {
  const context = inject(CAROUSEL, null);
  if (!context) throw new Error(`${part} needs a SoneCarousel`);
  return context;
}

/**
 * `<SoneCarousel>` — the Vue twin of `sone-carousel`: a dependency-free carousel (WAI-ARIA
 * carousel pattern) whose slides sit in a CSS scroll-snap track. `SoneCarouselPrevious` /
 * `SoneCarouselNext`, `SoneCarouselDots` and the arrow keys step it, `v-model:index` is
 * the current slide and `loop` wraps at the ends. Nothing moves on its own unless
 * `autoplay` (ms) is set: it then holds on hover and focus, starts stopped under reduced
 * motion and shows a rotation control. Name it with `aria-label`.
 */
export const SoneCarousel = defineComponent({
  name: "SoneCarousel",
  props: {
    /** The current slide — `v-model:index`. */
    index: { type: Number, default: 0 },
    orientation: {
      type: String as PropType<CarouselOrientation>,
      default: "horizontal",
    },
    /** Wrap from the last slide to the first and back. */
    loop: { type: Boolean, default: false },
    /** ms between automatic steps; 0 never moves on its own. */
    autoplay: { type: Number, default: 0 },
    /** The region's role description (default: the `carousel` message). */
    roleDescription: { type: String as PropType<string | null>, default: null },
    /** Each slide's role description (default: the `carouselSlide` message). */
    slideRoleDescription: {
      type: String as PropType<string | null>,
      default: null,
    },
    stopLabel: { type: String as PropType<string | null>, default: null },
    startLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:index": (_index: number) => true },
  setup(props, { slots, emit, expose }) {
    const messages = useSoneMessages();
    const index = useModel(
      () => props.index,
      (v) => emit("update:index", v),
    );
    const root = shallowRef<HTMLElement | null>(null);
    const track = shallowRef<HTMLElement | null>(null);
    const slides = shallowRef<readonly HTMLElement[]>([]);
    const version = shallowRef(0);
    const trackId = `sone-carousel-${useId()}-content`;
    const controller = createCarousel({
      index: () => index.value,
      setIndex: (i) => index.set(i),
      count: () => slides.value.length,
      loop: () => props.loop,
      orientation: () => props.orientation,
      autoplay: () => props.autoplay,
      track: () => track.value,
      slides: () => slides.value,
      changed: () => version.value++,
    });
    const playing = computed(() => {
      void version.value;
      void props.autoplay;
      return controller.playing();
    });
    const stopped = computed(() => {
      void version.value;
      return controller.stopped();
    });

    provide(CAROUSEL, {
      index,
      orientation: () => props.orientation,
      slides,
      track,
      trackId,
      controller,
      version,
      playing,
      slideRoleDescription: () => props.slideRoleDescription,
      register(el) {
        const next = [...slides.value, el].sort((a, b) =>
          a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
        );
        slides.value = next;
        return () => {
          slides.value = slides.value.filter((s) => s !== el);
        };
      },
    });

    let disconnect: (() => void) | null = null;
    onMounted(() => (disconnect = controller.connect()));
    onBeforeUnmount(() => disconnect?.());
    watch(
      () => [index.value, props.autoplay],
      () => controller.sync(),
    );
    expose({
      prev: () => controller.prev(),
      next: () => controller.next(),
      goTo: (i: number) => controller.goTo(i),
    });

    return () => {
      const m = messages.value;
      return h(
        "sone-carousel",
        {
          ref: root,
          class: "carousel",
          "data-slot": "carousel",
          role: "region",
          "aria-roledescription": props.roleDescription ?? m.carousel,
          "data-orientation": props.orientation,
          onKeydown: (e: KeyboardEvent) => controller.keyDown(e),
          onPointerenter: (e: PointerEvent) => {
            if (e.pointerType !== "touch") controller.hover(true);
          },
          onPointerleave: (e: PointerEvent) => {
            if (e.pointerType !== "touch") controller.hover(false);
          },
          onFocusin: (e: FocusEvent) => {
            const target = e.target as Element | null;
            controller.focus(
              !target?.closest('[data-slot="carousel-rotation"]'),
            );
          },
          onFocusout: (e: FocusEvent) => {
            const next = e.relatedTarget as Node | null;
            if (!next || !root.value?.contains(next)) controller.focus(false);
          },
        },
        [
          props.autoplay > 0
            ? h(
                "button",
                {
                  type: "button",
                  class: "btn carousel-rotation",
                  "data-slot": "carousel-rotation",
                  "data-variant": "outline",
                  "data-size": "icon-sm",
                  "aria-label": stopped.value
                    ? (props.startLabel ?? m.carouselStart)
                    : (props.stopLabel ?? m.carouselStop),
                  "aria-controls": trackId,
                  onClick: () => controller.toggleRotation(),
                },
                h(SoneIcon, { icon: stopped.value ? "play" : "pause" }),
              )
            : null,
          slots.default?.(),
        ],
      );
    };
  },
});

/** `[soneCarouselContent]` — the scroll-snap track of the slides: focusable, a polite live region while nothing rotates. */
export const SoneCarouselContent = defineComponent({
  name: "SoneCarouselContent",
  setup(_props, { slots }) {
    const c = useCarousel("SoneCarouselContent");
    return () =>
      h(
        "div",
        {
          ref: c.track,
          class: "carousel-content",
          "data-slot": "carousel-content",
          tabindex: "0",
          id: c.trackId,
          "data-orientation": c.orientation(),
          "aria-live": c.playing.value ? "off" : "polite",
          onScroll: () => c.controller.scrolled(),
        },
        slots.default?.(),
      );
  },
});

/** `[soneCarouselItem]` — one slide: a `group` with `aria-roledescription="slide"`, named "N of M". */
export const SoneCarouselItem = defineComponent({
  name: "SoneCarouselItem",
  setup(_props, { slots, attrs }) {
    const c = useCarousel("SoneCarouselItem");
    const messages = useSoneMessages();
    const el = shallowRef<HTMLElement | null>(null);
    let unregister: (() => void) | null = null;
    onMounted(() => {
      if (el.value) unregister = c.register(el.value);
    });
    onBeforeUnmount(() => unregister?.());
    const at = computed(() =>
      el.value ? c.slides.value.indexOf(el.value) : -1,
    );
    return () => {
      const m = messages.value;
      const i = at.value;
      return h(
        "div",
        {
          ref: el,
          class: "carousel-item",
          "data-slot": "carousel-item",
          role: "group",
          "aria-roledescription": c.slideRoleDescription() ?? m.carouselSlide,
          "aria-label":
            (attrs["aria-label"] as string | undefined) ??
            (i >= 0
              ? m.carouselSlidePosition(i + 1, c.slides.value.length)
              : undefined),
          "data-current": i >= 0 && i === c.index.value ? "" : undefined,
        },
        slots.default?.(),
      );
    };
  },
});

function defineStep(
  name: string,
  dir: "previous" | "next",
  icons: readonly [ShellIcon, ShellIcon],
) {
  return defineComponent({
    name,
    props: {
      variant: { type: String as PropType<ButtonVariant>, default: "outline" },
      size: { type: String as PropType<ButtonSize>, default: "icon-sm" },
    },
    setup(props, { slots, attrs }) {
      const c = useCarousel(name);
      const messages = useSoneMessages();
      return () => {
        void c.version.value;
        const m = messages.value;
        const can =
          dir === "previous" ? c.controller.canPrev() : c.controller.canNext();
        // Read the index so a step re-renders the disabled state.
        void c.index.value;
        void c.slides.value;
        return h(
          "button",
          {
            type: "button",
            class: `btn carousel-${dir}`,
            "data-slot": `carousel-${dir}`,
            "data-variant": props.variant,
            "data-size": props.size,
            "aria-label":
              (attrs["aria-label"] as string | undefined) ??
              (dir === "previous" ? m.carouselPrevious : m.carouselNext),
            "aria-controls": c.trackId,
            disabled: !can || undefined,
            onClick: () =>
              dir === "previous" ? c.controller.prev() : c.controller.next(),
          },
          [
            h(SoneIcon, {
              icon: c.orientation() === "vertical" ? icons[1] : icons[0],
            }),
            slots.default?.(),
          ],
        );
      };
    },
  });
}

/** `button[soneCarouselPrevious]` — steps back one slide; disabled on the first unless `loop`. */
export const SoneCarouselPrevious = defineStep(
  "SoneCarouselPrevious",
  "previous",
  ["chevron-left", "chevron-up"],
);

/** `button[soneCarouselNext]` — steps on one slide; disabled on the last unless `loop`. */
export const SoneCarouselNext = defineStep("SoneCarouselNext", "next", [
  "chevron-right",
  "chevron-down",
]);

/** `<sone-carousel-dots>` — one button per slide; the current one is `aria-current`. */
export const SoneCarouselDots = defineComponent({
  name: "SoneCarouselDots",
  setup(_props, { attrs }) {
    const c = useCarousel("SoneCarouselDots");
    const messages = useSoneMessages();
    return () => {
      const m = messages.value;
      return h(
        "sone-carousel-dots",
        {
          class: "carousel-dots",
          "data-slot": "carousel-dots",
          role: "group",
          "aria-label":
            (attrs["aria-label"] as string | undefined) ?? m.carouselDots,
        },
        c.slides.value.map((_, i) =>
          h("button", {
            key: i,
            type: "button",
            class: "carousel-dot",
            "data-slot": "carousel-dot",
            "aria-label": m.carouselGoTo(i + 1),
            "aria-controls": c.trackId,
            "aria-current": i === c.index.value ? "true" : undefined,
            onClick: () => c.controller.goTo(i),
          }),
        ),
      );
    };
  },
});
