import type { PropType } from "vue";

import { defineOverlay } from "./overlay";

export type DialogSize = "xs" | "sm" | "md" | "lg" | "xl";

/** `<sone-dialog>` — a modal dialog, teleported to `<body>`. */
export const SoneDialog = defineOverlay(
  {
    name: "SoneDialog",
    host: "sone-dialog",
    layerClass: "dialog-overlay",
    layerSlot: "dialog-overlay",
    panelClass: "dialog-content",
  },
  {
    size: { type: String as PropType<DialogSize>, default: "sm" },
    /** A click on the scrim dismisses it. */
    scrimCloses: { type: Boolean, default: true },
  },
  (p) => ({
    role: "dialog",
    slot: "dialog-content",
    closeOnScrim: p["scrimCloses"] as boolean,
    cornerClose: true,
    attrs: { "data-size": p["size"] },
  }),
);

/**
 * `<sone-alert-dialog>` — a confirmation that needs an answer: `alertdialog`, no
 * corner close, the scrim does not dismiss it (Escape still does while `dismissible`).
 */
export const SoneAlertDialog = defineOverlay(
  {
    name: "SoneAlertDialog",
    host: "sone-alert-dialog",
    layerClass: "dialog-overlay",
    layerSlot: "alert-dialog-overlay",
    panelClass: "dialog-content",
  },
  { size: { type: String as PropType<"xs" | "md">, default: "md" } },
  (p) => ({
    role: "alertdialog",
    slot: "alert-dialog-content",
    closeOnScrim: false,
    cornerClose: false,
    attrs: { "data-size": p["size"] },
  }),
);
