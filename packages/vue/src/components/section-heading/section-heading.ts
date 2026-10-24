import { defineComponent, h, useId, type PropType } from "vue";

import {
  toSectionHeadingLevel,
  type SectionHeadingLevel,
} from "@surface-one/core";

import { SoneBadge } from "../badge/badge";

export type { SectionHeadingLevel } from "@surface-one/core";

/**
 * `<sone-section-heading>` — the heading row of a page section: a real `h2`–`h4`
 * (`level`, default 2) with the `title`, an optional `count` in a secondary badge after
 * it, and the `#actions` slot at the end of the row.
 *
 * The heading is named by its title alone (`aria-labelledby`), so a heading list reads
 * "Meetings", not "Meetings12"; the count describes it (`aria-describedby`) and is read
 * after the name ("Meetings, heading level 2, 12").
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
    // useId, not a module counter: the server and the client must agree on the ids.
    const uid = `sone-section-heading-${useId()}`;
    const titleId = `${uid}-title`;
    const countId = `${uid}-count`;
    return () => {
      const level = toSectionHeadingLevel(props.level);
      const hasCount = props.count !== null;
      return h(
        "sone-section-heading",
        { "data-slot": "section-heading", "data-level": level },
        [
          h(
            `h${level}`,
            {
              class: "heading",
              "aria-labelledby": titleId,
              "aria-describedby": hasCount ? countId : undefined,
            },
            [
              h(
                "span",
                {
                  class: "title",
                  "data-slot": "section-heading-title",
                  id: titleId,
                },
                props.title,
              ),
              hasCount
                ? h(
                    SoneBadge,
                    { variant: "secondary", class: "count", id: countId },
                    () => String(props.count),
                  )
                : null,
            ],
          ),
          h("div", { class: "actions" }, slots.actions?.()),
        ],
      );
    };
  },
});
