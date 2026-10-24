import type { ReactElement } from "react";
import {
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogMedia,
  SoneDialogTitle,
} from "../dialog/dialog-parts";
import {
  SoneOverlay,
  type SheetSide,
  type SoneOverlayProps,
} from "../dialog/overlay";

export type { SheetSide };
export type SheetSize = "default" | "lg";

export interface SoneSheetProps extends SoneOverlayProps {
  /** The edge it slides in from — `bottom` by default on mobile (the web's is `right`). */
  readonly side?: SheetSide;
  /** The width of a `left` / `right` sheet. */
  readonly size?: SheetSize;
  /** A press on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
}

/** `<sone-sheet>` — a modal panel that slides in from a side (not under reduced motion). */
export function SoneSheet({
  side = "bottom",
  size = "default",
  scrimCloses = true,
  ...rest
}: SoneSheetProps): ReactElement {
  return (
    <SoneOverlay
      {...rest}
      settings={{
        kind: "sheet",
        size,
        side,
        closeOnScrim: scrimCloses,
        cornerClose: true,
      }}
    />
  );
}

// The sheet uses the dialog parts (as `[soneSheetHeader]` etc. do in Angular).
export const SoneSheetHeader = SoneDialogHeader;
export const SoneSheetTitle = SoneDialogTitle;
export const SoneSheetDescription = SoneDialogDescription;
export const SoneSheetMedia = SoneDialogMedia;
export const SoneSheetFooter = SoneDialogFooter;
