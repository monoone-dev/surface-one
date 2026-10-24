"use client";

import { createElement, type HTMLAttributes, type ReactElement } from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type ToastKind = "info" | "success" | "danger";

export interface SoneToast {
  id: number;
  message: string;
  kind: ToastKind;
  action?: { label: string };
  secondaryAction?: { label: string };
}

export interface SoneToasterProps extends HTMLAttributes<HTMLElement> {
  readonly toasts: readonly SoneToast[];
  /** The close button of the toast with this id was pressed. */
  readonly onDismiss?: (id: number) => void;
  /** The primary action of the toast with this id was pressed. */
  readonly onAction?: (id: number) => void;
  /** The secondary action of the toast with this id was pressed. */
  readonly onSecondaryAction?: (id: number) => void;
}

/**
 * `<sone-toaster>` — renders the toasts its owner keeps (`toasts`) in a polite live
 * region, each with an optional secondary and primary action and a close button. The
 * owner owns the queue: drop a toast in `onDismiss` (and in `onAction` if it should go).
 */
export function SoneToaster({
  toasts,
  onDismiss,
  onAction,
  onSecondaryAction,
  ...rest
}: SoneToasterProps): ReactElement {
  const messages = useSoneMessages();
  return createElement(
    "sone-toaster",
    { "data-slot": "toaster", ...rest },
    toasts.length > 0 ? (
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast is-${t.kind}`}
            data-slot="toast"
            data-kind={t.kind}
            role="status"
          >
            <span className="toast-msg">{t.message}</span>
            {t.secondaryAction ? (
              <SoneButton
                variant="ghost"
                size="sm"
                type="button"
                className="toast-action"
                onClick={() => onSecondaryAction?.(t.id)}
              >
                {t.secondaryAction.label}
              </SoneButton>
            ) : null}
            {t.action ? (
              <SoneButton
                size="sm"
                type="button"
                className="toast-action"
                onClick={() => onAction?.(t.id)}
              >
                {t.action.label}
              </SoneButton>
            ) : null}
            <SoneButton
              variant="ghost"
              size="icon-xs"
              type="button"
              className="toast-close"
              aria-label={messages.dismissNotification}
              onClick={() => onDismiss?.(t.id)}
            >
              <SoneIcon icon="close" />
            </SoneButton>
          </div>
        ))}
      </div>
    ) : null,
  );
}
