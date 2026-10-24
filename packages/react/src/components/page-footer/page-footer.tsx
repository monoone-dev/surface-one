"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  pageFooterLinkRel,
  toHeadingLevel,
  type HeadingLevel,
  type PageFooterColumn,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";

export type { PageFooterColumn, PageFooterLink } from "@surface-one/core";

export interface SonePageFooterProps extends HTMLAttributes<HTMLElement> {
  readonly columns?: readonly PageFooterColumn[];
  /** The copyright line of the bottom row. */
  readonly copyright?: string | null;
  /** Names the columns' navigation landmark (default: the "Footer" message). */
  readonly ariaLabel?: string | null;
  /** The column titles' heading level, 1–6. */
  readonly level?: HeadingLevel | `${HeadingLevel}`;
  /** The logo and a line about the site, before the columns. */
  readonly brand?: ReactNode;
  /** The start of the bottom row, after the copyright. */
  readonly left?: ReactNode;
  /** The end of the bottom row: social links, a theme switch. */
  readonly right?: ReactNode;
  /** After the columns. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-footer>` — the footer of a site (Nuxt UI Footer and FooterColumns): the
 * `brand`, titled `columns` of links in a named `nav` (column titles are headings,
 * `level` 3 by default), then a bottom row with the `copyright` line, `left` and
 * `right`. It renders a `<footer>`.
 */
export function SonePageFooter({
  columns = [],
  copyright = null,
  ariaLabel = null,
  level: levelProp = 3,
  brand,
  left,
  right,
  children,
  ...rest
}: SonePageFooterProps): ReactElement {
  const messages = useSoneMessages();
  const level = toHeadingLevel(levelProp, 3);
  return createElement(
    "sone-page-footer",
    { "data-slot": "page-footer", ...rest },
    <footer className="page-footer">
      <div className="page-footer-top" data-slot="page-footer-top">
        <div className="page-footer-brand" data-slot="page-footer-brand">
          {brand}
        </div>
        {columns.length ? (
          <nav
            className="page-footer-columns"
            data-slot="page-footer-columns"
            aria-label={ariaLabel ?? messages.pageFooterLabel}
          >
            {columns.map((column, i) => (
              <div
                key={i}
                className="page-footer-column"
                data-slot="page-footer-column"
              >
                {createElement(
                  `h${level}`,
                  { className: "page-footer-column-label" },
                  column.label,
                )}
                <ul className="page-footer-links">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a
                        className="page-footer-link"
                        data-slot="page-footer-link"
                        href={link.href}
                        target={link.target}
                        rel={pageFooterLinkRel(link) ?? undefined}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
        {children}
      </div>
      <div className="page-footer-bottom" data-slot="page-footer-bottom">
        <div className="page-footer-left" data-slot="page-footer-left">
          {copyright ? (
            <p
              className="page-footer-copyright"
              data-slot="page-footer-copyright"
            >
              {copyright}
            </p>
          ) : null}
          {left}
        </div>
        <div className="page-footer-right" data-slot="page-footer-right">
          {right}
        </div>
      </div>
    </footer>,
  );
}
