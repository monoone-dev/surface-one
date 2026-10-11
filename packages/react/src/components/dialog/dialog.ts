import { defineOverlay } from "./overlay";

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SoneDialogOwnProps {
  readonly size?: DialogSize;
  /** A click on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
}

/** `<sone-dialog>` — a modal dialog, portaled to `<body>`. */
export const SoneDialog = defineOverlay<SoneDialogOwnProps>(
  {
    name: "SoneDialog",
    host: "sone-dialog",
    layerClass: "dialog-overlay",
    layerSlot: "dialog-overlay",
    panelClass: "dialog-content",
  },
  ["size", "scrimCloses"],
  (p) => ({
    role: "dialog",
    slot: "dialog-content",
    closeOnScrim: p.scrimCloses ?? true,
    cornerClose: true,
    attrs: { "data-size": p.size ?? "sm" },
  }),
);

export interface SoneAlertDialogOwnProps {
  readonly size?: "xs" | "md";
}

/**
 * `<sone-alert-dialog>` — a confirmation that needs an answer: `alertdialog`, no
 * corner close, the scrim does not dismiss it (Escape still does while `dismissible`).
 */
export const SoneAlertDialog = defineOverlay<SoneAlertDialogOwnProps>(
  {
    name: "SoneAlertDialog",
    host: "sone-alert-dialog",
    layerClass: "dialog-overlay",
    layerSlot: "alert-dialog-overlay",
    panelClass: "dialog-content",
  },
  ["size"],
  (p) => ({
    role: "alertdialog",
    slot: "alert-dialog-content",
    closeOnScrim: false,
    cornerClose: false,
    attrs: { "data-size": p.size ?? "md" },
  }),
);
