"use client";

import { createElement, type ReactElement, type ReactNode } from "react";

import { SoneDialog, type DialogSize } from "../dialog/dialog";

export interface SoneCommandDialogProps {
  /** Names the dialog for assistive technology. */
  readonly label: string;
  readonly size?: DialogSize;
  /** Escape or the scrim dismissed it. */
  readonly onDismiss?: () => void;
  readonly children?: ReactNode;
}

/**
 * `<sone-command-dialog>` — a `SoneDialog` sized and padded for a command palette
 * (shadcn/ui CommandDialog). Put a `SoneCommand` in it; render it conditionally and
 * close it on `onDismiss`, like any dialog. Escape, the scrim and focus return come
 * from the dialog.
 */
export function SoneCommandDialog({
  label,
  size = "md",
  onDismiss,
  children,
}: SoneCommandDialogProps): ReactElement {
  return createElement(
    "sone-command-dialog",
    { "data-slot": "command-dialog" },
    <SoneDialog
      className="command-dialog"
      size={size}
      ariaLabel={label}
      showClose={false}
      onDismiss={onDismiss}
    >
      {children}
    </SoneDialog>,
  );
}
