"use client";

import {
  Children,
  createElement,
  isValidElement,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

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

import { SoneIcon } from "../icon/icon";
import { renderPageLinks } from "../page-hero/page-links";

export type {
  PageFeatureItem,
  PageFeatureOrientation,
  PageSectionOrientation,
} from "@surface-one/core";

type Level = HeadingLevel | `${HeadingLevel}`;

export interface SonePageFeatureProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: string;
  readonly description?: string | null;
  readonly icon?: ShellIcon | null;
  /** Makes the whole feature a link. */
  readonly href?: string | null;
  readonly orientation?: PageFeatureOrientation;
  /** The title's heading level, 1–6. */
  readonly level?: Level;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-feature>` — one feature of a page section (Nuxt UI PageFeature): an icon in
 * a tile, the title as a heading (`level`, default 3) and a description; `href` makes the
 * whole feature a link. It is a list item of `SonePageFeatures`.
 */
export function SonePageFeature({
  title,
  description = null,
  icon = null,
  href = null,
  orientation = "vertical",
  level = 3,
  children,
  ...rest
}: SonePageFeatureProps): ReactElement {
  return createElement(
    "sone-page-feature",
    {
      "data-slot": "page-feature",
      role: "listitem",
      "data-orientation": orientation,
      "data-link": href ? "" : undefined,
      ...rest,
    },
    icon ? (
      <span
        className="page-feature-icon"
        data-slot="page-feature-icon"
        aria-hidden="true"
      >
        <SoneIcon icon={icon} />
      </span>
    ) : null,
    <div className="page-feature-body">
      {createElement(
        `h${toHeadingLevel(level, 3)}`,
        { className: "page-feature-title", "data-slot": "page-feature-title" },
        href ? (
          <a className="page-feature-link" href={href}>
            {title}
          </a>
        ) : (
          title
        ),
      )}
      {description ? (
        <p
          className="page-feature-description"
          data-slot="page-feature-description"
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>,
  );
}

export interface SonePageFeaturesProps extends HTMLAttributes<HTMLElement> {
  readonly features?: readonly PageFeatureItem[];
  readonly orientation?: PageFeatureOrientation;
  /** The features' heading level, 1–6. */
  readonly level?: Level;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-features>` — the grid of a section's features: a list of `features` or
 * `SonePageFeature` children, as many columns as fit.
 */
export function SonePageFeatures({
  features = [],
  orientation = "vertical",
  level = 3,
  children,
  ...rest
}: SonePageFeaturesProps): ReactElement {
  return createElement(
    "sone-page-features",
    { "data-slot": "page-features", role: "list", ...rest },
    features.map((feature, i) => (
      <SonePageFeature
        key={i}
        title={feature.title}
        description={feature.description ?? null}
        icon={feature.icon ?? null}
        href={feature.href ?? null}
        orientation={orientation}
        level={level}
      />
    )),
    children,
  );
}

export interface SonePageSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title?: string | null;
  /** A short line above the title. */
  readonly headline?: string | null;
  readonly description?: string | null;
  /** A SurfaceOne glyph in a tile above the headline. */
  readonly icon?: ShellIcon | null;
  /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
  readonly links?: readonly PageLink[];
  /** The features grid under the copy. */
  readonly features?: readonly PageFeatureItem[];
  readonly orientation?: PageSectionOrientation;
  /** Puts the media first (horizontal). */
  readonly reverse?: boolean;
  /** The title's heading level, 1–6. */
  readonly level?: Level;
  /** Your own actions after the links (the Vue `#links` slot). */
  readonly actions?: ReactNode;
  /** The media or body; `SonePageFeatures` children go under the copy (the Vue `#features` slot). */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-section>` — a section of a landing page (Nuxt UI PageSection): an icon, a
 * headline, the title as a real heading (`level`, default 2), a description, a grid of
 * `features` (their headings one level deeper) and `links`, with `children` as media or
 * body. `horizontal` puts the copy beside the media once the block is wide enough,
 * `reverse` swaps the sides.
 */
export function SonePageSection({
  title = null,
  headline = null,
  description = null,
  icon = null,
  links = [],
  features = [],
  orientation = "vertical",
  reverse = false,
  level: levelProp = 2,
  actions,
  children,
  ...rest
}: SonePageSectionProps): ReactElement {
  // useId, not a module counter: the server and the client must agree on the ids.
  const titleId = `sone-page-section-${useId()}-title`;
  const level = toHeadingLevel(levelProp, 2);
  const all = Children.toArray(children);
  const isFeatures = (c: ReactNode) =>
    isValidElement(c) && c.type === SonePageFeatures;
  return createElement(
    "sone-page-section",
    {
      "data-slot": "page-section",
      "data-orientation": orientation,
      "data-reverse": reverse ? "" : undefined,
      ...rest,
    },
    <section
      className="page-section"
      aria-labelledby={title ? titleId : undefined}
    >
      <div className="page-section-container">
        <div className="page-section-body" data-slot="page-section-body">
          <div className="page-section-header" data-slot="page-section-header">
            {icon ? (
              <span
                className="page-section-icon"
                data-slot="page-section-icon"
                aria-hidden="true"
              >
                <SoneIcon icon={icon} />
              </span>
            ) : null}
            {headline ? (
              <p
                className="page-section-headline"
                data-slot="page-section-headline"
              >
                {headline}
              </p>
            ) : null}
            {title
              ? createElement(
                  `h${level}`,
                  {
                    className: "page-section-title",
                    "data-slot": "page-section-title",
                    id: titleId,
                  },
                  title,
                )
              : null}
            {description ? (
              <p
                className="page-section-description"
                data-slot="page-section-description"
              >
                {description}
              </p>
            ) : null}
          </div>
          {features.length ? (
            <SonePageFeatures
              features={features}
              level={pageFeatureLevel(level)}
              orientation={
                orientation === "horizontal" ? "horizontal" : "vertical"
              }
            />
          ) : null}
          {all.filter(isFeatures)}
          <div className="page-section-links" data-slot="page-section-links">
            {renderPageLinks(links, "default")}
            {actions}
          </div>
        </div>
        <div className="page-section-media" data-slot="page-section-media">
          {all.filter((c) => !isFeatures(c))}
        </div>
      </div>
    </section>,
  );
}
