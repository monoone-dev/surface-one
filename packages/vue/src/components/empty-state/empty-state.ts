import { computed, defineComponent, h, type PropType, type VNode } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { asProp, definePart, renderAs } from "../../utils/part";
import { SoneIcon, type ShellIcon } from "../icon/icon";
import { SoneSpinner } from "../spinner/spinner";

export type EmptyMediaVariant = "default" | "icon";
export type EmptyStateTone = "default" | "locked" | "error" | "loading";

/**
 * `<SoneEmpty>` — the empty state (`<sone-empty-state>` in Angular). Project the parts,
 * or set `icon` / `title` / `description` / `tone` and the header is drawn for you;
 * the default slot follows it. `locked` defaults the icon to `lock`, `error` to
 * `alert-circle` (`role="alert"`), `loading` or `busy` shows a spinner
 * (`role="status"`). The effective tone is `data-tone`.
 */
export const SoneEmpty = defineComponent({
  name: "SoneEmpty",
  props: {
    ...asProp,
    icon: { type: String as PropType<ShellIcon | null>, default: null },
    title: { type: String as PropType<string | null>, default: null },
    description: { type: String as PropType<string | null>, default: null },
    tone: { type: String as PropType<EmptyStateTone>, default: "default" },
    busy: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const tone = computed<EmptyStateTone>(() =>
      props.busy ? "loading" : props.tone,
    );
    const mediaIcon = computed<ShellIcon | null>(
      () =>
        props.icon ??
        (tone.value === "locked"
          ? "lock"
          : tone.value === "error"
            ? "alert-circle"
            : null),
    );
    return () => {
      const loading = tone.value === "loading";
      const header =
        loading || mediaIcon.value || props.title || props.description
          ? h("div", { class: "empty-header", "data-slot": "empty-header" }, [
              loading
                ? h(
                    "div",
                    {
                      class: "empty-media",
                      "data-slot": "empty-media",
                      "data-variant": "icon",
                    },
                    h(SoneSpinner, { size: 24, label: null }),
                  )
                : mediaIcon.value
                  ? h(
                      "div",
                      {
                        class: "empty-media",
                        "data-slot": "empty-media",
                        "data-variant": "icon",
                      },
                      h(SoneIcon, { icon: mediaIcon.value }),
                    )
                  : null,
              loading && !props.title
                ? h("span", { class: "sr-only" }, messages.value.loading)
                : null,
              props.title
                ? h(
                    "p",
                    { class: "empty-title", "data-slot": "empty-title" },
                    props.title,
                  )
                : null,
              props.description
                ? h(
                    "p",
                    { class: "empty", "data-slot": "empty-description" },
                    props.description,
                  )
                : null,
            ])
          : null;
      return renderAs(
        props.as ?? "div",
        {
          class: "empty-state",
          "data-slot": "empty",
          "data-tone": tone.value,
          role:
            tone.value === "error"
              ? "alert"
              : tone.value === "loading"
                ? "status"
                : undefined,
        },
        {
          default: (): VNode[] =>
            header
              ? [header, ...(slots.default?.() ?? [])]
              : (slots.default?.() ?? []),
        },
      );
    };
  },
});

export const SoneEmptyHeader = definePart({
  name: "SoneEmptyHeader",
  tag: "div",
  className: "empty-header",
  slot: "empty-header",
});

export const SoneEmptyMedia = definePart({
  name: "SoneEmptyMedia",
  tag: "div",
  className: "empty-media",
  slot: "empty-media",
  props: {
    variant: {
      type: String as PropType<EmptyMediaVariant>,
      default: "default",
    },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

export const SoneEmptyTitle = definePart({
  name: "SoneEmptyTitle",
  tag: "h3",
  className: "empty-title",
  slot: "empty-title",
});

export const SoneEmptyDescription = definePart({
  name: "SoneEmptyDescription",
  tag: "p",
  className: "empty",
  slot: "empty-description",
});

export const SoneEmptyContent = definePart({
  name: "SoneEmptyContent",
  tag: "div",
  className: "empty-content",
  slot: "empty-content",
});
