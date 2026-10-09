import type { PropType } from "vue";

import { defineOverlay } from "../dialog/overlay";
import {
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogMedia,
  SoneDialogTitle,
} from "../dialog/dialog-parts";

export type SheetSide = "top" | "right" | "bottom" | "left";
export type SheetSize = "default" | "lg";

/** `<sone-sheet>` — a modal panel that slides in from a side. */
export const SoneSheet = defineOverlay(
  {
    name: "SoneSheet",
    host: "sone-sheet",
    layerClass: "sheet-overlay",
    layerSlot: "sheet-overlay",
    panelClass: "sheet-content",
    closeSlot: "sheet-close",
  },
  {
    side: { type: String as PropType<SheetSide>, default: "right" },
    size: { type: String as PropType<SheetSize>, default: "default" },
    scrimCloses: { type: Boolean, default: true },
  },
  (p) => ({
    role: "dialog",
    slot: "sheet-content",
    closeOnScrim: p["scrimCloses"] as boolean,
    cornerClose: true,
    attrs: { "data-side": p["side"], "data-size": p["size"] },
  }),
);

// The sheet uses the dialog parts (as `[soneSheetHeader]` etc. do in Angular).
export const SoneSheetHeader = SoneDialogHeader;
export const SoneSheetTitle = SoneDialogTitle;
export const SoneSheetDescription = SoneDialogDescription;
export const SoneSheetMedia = SoneDialogMedia;
export const SoneSheetFooter = SoneDialogFooter;
