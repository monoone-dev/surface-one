import type { ReactElement } from "react";

import { useControllable } from "@surface-one/core/react/controllable";
import {
  SoneDialogClose,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogMedia,
  SoneDialogTitle,
} from "../dialog/dialog-parts";
import { SoneOverlay, type SoneOverlayProps } from "../dialog/overlay";

export type DrawerSide = "top" | "bottom";

export interface SoneDrawerProps extends SoneOverlayProps {
  /** The edge it comes from (`bottom`). */
  readonly side?: DrawerSide;
  /** A press on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
  /** The drag handle that swipes it (on by default). */
  readonly handle?: boolean;
  /** Visible fractions it rests at, ascending (e.g. `[0.5, 1]`). */
  readonly snapPoints?: readonly number[];
  /** The snap point it rests at (controlled), with `onActiveSnapPointChange`; or `defaultActiveSnapPoint` (the first). */
  readonly activeSnapPoint?: number | null;
  readonly defaultActiveSnapPoint?: number | null;
  readonly onActiveSnapPointChange?: (snap: number | null) => void;
}

const NO_SNAPS: readonly number[] = [];

/**
 * `<sone-drawer>` — the React Native twin of `sone-drawer`: the bottom (or top) sheet
 * with a drag handle that swipes it away (past a quarter of its height, or a flick) or
 * between `snapPoints`. The scrim, the back button and a `SoneDrawerClose` dismiss it
 * too; no corner close by default (`showClose` brings it back).
 */
export function SoneDrawer({
  side = "bottom",
  scrimCloses = true,
  handle = true,
  snapPoints = NO_SNAPS,
  activeSnapPoint,
  defaultActiveSnapPoint = null,
  onActiveSnapPointChange,
  showClose = false,
  ...rest
}: SoneDrawerProps): ReactElement {
  const [active, setActive] = useControllable<number | null>(
    activeSnapPoint,
    defaultActiveSnapPoint,
    onActiveSnapPointChange,
  );
  return (
    <SoneOverlay
      {...rest}
      showClose={showClose}
      settings={{
        kind: "sheet",
        size: "default",
        side,
        closeOnScrim: scrimCloses,
        cornerClose: true,
        drawer: {
          handle,
          snapPoints,
          activeSnapPoint: active,
          setActiveSnapPoint: setActive,
        },
      }}
    />
  );
}

// The drawer uses the dialog parts (as `[soneDrawerHeader]` etc. do in Angular).
export const SoneDrawerHeader = SoneDialogHeader;
export const SoneDrawerTitle = SoneDialogTitle;
export const SoneDrawerDescription = SoneDialogDescription;
export const SoneDrawerMedia = SoneDialogMedia;
export const SoneDrawerFooter = SoneDialogFooter;
export const SoneDrawerClose = SoneDialogClose;
