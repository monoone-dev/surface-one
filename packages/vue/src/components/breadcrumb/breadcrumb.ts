import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { definePart } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

/**
 * `nav[soneBreadcrumb]` — the trail of links to the current page. Named
 * "Breadcrumb" (the messages catalogue) unless you pass `aria-label`.
 */
export const SoneBreadcrumb = defineComponent({
  name: "SoneBreadcrumb",
  setup(_, { slots }) {
    const messages = useSoneMessages();
    return () =>
      h(
        "nav",
        {
          "data-slot": "breadcrumb",
          "aria-label": messages.value.breadcrumbLabel,
        },
        slots.default?.(),
      );
  },
});

/** `ol[soneBreadcrumbList]` — the ordered list of crumbs. */
export const SoneBreadcrumbList = definePart({
  name: "SoneBreadcrumbList",
  tag: "ol",
  className: "breadcrumb-list",
  slot: "breadcrumb-list",
});

/** `li[soneBreadcrumbItem]` — one crumb: a link, the page or an ellipsis. */
export const SoneBreadcrumbItem = definePart({
  name: "SoneBreadcrumbItem",
  tag: "li",
  className: "breadcrumb-item",
  slot: "breadcrumb-item",
});

/** `a[soneBreadcrumbLink]` — a crumb that links to its page; `as` renders a `RouterLink` / `NuxtLink`. */
export const SoneBreadcrumbLink = definePart({
  name: "SoneBreadcrumbLink",
  tag: "a",
  className: "breadcrumb-link",
  slot: "breadcrumb-link",
});

/** `span[soneBreadcrumbPage]` — the current page: not a link, `aria-current="page"`. */
export const SoneBreadcrumbPage = definePart({
  name: "SoneBreadcrumbPage",
  tag: "span",
  className: "breadcrumb-page",
  slot: "breadcrumb-page",
  static: {
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
  },
});

/** `li[soneBreadcrumbSeparator]` — the chevron between crumbs; the default slot replaces it. */
export const SoneBreadcrumbSeparator = defineComponent({
  name: "SoneBreadcrumbSeparator",
  setup(_, { slots }) {
    return () =>
      h(
        "li",
        {
          class: "breadcrumb-separator",
          "data-slot": "breadcrumb-separator",
          role: "presentation",
          "aria-hidden": "true",
        },
        slots.default?.() ?? h(SoneIcon, { icon: "chevron-right" }),
      );
  },
});

/** `<sone-breadcrumb-ellipsis>` — stands in for collapsed crumbs; says "More" to screen readers. */
export const SoneBreadcrumbEllipsis = defineComponent({
  name: "SoneBreadcrumbEllipsis",
  props: {
    /** What screen readers hear in place of the collapsed crumbs. */
    srOnlyText: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-breadcrumb-ellipsis",
        { class: "breadcrumb-ellipsis", "data-slot": "breadcrumb-ellipsis" },
        [
          h(SoneIcon, { icon: "ellipsis" }),
          h(
            "span",
            { class: "sr-only" },
            props.srOnlyText ?? messages.value.breadcrumbMore,
          ),
        ],
      );
  },
});
