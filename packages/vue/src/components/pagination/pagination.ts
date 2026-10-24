import {
  computed,
  defineComponent,
  h,
  type PropType,
  type VNodeChild,
} from "vue";

import {
  clampPage,
  paginationPageCount,
  paginationRange,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { asProp, definePart, flag, type AsTag } from "../../utils/part";
import type { ButtonSize } from "../button/button";
import { SoneIcon } from "../icon/icon";

/** An element gets the children; a component (`RouterLink`, `NuxtLink`) a default slot. */
const renderWith = (
  tag: AsTag,
  attrs: Record<string, unknown>,
  children: () => VNodeChild,
) =>
  typeof tag === "string"
    ? h(tag, attrs, children() as never)
    : h(tag, attrs, { default: children });

/**
 * `nav[sonePaginationNav]` — the shadcn/ui Pagination root, for pages you lay out
 * yourself (`SonePagination` draws them from a page count). Named "Pagination" (the
 * messages catalogue) unless you pass `aria-label`.
 */
export const SonePaginationNav = defineComponent({
  name: "SonePaginationNav",
  setup(_, { slots }) {
    const messages = useSoneMessages();
    return () =>
      h(
        "nav",
        {
          class: "pagination",
          "data-slot": "pagination",
          "aria-label": messages.value.paginationLabel,
        },
        slots.default?.(),
      );
  },
});

/** `ul[sonePaginationContent]` — the row of page links. */
export const SonePaginationContent = definePart({
  name: "SonePaginationContent",
  tag: "ul",
  className: "pagination-content",
  slot: "pagination-content",
});

/** `li[sonePaginationItem]` — one link, previous / next or an ellipsis. */
export const SonePaginationItem = definePart({
  name: "SonePaginationItem",
  tag: "li",
  className: "pagination-item",
  slot: "pagination-item",
});

/**
 * `a[sonePaginationLink]` — a page: a ghost icon button, outlined with
 * `aria-current="page"` when `isActive`. `as` renders a `RouterLink` / `NuxtLink` or a button.
 */
export const SonePaginationLink = definePart({
  name: "SonePaginationLink",
  tag: "a",
  className: "btn pagination-link",
  slot: "pagination-link",
  props: {
    /** The current page: outlined, `aria-current="page"`. */
    isActive: { type: Boolean, default: false },
    size: { type: String as PropType<ButtonSize>, default: "icon" },
  },
  attrs: (p) => ({
    "data-variant": p.isActive ? "outline" : "ghost",
    "data-size": p.size,
    "data-active": flag(p.isActive),
    "aria-current": p.isActive ? "page" : undefined,
  }),
});

const edge = (kind: "previous" | "next") =>
  defineComponent({
    name: kind === "previous" ? "SonePaginationPrevious" : "SonePaginationNext",
    props: {
      ...asProp,
      /** The visible text (the default slot replaces it). */
      label: { type: String as PropType<string | null>, default: null },
    },
    setup(props, { slots }) {
      const messages = useSoneMessages();
      return () => {
        const m = messages.value;
        const previous = kind === "previous";
        const text = h(
          "span",
          { class: "pagination-label" },
          slots.default?.() ??
            props.label ??
            (previous ? m.paginationPrevious : m.paginationNext),
        );
        const icon = h(SoneIcon, {
          icon: previous ? "chevron-left" : "chevron-right",
        });
        return renderWith(
          props.as ?? "a",
          {
            class: `btn pagination-link pagination-${kind}`,
            "data-slot": `pagination-${kind}`,
            "data-variant": "ghost",
            "data-size": "default",
            "aria-label": previous
              ? m.paginationPreviousLabel
              : m.paginationNextLabel,
          },
          () => (previous ? [icon, text] : [text, icon]),
        );
      };
    },
  });

/** `a[sonePaginationPrevious]` — goes back a page: a chevron and “Previous”. */
export const SonePaginationPrevious = edge("previous");

/** `a[sonePaginationNext]` — goes on a page: “Next” and a chevron. */
export const SonePaginationNext = edge("next");

/** `<sone-pagination-ellipsis>` — stands in for hidden pages; says “More pages” to screen readers. */
export const SonePaginationEllipsis = defineComponent({
  name: "SonePaginationEllipsis",
  props: {
    /** What screen readers hear in place of the hidden pages. */
    srOnlyText: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-pagination-ellipsis",
        { class: "pagination-ellipsis", "data-slot": "pagination-ellipsis" },
        [
          h(SoneIcon, { icon: "ellipsis" }),
          h(
            "span",
            { class: "sr-only" },
            props.srOnlyText ?? messages.value.paginationMore,
          ),
        ],
      );
  },
});

/**
 * `<sone-pagination>` — page buttons drawn from a page count: Previous, the first and
 * last pages, `siblings` pages around the current one with ellipses for the gaps, and
 * Next. `v-model:page` (1-based); the count is `pageCount`, or `total` items at `pageSize`.
 */
export const SonePagination = defineComponent({
  name: "SonePagination",
  props: {
    page: { type: Number, default: 1 },
    total: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    /** The page count, when you know it (wins over `total` / `pageSize`). */
    pageCount: { type: Number as PropType<number | null>, default: null },
    siblings: { type: Number, default: 1 },
    boundaries: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    previousLabel: { type: String as PropType<string | null>, default: null },
    nextLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:page": (_page: number) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const page = useModel(
      () => props.page,
      (v) => emit("update:page", v),
    );
    const count = computed(
      () => props.pageCount ?? paginationPageCount(props.total, props.pageSize),
    );
    const current = computed(() => clampPage(page.value, count.value));
    const go = (to: number): void => {
      const next = clampPage(to, count.value);
      if (props.disabled || next === current.value) return;
      page.set(next);
    };
    const item = (child: VNodeChild, key: string | number) =>
      h(
        "li",
        { key, class: "pagination-item", "data-slot": "pagination-item" },
        [child],
      );
    return () => {
      const m = messages.value;
      const now = current.value;
      const range = paginationRange({
        page: now,
        pageCount: count.value,
        siblings: props.siblings,
        boundaries: props.boundaries,
      });
      return h(
        "sone-pagination",
        null,
        h(
          "nav",
          {
            class: "pagination",
            "data-slot": "pagination",
            "aria-label": props.ariaLabel ?? m.paginationLabel,
          },
          h(
            "ul",
            { class: "pagination-content", "data-slot": "pagination-content" },
            [
              item(
                h(
                  "button",
                  {
                    type: "button",
                    class: "btn pagination-link pagination-previous",
                    "data-slot": "pagination-previous",
                    "data-variant": "ghost",
                    "data-size": "default",
                    "aria-label": m.paginationPreviousLabel,
                    disabled: props.disabled || now <= 1,
                    onClick: () => go(now - 1),
                  },
                  [
                    h(SoneIcon, { icon: "chevron-left" }),
                    h(
                      "span",
                      { class: "pagination-label" },
                      props.previousLabel ?? m.paginationPrevious,
                    ),
                  ],
                ),
                "previous",
              ),
              ...range.map((entry) =>
                item(
                  typeof entry === "number"
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: "btn pagination-link",
                          "data-slot": "pagination-link",
                          "data-size": "icon",
                          "data-variant": entry === now ? "outline" : "ghost",
                          "data-active": flag(entry === now),
                          "aria-current": entry === now ? "page" : undefined,
                          disabled: props.disabled,
                          onClick: () => go(entry),
                        },
                        String(entry),
                      )
                    : h(SonePaginationEllipsis),
                  entry,
                ),
              ),
              item(
                h(
                  "button",
                  {
                    type: "button",
                    class: "btn pagination-link pagination-next",
                    "data-slot": "pagination-next",
                    "data-variant": "ghost",
                    "data-size": "default",
                    "aria-label": m.paginationNextLabel,
                    disabled: props.disabled || now >= count.value,
                    onClick: () => go(now + 1),
                  },
                  [
                    h(
                      "span",
                      { class: "pagination-label" },
                      props.nextLabel ?? m.paginationNext,
                    ),
                    h(SoneIcon, { icon: "chevron-right" }),
                  ],
                ),
                "next",
              ),
            ],
          ),
        ),
      );
    };
  },
});
