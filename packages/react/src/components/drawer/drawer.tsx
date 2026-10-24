"use client";

import {
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { createDrawerSwipe, type DrawerSide } from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { defineOverlay } from "../dialog/overlay";
import {
  SoneDialogClose,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogMedia,
  SoneDialogTitle,
} from "../dialog/dialog-parts";

export type { DrawerSide };

export interface SoneDrawerOwnProps {
  /** The edge it comes from (`bottom`). */
  readonly side?: DrawerSide;
  /** A click on the scrim dismisses it. */
  readonly scrimCloses?: boolean;
  /** The drag handle at the inner edge (shown for `bottom` and `top`). */
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
 * `<sone-drawer>` — the React twin of `sone-drawer`: a sheet from the `bottom` (or another
 * `side`) with a drag handle, dismissed by a swipe toward its edge as well as Escape and
 * the scrim. `snapPoints` (visible fractions, ascending) let it rest part-open
 * (`activeSnapPoint` / `onActiveSnapPointChange`); the handle cycles them. No corner
 * close by default (`showClose` brings it back).
 */
export const SoneDrawer = defineOverlay<SoneDrawerOwnProps>(
  {
    name: "SoneDrawer",
    host: "sone-drawer",
    layerClass: "sheet-overlay drawer-overlay",
    layerSlot: "drawer-overlay",
    panelClass: "sheet-content drawer-content",
    closeSlot: "drawer-close",
    showCloseDefault: false,
  },
  [
    "side",
    "scrimCloses",
    "handle",
    "snapPoints",
    "activeSnapPoint",
    "defaultActiveSnapPoint",
    "onActiveSnapPointChange",
  ],
  (p) => ({
    role: "dialog",
    slot: "drawer-content",
    closeOnScrim: p.scrimCloses ?? true,
    cornerClose: true,
    attrs: {
      "data-side": p.side ?? "bottom",
      "data-snap-points":
        (p.snapPoints ?? NO_SNAPS).length > 0 ? "" : undefined,
    },
  }),
  function useDrawerSwipe(p, { panel, open, dismissible, requestClose }) {
    const side = p.side ?? "bottom";
    const snapPoints = p.snapPoints ?? NO_SNAPS;
    const [active, setActive] = useControllable<number | null>(
      p.activeSnapPoint,
      p.defaultActiveSnapPoint ?? null,
      p.onActiveSnapPointChange,
    );
    const live = useRef({
      side,
      snapPoints,
      active,
      setActive,
      dismissible,
      requestClose,
    });
    useInsertionEffect(() => {
      live.current = {
        side,
        snapPoints,
        active,
        setActive,
        dismissible,
        requestClose,
      };
    });
    const [swipe] = useState(() =>
      createDrawerSwipe({
        side: () => live.current.side,
        snapPoints: () => live.current.snapPoints,
        activeSnapPoint: () =>
          live.current.active ?? live.current.snapPoints[0] ?? null,
        setActiveSnapPoint: (snap) => {
          live.current.active = snap;
          live.current.setActive(snap);
        },
        dismiss: () => live.current.requestClose(),
        dismissible: () => live.current.dismissible,
      }),
    );
    useLayoutEffect(() => {
      if (open) swipe.place(panel.current);
    }, [swipe, panel, open, active, snapPoints, side]);
    return {
      panelAttrs: {
        onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) =>
          swipe.pointerDown(e.nativeEvent, e.currentTarget),
        onFocus: (e: ReactFocusEvent<HTMLDivElement>) =>
          swipe.focused(e.target, e.currentTarget),
      },
      before:
        (p.handle ?? true) && (side === "bottom" || side === "top") ? (
          <div
            className="drawer-handle"
            data-slot="drawer-handle"
            aria-hidden="true"
            onClick={() => swipe.cycle()}
          />
        ) : null,
    };
  },
);

// The drawer uses the dialog parts (as `[soneDrawerHeader]` etc. do in Angular).
export const SoneDrawerHeader = SoneDialogHeader;
export const SoneDrawerTitle = SoneDialogTitle;
export const SoneDrawerDescription = SoneDialogDescription;
export const SoneDrawerMedia = SoneDialogMedia;
export const SoneDrawerFooter = SoneDialogFooter;
export const SoneDrawerClose = SoneDialogClose;
