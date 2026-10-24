import { h, nextTick, watch, type PropType } from "vue";

import { createDrawerSwipe, type DrawerSide } from "@surface-one/core";

import { useModel } from "../../utils/model";
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

/**
 * `<sone-drawer>` — the Vue twin of `sone-drawer`: a sheet from the `bottom` (or another
 * `side`) with a drag handle, dismissed by a swipe toward its edge as well as Escape and
 * the scrim. `snapPoints` (visible fractions, ascending) let it rest part-open,
 * `v-model:activeSnapPoint`; the handle cycles them. No corner close by default.
 */
export const SoneDrawer = defineOverlay(
  {
    name: "SoneDrawer",
    host: "sone-drawer",
    layerClass: "sheet-overlay drawer-overlay",
    layerSlot: "drawer-overlay",
    panelClass: "sheet-content drawer-content",
    closeSlot: "drawer-close",
    emits: { "update:activeSnapPoint": (_snap: number | null) => true },
  },
  {
    side: { type: String as PropType<DrawerSide>, default: "bottom" },
    scrimCloses: { type: Boolean, default: true },
    /** The corner close button (off: a drawer closes by swipe, Escape, the scrim or a `SoneDrawerClose`). */
    showClose: { type: Boolean, default: false },
    /** The drag handle at the inner edge (shown for `bottom` and `top`). */
    handle: { type: Boolean, default: true },
    /** Visible fractions it rests at, ascending (e.g. `[0.5, 1]`). */
    snapPoints: {
      type: Array as PropType<readonly number[]>,
      default: () => [],
    },
    /** The snap point it rests at — `v-model:activeSnapPoint` (default: the first). */
    activeSnapPoint: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  (p) => ({
    role: "dialog",
    slot: "drawer-content",
    closeOnScrim: p["scrimCloses"] as boolean,
    cornerClose: true,
    attrs: {
      "data-side": p["side"],
      "data-snap-points":
        (p["snapPoints"] as readonly number[]).length > 0 ? "" : undefined,
    },
  }),
  (p, { panel, requestClose, emit }) => {
    const snapPoints = () => p["snapPoints"] as readonly number[];
    const active = useModel(
      () => p["activeSnapPoint"] as number | null,
      (v) => emit("update:activeSnapPoint", v),
    );
    const swipe = createDrawerSwipe({
      side: () => p["side"] as DrawerSide,
      snapPoints,
      activeSnapPoint: () => active.value ?? snapPoints()[0] ?? null,
      setActiveSnapPoint: (snap) => active.set(snap),
      dismiss: requestClose,
      dismissible: () => p["dismissible"] as boolean,
    });
    watch(
      [() => active.value, snapPoints, () => p["side"], panel],
      () => void nextTick(() => swipe.place(panel.value)),
      { immediate: true },
    );
    return {
      panelAttrs: () => ({
        onPointerdown: (e: PointerEvent) => {
          if (panel.value) swipe.pointerDown(e, panel.value);
        },
        onFocusin: (e: FocusEvent) => {
          if (panel.value) swipe.focused(e.target, panel.value);
        },
      }),
      before: () => {
        const side = p["side"] as DrawerSide;
        return p["handle"] && (side === "bottom" || side === "top")
          ? h("div", {
              class: "drawer-handle",
              "data-slot": "drawer-handle",
              "aria-hidden": "true",
              onClick: () => swipe.cycle(),
            })
          : null;
      },
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
