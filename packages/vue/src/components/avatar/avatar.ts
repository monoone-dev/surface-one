import {
  defineComponent,
  h,
  inject,
  onMounted,
  provide,
  ref,
  shallowRef,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";

import { asProp, renderAs } from "../../utils/part";
import { flatten, hasPart } from "../../utils/vnodes";

export type AvatarSize = "sm" | "default" | "lg";
type ImageStatus = "loading" | "loaded" | "error";

const AVATAR: InjectionKey<Ref<ImageStatus>> = Symbol("SoneAvatar");

/** `img[soneAvatarImage]` — shown once it loads; until then (or on error) the fallback is. */
export const SoneAvatarImage = defineComponent({
  name: "SoneAvatarImage",
  setup() {
    const status = inject(AVATAR, ref<ImageStatus>("loading"));
    const img = shallowRef<HTMLImageElement | null>(null);
    // A server-rendered image may finish loading before hydration adds the listeners.
    onMounted(() => {
      const el = img.value;
      if (el?.complete) status.value = el.naturalWidth > 0 ? "loaded" : "error";
    });
    return () =>
      h("img", {
        ref: img,
        class: "avatar-image",
        "data-slot": "avatar-image",
        onLoad: () => (status.value = "loaded"),
        onError: () => (status.value = "error"),
      });
  },
});

/** `[soneAvatarFallback]` — initials or an icon while there is no image. */
export const SoneAvatarFallback = defineComponent({
  name: "SoneAvatarFallback",
  props: asProp,
  setup(props, { slots }) {
    const status = inject(AVATAR, null);
    return () =>
      status?.value === "loaded"
        ? null
        : renderAs(
            props.as ?? "span",
            { class: "avatar-fallback", "data-slot": "avatar-fallback" },
            slots,
          );
  },
});

const placeholder = () =>
  h(
    "span",
    {
      class: "avatar-fallback avatar-placeholder",
      "data-slot": "avatar-placeholder",
    },
    h("svg", { viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true" }, [
      h("circle", {
        cx: "8",
        cy: "5.75",
        r: "2.75",
        stroke: "currentColor",
        "stroke-width": "1.4",
      }),
      h("path", {
        d: "M2.75 13.5c.6-2.4 2.7-4 5.25-4s4.65 1.6 5.25 4",
        stroke: "currentColor",
        "stroke-width": "1.4",
        "stroke-linecap": "round",
      }),
    ]),
  );

/** `<sone-avatar>` — an image with a fallback; a person glyph when it has neither. */
export const SoneAvatar = defineComponent({
  name: "SoneAvatar",
  props: {
    size: { type: String as PropType<AvatarSize>, default: "default" },
  },
  setup(props, { slots }) {
    const status = ref<ImageStatus>("loading");
    provide(AVATAR, status);
    return () => {
      const children = flatten(slots.default?.());
      const showPlaceholder =
        status.value !== "loaded" && !hasPart(children, SoneAvatarFallback);
      return h(
        "sone-avatar",
        { class: "avatar", "data-slot": "avatar", "data-size": props.size },
        [...children, showPlaceholder ? placeholder() : null],
      );
    };
  },
});
