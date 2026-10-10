import { defineComponent, h, type PropType } from "vue";

import { SoneBadge } from "../badge/badge";

export type SectionHeadingLevel = 2 | 3 | 4;

const toLevel = (v: unknown): SectionHeadingLevel => {
  const n = Number(v);
  return n === 3 || n === 4 ? n : 2;
};

/**
 * `<sone-section-heading>` — the heading row of a page section: a real `h2`–`h4`
 * (`level`, default 2) with the `title`, an optional `count` in a secondary badge after
 * it, and the `#actions` slot at the end of the row.
 */
export const SoneSectionHeading = defineComponent({
  name: "SoneSectionHeading",
  props: {
    title: { type: String, required: true },
    /** A count in a secondary badge after the title; `null` hides it. */
    count: {
      type: [Number, String] as PropType<number | string | null>,
      default: null,
    },
    /** The heading level: 2, 3 or 4. */
    level: {
      type: [Number, String] as PropType<
        SectionHeadingLevel | `${SectionHeadingLevel}`
      >,
      default: 2,
    },
  },
  setup(props, { slots }) {
    return () => {
      const level = toLevel(props.level);
      return h(
        "sone-section-heading",
        { "data-slot": "section-heading", "data-level": level },
        [
          h(`h${level}`, { class: "heading" }, [
            h(
              "span",
              { class: "title", "data-slot": "section-heading-title" },
              props.title,
            ),
            props.count !== null
              ? h(SoneBadge, { variant: "secondary", class: "count" }, () =>
                  String(props.count),
                )
              : null,
          ]),
          h("div", { class: "actions" }, slots.actions?.()),
        ],
      );
    };
  },
});
