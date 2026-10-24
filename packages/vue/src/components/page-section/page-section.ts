import { defineComponent, h, useId, type PropType } from "vue";

import {
  pageFeatureLevel,
  toHeadingLevel,
  type HeadingLevel,
  type PageFeatureItem,
  type PageFeatureOrientation,
  type PageLink,
  type PageSectionOrientation,
  type ShellIcon,
} from "@surface-one/core";

import { renderPageLinks } from "../page-hero/page-links";
import { SoneIcon } from "../icon/icon";

export type {
  PageFeatureItem,
  PageFeatureOrientation,
  PageSectionOrientation,
} from "@surface-one/core";

const levelProp = (fallback: HeadingLevel) => ({
  type: [Number, String] as PropType<HeadingLevel | `${HeadingLevel}`>,
  default: fallback,
});

/**
 * `<sone-page-feature>` — one feature of a page section (Nuxt UI PageFeature): an icon in
 * a tile, the title as a heading (`level`, default 3) and a description; `href` makes the
 * whole feature a link. It is a list item of `SonePageFeatures`.
 */
export const SonePageFeature = defineComponent({
  name: "SonePageFeature",
  props: {
    title: { type: String, required: true },
    description: { type: String as PropType<string | null>, default: null },
    icon: { type: String as PropType<ShellIcon | null>, default: null },
    /** Makes the whole feature a link. */
    href: { type: String as PropType<string | null>, default: null },
    orientation: {
      type: String as PropType<PageFeatureOrientation>,
      default: "vertical",
    },
    /** The title's heading level, 1–6. */
    level: levelProp(3),
  },
  setup(props, { slots }) {
    return () =>
      h(
        "sone-page-feature",
        {
          "data-slot": "page-feature",
          role: "listitem",
          "data-orientation": props.orientation,
          "data-link": props.href ? "" : undefined,
        },
        [
          props.icon
            ? h(
                "span",
                {
                  class: "page-feature-icon",
                  "data-slot": "page-feature-icon",
                  "aria-hidden": "true",
                },
                h(SoneIcon, { icon: props.icon }),
              )
            : null,
          h("div", { class: "page-feature-body" }, [
            h(
              `h${toHeadingLevel(props.level, 3)}`,
              {
                class: "page-feature-title",
                "data-slot": "page-feature-title",
              },
              props.href
                ? h(
                    "a",
                    { class: "page-feature-link", href: props.href },
                    props.title,
                  )
                : props.title,
            ),
            props.description
              ? h(
                  "p",
                  {
                    class: "page-feature-description",
                    "data-slot": "page-feature-description",
                  },
                  props.description,
                )
              : null,
            slots.default?.(),
          ]),
        ],
      );
  },
});

/**
 * `<sone-page-features>` — the grid of a section's features: a list of `features` or
 * `SonePageFeature` children, as many columns as fit.
 */
export const SonePageFeatures = defineComponent({
  name: "SonePageFeatures",
  props: {
    features: {
      type: Array as PropType<readonly PageFeatureItem[]>,
      default: () => [],
    },
    orientation: {
      type: String as PropType<PageFeatureOrientation>,
      default: "vertical",
    },
    /** The features' heading level, 1–6. */
    level: levelProp(3),
  },
  setup(props, { slots }) {
    return () =>
      h("sone-page-features", { "data-slot": "page-features", role: "list" }, [
        ...props.features.map((feature, i) =>
          h(SonePageFeature, {
            key: i,
            title: feature.title,
            description: feature.description ?? null,
            icon: feature.icon ?? null,
            href: feature.href ?? null,
            orientation: props.orientation,
            level: props.level,
          }),
        ),
        slots.default?.(),
      ]);
  },
});

/**
 * `<sone-page-section>` — a section of a landing page (Nuxt UI PageSection): an icon, a
 * headline, the title as a real heading (`level`, default 2), a description, a grid of
 * `features` (their headings one level deeper) and `links`, with the default slot as
 * media or body and the `#features` / `#links` slots for your own. `horizontal` puts the
 * copy beside the media once the block is wide enough, `reverse` swaps the sides.
 */
export const SonePageSection = defineComponent({
  name: "SonePageSection",
  props: {
    title: { type: String as PropType<string | null>, default: null },
    /** A short line above the title. */
    headline: { type: String as PropType<string | null>, default: null },
    description: { type: String as PropType<string | null>, default: null },
    /** A SurfaceOne glyph in a tile above the headline. */
    icon: { type: String as PropType<ShellIcon | null>, default: null },
    /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
    links: { type: Array as PropType<readonly PageLink[]>, default: () => [] },
    /** The features grid under the copy. */
    features: {
      type: Array as PropType<readonly PageFeatureItem[]>,
      default: () => [],
    },
    orientation: {
      type: String as PropType<PageSectionOrientation>,
      default: "vertical",
    },
    /** Puts the media first (horizontal). */
    reverse: { type: Boolean, default: false },
    /** The title's heading level, 1–6. */
    level: levelProp(2),
  },
  setup(props, { slots }) {
    // useId, not a module counter: the server and the client must agree on the ids.
    const titleId = `sone-page-section-${useId()}-title`;
    return () => {
      const level = toHeadingLevel(props.level, 2);
      return h(
        "sone-page-section",
        {
          "data-slot": "page-section",
          "data-orientation": props.orientation,
          "data-reverse": props.reverse ? "" : undefined,
        },
        h(
          "section",
          {
            class: "page-section",
            "aria-labelledby": props.title ? titleId : undefined,
          },
          h("div", { class: "page-section-container" }, [
            h(
              "div",
              { class: "page-section-body", "data-slot": "page-section-body" },
              [
                h(
                  "div",
                  {
                    class: "page-section-header",
                    "data-slot": "page-section-header",
                  },
                  [
                    props.icon
                      ? h(
                          "span",
                          {
                            class: "page-section-icon",
                            "data-slot": "page-section-icon",
                            "aria-hidden": "true",
                          },
                          h(SoneIcon, { icon: props.icon }),
                        )
                      : null,
                    props.headline
                      ? h(
                          "p",
                          {
                            class: "page-section-headline",
                            "data-slot": "page-section-headline",
                          },
                          props.headline,
                        )
                      : null,
                    props.title
                      ? h(
                          `h${level}`,
                          {
                            class: "page-section-title",
                            "data-slot": "page-section-title",
                            id: titleId,
                          },
                          props.title,
                        )
                      : null,
                    props.description
                      ? h(
                          "p",
                          {
                            class: "page-section-description",
                            "data-slot": "page-section-description",
                          },
                          props.description,
                        )
                      : null,
                  ],
                ),
                props.features.length
                  ? h(SonePageFeatures, {
                      features: props.features,
                      level: pageFeatureLevel(level),
                      orientation:
                        props.orientation === "horizontal"
                          ? "horizontal"
                          : "vertical",
                    })
                  : null,
                slots.features?.(),
                h(
                  "div",
                  {
                    class: "page-section-links",
                    "data-slot": "page-section-links",
                  },
                  [...renderPageLinks(props.links, "default"), slots.links?.()],
                ),
              ],
            ),
            h(
              "div",
              {
                class: "page-section-media",
                "data-slot": "page-section-media",
              },
              slots.default?.(),
            ),
          ]),
        ),
      );
    };
  },
});
