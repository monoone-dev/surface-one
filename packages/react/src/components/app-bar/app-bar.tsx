"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { toHeadingLevel, type HeadingLevel } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export interface SoneAppBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: string;
  /** A line under the title. */
  readonly subtitle?: string | null;
  /** The title's heading level, 1–6. */
  readonly level?: HeadingLevel | `${HeadingLevel}`;
  /** Shows the back button (it also shows when `onBack` is given). */
  readonly showBack?: boolean;
  /** The back button was pressed. */
  readonly onBack?: () => void;
  /** Makes the back button a link to this URL. */
  readonly backHref?: string | null;
  /** The back button's accessible name (default: the "Back" message). */
  readonly backLabel?: string | null;
  /** Pins the bar to the top of the scrolling page. */
  readonly sticky?: boolean;
  /** What sits at the end of the bar (the Vue `#trailing` slot). */
  readonly trailing?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-app-bar>` — the top bar of a screen (the web twin of the React Native
 * `SoneAppBar`): an optional back button, the title as a real heading (`level`, default
 * 1) with a subtitle, and `trailing` actions. It renders a `<header>`; `sticky` pins it
 * to the top and its padding clears the notch. `onBack` (or `showBack`) draws a back
 * button; `backHref` makes it a link.
 */
export function SoneAppBar({
  title,
  subtitle = null,
  level: levelProp = 1,
  showBack = false,
  onBack,
  backHref = null,
  backLabel = null,
  sticky = false,
  trailing,
  ...rest
}: SoneAppBarProps): ReactElement {
  const messages = useSoneMessages();
  const level = toHeadingLevel(levelProp, 1);
  const label = backLabel ?? messages.appBarBack;
  const icon = <SoneIcon icon="arrow-left" />;
  const back = backHref ? (
    <SoneButton
      as="a"
      variant="ghost"
      size="icon"
      className="app-bar-back"
      data-slot="app-bar-back"
      href={backHref}
      aria-label={label}
    >
      {icon}
    </SoneButton>
  ) : showBack || onBack ? (
    <SoneButton
      variant="ghost"
      size="icon"
      type="button"
      className="app-bar-back"
      data-slot="app-bar-back"
      aria-label={label}
      onClick={() => onBack?.()}
    >
      {icon}
    </SoneButton>
  ) : null;
  return createElement(
    "sone-app-bar",
    {
      "data-slot": "app-bar",
      "data-sticky": sticky ? "" : undefined,
      ...rest,
    },
    <header className="app-bar" data-slot="app-bar-header">
      {back}
      <div className="app-bar-heading" data-slot="app-bar-heading">
        {createElement(
          `h${level}`,
          { className: "app-bar-title", "data-slot": "app-bar-title" },
          title,
        )}
        {subtitle ? (
          <p className="app-bar-subtitle" data-slot="app-bar-subtitle">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="app-bar-trailing">{trailing}</div>
    </header>,
  );
}
