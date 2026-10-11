"use client";

import { createElement, type ElementType } from "react";

import { useSoneMessages } from "../../context/messages";
import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";
import { SoneButton } from "../button/button";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

export type AlertActionsAlign = "start" | "center" | "end";

export interface SoneAlertOwnProps {
  readonly variant?: AlertVariant;
  readonly dismissible?: boolean;
  /** The close button's name (default: the "Dismiss" message). */
  readonly closeLabel?: string | null;
  /** Where `SoneAlertAction` sits against a title + description; `null` keeps the default. */
  readonly actionsAlign?: AlertActionsAlign | null;
  /** The close button was pressed; the owner removes the alert. */
  readonly onDismissed?: () => void;
}

const CLOSE = (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="m5.5 5.5 9 9M14.5 5.5l-9 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * `[soneAlert]` — `dismissible` adds a close button at the end and calls
 * `onDismissed`; the owner removes the alert.
 */
export function SoneAlert<E extends ElementType = "div">({
  as,
  variant = "default",
  dismissible = false,
  closeLabel = null,
  actionsAlign = null,
  onDismissed,
  className,
  children,
  ...rest
}: PolymorphicProps<E, SoneAlertOwnProps>) {
  const messages = useSoneMessages();
  const label = closeLabel ?? messages.dismiss;
  return createElement(
    as ?? "div",
    {
      "data-slot": "alert",
      "data-variant": variant,
      "data-dismissible": flag(dismissible),
      "data-actions-align": actionsAlign ?? undefined,
      ...rest,
      className: cx("alert", className),
    },
    children,
    dismissible ? (
      <SoneButton
        variant="ghost"
        size="icon-xs"
        type="button"
        className="alert-close"
        data-slot="alert-close"
        aria-label={label}
        title={label}
        onClick={() => onDismissed?.()}
      >
        {CLOSE}
      </SoneButton>
    ) : null,
  );
}

export const SoneAlertTitle = definePart({
  name: "SoneAlertTitle",
  tag: "p",
  className: "alert-title",
  slot: "alert-title",
});

export const SoneAlertDescription = definePart({
  name: "SoneAlertDescription",
  tag: "p",
  className: "alert-description",
  slot: "alert-description",
});

export const SoneAlertAction = definePart({
  name: "SoneAlertAction",
  tag: "div",
  className: "alert-action",
  slot: "alert-action",
});
