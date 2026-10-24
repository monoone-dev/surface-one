"use client";

import {
  createElement,
  useId,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import {
  toSectionHeadingLevel,
  type SectionHeadingLevel,
} from "@surface-one/core";

import { SoneBadge } from "../badge/badge";

export type { SectionHeadingLevel } from "@surface-one/core";

export interface SoneSectionHeadingProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: string;
  /** A count in a secondary badge after the title; `null` hides it. */
  readonly count?: number | string | null;
  /** The heading level: 2, 3 or 4. */
  readonly level?: SectionHeadingLevel | `${SectionHeadingLevel}`;
  /** The end of the row (the Vue `#actions` slot). */
  readonly actions?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-section-heading>` — the heading row of a page section: a real `h2`–`h4`
 * (`level`, default 2) with the `title`, an optional `count` in a secondary badge after
 * it, and `actions` at the end of the row.
 *
 * The heading is named by its title alone (`aria-labelledby`), so a heading list reads
 * "Meetings", not "Meetings12"; the count describes it (`aria-describedby`) and is read
 * after the name ("Meetings, heading level 2, 12").
 */
export function SoneSectionHeading({
  title,
  count = null,
  level: levelProp = 2,
  actions,
  ...rest
}: SoneSectionHeadingProps): ReactElement {
  // useId, not a module counter: the server and the client must agree on the ids.
  const uid = `sone-section-heading-${useId()}`;
  const titleId = `${uid}-title`;
  const countId = `${uid}-count`;
  const level = toSectionHeadingLevel(levelProp);
  const hasCount = count !== null;
  return createElement(
    "sone-section-heading",
    { "data-slot": "section-heading", "data-level": level, ...rest },
    createElement(
      `h${level}`,
      {
        className: "heading",
        "aria-labelledby": titleId,
        "aria-describedby": hasCount ? countId : undefined,
      },
      <span className="title" data-slot="section-heading-title" id={titleId}>
        {title}
      </span>,
      hasCount ? (
        <SoneBadge variant="secondary" className="count" id={countId}>
          {String(count)}
        </SoneBadge>
      ) : null,
    ),
    <div className="actions">{actions}</div>,
  );
}
