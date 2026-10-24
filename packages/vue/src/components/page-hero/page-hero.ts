import { defineComponent, h, useId, type PropType } from "vue";

import {
  toHeadingLevel,
  type HeadingLevel,
  type PageLink,
} from "@surface-one/core";

import { renderPageLinks } from "./page-links";

export type { PageLink } from "@surface-one/core";
export type PageHeroOrientation = "vertical" | "horizontal";

/**
 * `<sone-page-hero>` — the opening block of a landing page (Nuxt UI PageHero): a
 * headline, the title as a real heading (`level`, default 1), a description and call-to-
 * action `links`, with the default slot as media. `horizontal` puts the copy beside the
 * media once the block is wide enough, `reverse` swaps the sides; the `#links` slot adds
 * your own actions. It is a `section` named by its title.
 */
export const SonePageHero = defineComponent({
  name: "SonePageHero",
  props: {
    title: { type: String, required: true },
    /** A short line above the title. */
    headline: { type: String as PropType<string | null>, default: null },
    description: { type: String as PropType<string | null>, default: null },
    /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
    links: { type: Array as PropType<readonly PageLink[]>, default: () => [] },
    orientation: {
      type: String as PropType<PageHeroOrientation>,
      default: "vertical",
    },
    /** Puts the media first (horizontal). */
    reverse: { type: Boolean, default: false },
    /** The title's heading level, 1–6. */
    level: {
      type: [Number, String] as PropType<HeadingLevel | `${HeadingLevel}`>,
      default: 1,
    },
  },
  setup(props, { slots }) {
    // useId, not a module counter: the server and the client must agree on the ids.
    const titleId = `sone-page-hero-${useId()}-title`;
    return () =>
      h(
        "sone-page-hero",
        {
          "data-slot": "page-hero",
          "data-orientation": props.orientation,
          "data-reverse": props.reverse ? "" : undefined,
        },
        h("section", { class: "page-hero", "aria-labelledby": titleId }, [
          h("div", { class: "page-hero-container" }, [
            h(
              "div",
              { class: "page-hero-body", "data-slot": "page-hero-body" },
              [
                props.headline
                  ? h(
                      "p",
                      {
                        class: "page-hero-headline",
                        "data-slot": "page-hero-headline",
                      },
                      props.headline,
                    )
                  : null,
                h(
                  `h${toHeadingLevel(props.level, 1)}`,
                  {
                    class: "page-hero-title",
                    "data-slot": "page-hero-title",
                    id: titleId,
                  },
                  props.title,
                ),
                props.description
                  ? h(
                      "p",
                      {
                        class: "page-hero-description",
                        "data-slot": "page-hero-description",
                      },
                      props.description,
                    )
                  : null,
                h(
                  "div",
                  { class: "page-hero-links", "data-slot": "page-hero-links" },
                  [...renderPageLinks(props.links, "lg"), slots.links?.()],
                ),
              ],
            ),
            h(
              "div",
              { class: "page-hero-media", "data-slot": "page-hero-media" },
              slots.default?.(),
            ),
          ]),
        ]),
      );
  },
});
