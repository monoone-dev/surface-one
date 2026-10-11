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

export interface SoneSheetOwnProps {
  readonly side?: SheetSide;
  readonly size?: SheetSize;
  /** A click on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
}

/** `<sone-sheet>` — a modal panel that slides in from a side. */
export const SoneSheet = defineOverlay<SoneSheetOwnProps>(
  {
    name: "SoneSheet",
    host: "sone-sheet",
    layerClass: "sheet-overlay",
    layerSlot: "sheet-overlay",
    panelClass: "sheet-content",
    closeSlot: "sheet-close",
  },
  ["side", "size", "scrimCloses"],
  (p) => ({
    role: "dialog",
    slot: "sheet-content",
    closeOnScrim: p.scrimCloses ?? true,
    cornerClose: true,
    attrs: { "data-side": p.side ?? "right", "data-size": p.size ?? "default" },
  }),
);

// The sheet uses the dialog parts (as `[soneSheetHeader]` etc. do in Angular).
export const SoneSheetHeader = SoneDialogHeader;
export const SoneSheetTitle = SoneDialogTitle;
export const SoneSheetDescription = SoneDialogDescription;
export const SoneSheetMedia = SoneDialogMedia;
export const SoneSheetFooter = SoneDialogFooter;
