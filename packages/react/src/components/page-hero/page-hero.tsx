"use client";

import {
  createElement,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  toHeadingLevel,
  type HeadingLevel,
  type PageLink,
} from "@surface-one/core";

import { renderPageLinks } from "./page-links";

export type { PageLink } from "@surface-one/core";
export type PageHeroOrientation = "vertical" | "horizontal";

export interface SonePageHeroProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: string;
  /** A short line above the title. */
  readonly headline?: string | null;
  readonly description?: string | null;
  /** Calls to action, drawn as buttons (the first `default`, the rest `outline`). */
  readonly links?: readonly PageLink[];
  readonly orientation?: PageHeroOrientation;
  /** Puts the media first (horizontal). */
  readonly reverse?: boolean;
  /** The title's heading level, 1–6. */
  readonly level?: HeadingLevel | `${HeadingLevel}`;
  /** Your own actions after the links (the Vue `#links` slot). */
  readonly actions?: ReactNode;
  /** The media. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-hero>` — the opening block of a landing page (Nuxt UI PageHero): a
 * headline, the title as a real heading (`level`, default 1), a description and call-to-
 * action `links`, with `children` as media. `horizontal` puts the copy beside the media
 * once the block is wide enough, `reverse` swaps the sides; `actions` adds your own. It
 * is a `section` named by its title.
 */
export function SonePageHero({
  title,
  headline = null,
  description = null,
  links = [],
  orientation = "vertical",
  reverse = false,
  level = 1,
  actions,
  children,
  ...rest
}: SonePageHeroProps): ReactElement {
  // useId, not a module counter: the server and the client must agree on the ids.
  const titleId = `sone-page-hero-${useId()}-title`;
  return createElement(
    "sone-page-hero",
    {
      "data-slot": "page-hero",
      "data-orientation": orientation,
      "data-reverse": reverse ? "" : undefined,
      ...rest,
    },
    <section className="page-hero" aria-labelledby={titleId}>
      <div className="page-hero-container">
        <div className="page-hero-body" data-slot="page-hero-body">
          {headline ? (
            <p className="page-hero-headline" data-slot="page-hero-headline">
              {headline}
            </p>
          ) : null}
          {createElement(
            `h${toHeadingLevel(level, 1)}`,
            {
              className: "page-hero-title",
              "data-slot": "page-hero-title",
              id: titleId,
            },
            title,
          )}
          {description ? (
            <p
              className="page-hero-description"
              data-slot="page-hero-description"
            >
              {description}
            </p>
          ) : null}
          <div className="page-hero-links" data-slot="page-hero-links">
            {renderPageLinks(links, "lg")}
            {actions}
          </div>
        </div>
        <div className="page-hero-media" data-slot="page-hero-media">
          {children}
        </div>
      </div>
    </section>,
  );
}
