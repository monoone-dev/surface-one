import { defineComponent, h, type PropType } from "vue";

import {
  pageFooterLinkRel,
  toHeadingLevel,
  type HeadingLevel,
  type PageFooterColumn,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";

export type { PageFooterColumn, PageFooterLink } from "@surface-one/core";

/**
 * `<sone-page-footer>` — the footer of a site (Nuxt UI Footer and FooterColumns): the
 * `#brand` slot, titled `columns` of links in a named `nav` (column titles are headings,
 * `level` 3 by default), then a bottom row with the `copyright` line and the `#left` /
 * `#right` slots. The default slot goes after the columns. It renders a `<footer>`.
 */
export const SonePageFooter = defineComponent({
  name: "SonePageFooter",
  props: {
    columns: {
      type: Array as PropType<readonly PageFooterColumn[]>,
      default: () => [],
    },
    /** The copyright line of the bottom row. */
    copyright: { type: String as PropType<string | null>, default: null },
    /** Names the columns' navigation landmark (default: the "Footer" message). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** The column titles' heading level, 1–6. */
    level: {
      type: [Number, String] as PropType<HeadingLevel | `${HeadingLevel}`>,
      default: 3,
    },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    return () => {
      const level = toHeadingLevel(props.level, 3);
      return h(
        "sone-page-footer",
        { "data-slot": "page-footer" },
        h("footer", { class: "page-footer" }, [
          h(
            "div",
            { class: "page-footer-top", "data-slot": "page-footer-top" },
            [
              h(
                "div",
                {
                  class: "page-footer-brand",
                  "data-slot": "page-footer-brand",
                },
                slots.brand?.(),
              ),
              props.columns.length
                ? h(
                    "nav",
                    {
                      class: "page-footer-columns",
                      "data-slot": "page-footer-columns",
                      "aria-label":
                        props.ariaLabel ?? messages.value.pageFooterLabel,
                    },
                    props.columns.map((column, i) =>
                      h(
                        "div",
                        {
                          key: i,
                          class: "page-footer-column",
                          "data-slot": "page-footer-column",
                        },
                        [
                          h(
                            `h${level}`,
                            { class: "page-footer-column-label" },
                            column.label,
                          ),
                          h(
                            "ul",
                            { class: "page-footer-links" },
                            column.links.map((link, j) =>
                              h(
                                "li",
                                { key: j },
                                h(
                                  "a",
                                  {
                                    class: "page-footer-link",
                                    "data-slot": "page-footer-link",
                                    href: link.href,
                                    target: link.target,
                                    rel: pageFooterLinkRel(link) ?? undefined,
                                  },
                                  link.label,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                : null,
              slots.default?.(),
            ],
          ),
          h(
            "div",
            { class: "page-footer-bottom", "data-slot": "page-footer-bottom" },
            [
              h(
                "div",
                { class: "page-footer-left", "data-slot": "page-footer-left" },
                [
                  props.copyright
                    ? h(
                        "p",
                        {
                          class: "page-footer-copyright",
                          "data-slot": "page-footer-copyright",
                        },
                        props.copyright,
                      )
                    : null,
                  slots.left?.(),
                ],
              ),
              h(
                "div",
                {
                  class: "page-footer-right",
                  "data-slot": "page-footer-right",
                },
                slots.right?.(),
              ),
            ],
          ),
        ]),
      );
    };
  },
});
