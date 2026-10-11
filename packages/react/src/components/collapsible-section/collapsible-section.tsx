"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

import { useControllable } from "../../utils/controllable";
import { SoneBadge } from "../badge/badge";
import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleTrigger,
} from "../collapsible/collapsible";

const CHEVRON = (
  <svg
    className="collapsible-icon"
    data-slot="collapsible-icon"
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface SoneCollapsibleSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** The section's name, shown in the header button. */
  readonly title: string;
  /** A quiet line after the title (a date range, a source). */
  readonly subtitle?: string | null;
  /** A count in a secondary badge after the title; `null` hides it. */
  readonly count?: number | string | null;
  /** Whether the body is shown, controlled with `onOpenChange` (the Vue `v-model:open`). */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly disabled?: boolean;
  /** At the end of the header, outside the button (the Vue `#actions` slot). */
  readonly actions?: ReactNode;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-collapsible-section>` — a titled section that folds, built on the Collapsible: a
 * full-width header button (chevron, `title`, optional `subtitle` and a secondary-badge
 * `count`) that keeps `aria-expanded` / `aria-controls` in sync, and the children below
 * it. `open` / `defaultOpen` / `onOpenChange` bind the state. `actions` sit at the end of
 * the header, outside the button.
 */
export function SoneCollapsibleSection({
  title,
  subtitle = null,
  count = null,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  actions,
  children,
  ...rest
}: SoneCollapsibleSectionProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  return createElement(
    "sone-collapsible-section",
    {
      ...rest,
      "data-slot": "collapsible-section",
      "data-state": open ? "open" : "closed",
    },
    <SoneCollapsible
      className="section"
      expanded={open}
      disabled={disabled}
      onExpandedChange={setOpen}
    >
      <div className="header" data-slot="collapsible-section-header">
        <SoneCollapsibleTrigger className="trigger">
          {CHEVRON}
          <span className="heading">
            <span className="title" data-slot="collapsible-section-title">
              {title}
            </span>
            {subtitle ? (
              <span
                className="subtitle"
                data-slot="collapsible-section-subtitle"
              >
                {subtitle}
              </span>
            ) : null}
          </span>
          {count !== null ? (
            <SoneBadge
              variant="secondary"
              data-slot="collapsible-section-count"
            >
              {String(count)}
            </SoneBadge>
          ) : null}
        </SoneCollapsibleTrigger>
        <div className="actions">{actions}</div>
      </div>
      <SoneCollapsibleContent
        className="body"
        data-slot="collapsible-section-content"
      >
        {children}
      </SoneCollapsibleContent>
    </SoneCollapsible>,
  );
}
