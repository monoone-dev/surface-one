import { SoneOverlay, type SoneOverlayProps } from "./overlay";

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface SoneDialogProps extends SoneOverlayProps {
  readonly size?: DialogSize;
  /** A press on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
}

/** `<sone-dialog>` — a modal dialog, centred over the scrim, with a corner close. */
export function SoneDialog({
  size = "sm",
  scrimCloses = true,
  ...rest
}: SoneDialogProps) {
  return (
    <SoneOverlay
      {...rest}
      settings={{
        kind: "dialog",
        size,
        closeOnScrim: scrimCloses,
        cornerClose: true,
      }}
    />
  );
}

export interface SoneAlertDialogProps extends SoneOverlayProps {
  readonly size?: "xs" | "md";
}

/**
 * `<sone-alert-dialog>` — a confirmation that needs an answer: `alertdialog`, no
 * corner close, the scrim does not dismiss it (the back button still does while
 * `dismissible`).
 */
export function SoneAlertDialog({
  size = "md",
  ...rest
}: SoneAlertDialogProps) {
  return (
    <SoneOverlay
      {...rest}
      settings={{
        kind: "alertdialog",
        size,
        closeOnScrim: false,
        cornerClose: false,
      }}
    />
  );
}
