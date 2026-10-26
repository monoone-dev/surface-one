"use client";

import {
  createElement,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import type { RailBadge, ShellIcon } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneIcon } from "../icon/icon";

export type { RailBadge } from "@surface-one/core";

export interface SoneRailProps extends HTMLAttributes<HTMLElement> {
  /** Names the navigation landmark (default: the "Main" message). */
  readonly ariaLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-rail>` — a narrow column of icon buttons beside the page (on the glass in the
 * Surface skin). A `nav` landmark named by `ariaLabel`; put the buttons in
 * `SoneRailGroup` blocks — the first sits at the top, the last at the bottom.
 */
export function SoneRail({
  ariaLabel = null,
  children,
  ...rest
}: SoneRailProps): ReactElement {
  const messages = useSoneMessages();
  return createElement(
    "sone-rail",
    { "data-slot": "rail", ...rest },
    <nav
      className="rail"
      data-slot="rail-nav"
      aria-label={ariaLabel ?? messages.railLabel}
    >
      {children}
    </nav>,
  );
}

/** A column of rail buttons. */
export function SoneRailGroup({
  className,
  ...rest
}: ComponentPropsWithRef<"div">): ReactElement {
  return (
    <div
      {...rest}
      className={className ? `rail-group ${className}` : "rail-group"}
      data-slot="rail-group"
    />
  );
}

export interface SoneRailButtonProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children" | "type"
> {
  readonly icon: ShellIcon;
  /** The accessible name and the tooltip. */
  readonly label: string;
  /** The place on screen now (`aria-current="page"`). */
  readonly current?: boolean;
  /** A status dot in the corner. */
  readonly badge?: RailBadge | null;
}

/**
 * `<sone-rail-button>` — one place on a rail: a square icon button whose `label` is its
 * accessible name and its tooltip. `current` sets `aria-current="page"`; `badge` adds a
 * status dot. `className` / `style` style the host; every other prop goes to the button.
 */
export function SoneRailButton({
  icon,
  label,
  current = false,
  badge = null,
  className,
  style,
  ...control
}: SoneRailButtonProps): ReactElement {
  return createElement(
    "sone-rail-button",
    { "data-slot": "rail-button", className, style },
    <button
      {...control}
      type="button"
      className="rail-button"
      data-slot="rail-button-trigger"
      aria-label={label}
      title={label}
      aria-current={current ? "page" : undefined}
    >
      <SoneIcon icon={icon} />
      {badge ? (
        <span
          className="rail-badge"
          data-slot="rail-badge"
          data-badge={badge}
          aria-hidden="true"
        />
      ) : null}
    </button>,
  );
}
