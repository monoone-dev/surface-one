/**
 * Pure placement math for anything that floats next to an anchor (popover, menu,
 * row menu, sub-menu). No DOM globals: the caller measures and passes plain rects,
 * so this is safe to import on the server and in plain Node.
 */

export type FloatingSide = "top" | "bottom" | "left" | "right";
export type FloatingAlign = "start" | "center" | "end";

/** A viewport-space rectangle (what `getBoundingClientRect()` returns). */
export interface FloatingRect {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
}

export interface FloatingSize {
  readonly width: number;
  readonly height: number;
}

export interface FloatingOptions {
  /** Preferred side of the anchor. Default `bottom`. */
  readonly side?: FloatingSide;
  /** Alignment along the anchor's edge. Default `start`. */
  readonly align?: FloatingAlign;
  /** Gap between the anchor and the panel, in px. Default `4`. */
  readonly offset?: number;
  /** Move to the opposite side when the preferred one is too small and the other has more room. Default `true`. */
  readonly flip?: boolean;
  /** Keep the panel inside the boundary (shift it along both axes). Default `true`. */
  readonly clamp?: boolean;
  /** Distance kept from the viewport edges when the third argument is a viewport size. Default `8`. */
  readonly margin?: number;
}

export interface FloatingPosition {
  /** Viewport x of the panel's left edge (for `position: fixed; left`). */
  readonly x: number;
  /** Viewport y of the panel's top edge. */
  readonly y: number;
  /** The side actually used (after a flip). */
  readonly side: FloatingSide;
  readonly align: FloatingAlign;
  /** The room the panel has before it would leave the boundary, floored to whole px. */
  readonly maxHeight: number;
  readonly maxWidth: number;
}

const OPPOSITE: Record<FloatingSide, FloatingSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * The boundary a floating panel must stay inside: the viewport inset by `margin`,
 * optionally narrowed by more rects (scrolling ancestors that clip the anchor).
 */
export function floatingBoundary(
  viewport: FloatingSize,
  margin = 8,
  ...clips: readonly FloatingRect[]
): FloatingRect {
  let top = margin;
  let left = margin;
  let right = viewport.width - margin;
  let bottom = viewport.height - margin;
  for (const clip of clips) {
    top = Math.max(top, clip.top);
    left = Math.max(left, clip.left);
    right = Math.min(right, clip.right);
    bottom = Math.min(bottom, clip.bottom);
  }
  return { top, left, right, bottom };
}

/**
 * Where to put a `floating` box of the given size next to `anchor`. The third
 * argument is either the viewport size (kept `margin` px away from its edges) or a
 * ready boundary rect (see `floatingBoundary`).
 *
 * A panel's HEIGHT is capped to the room it has (`maxHeight` — cap it and let it
 * scroll); its WIDTH never shrinks, it shifts back along the boundary instead.
 */
export function computeFloatingPosition(
  anchor: FloatingRect,
  floating: FloatingSize,
  viewport: FloatingSize | FloatingRect,
  options: FloatingOptions = {},
): FloatingPosition {
  // A DOMRect has a width too, so tell the two shapes apart by `top`.
  const boundary =
    "top" in viewport
      ? viewport
      : floatingBoundary(viewport, options.margin ?? 8);
  const align = options.align ?? "start";
  const offset = options.offset ?? 4;
  const flip = options.flip ?? true;
  const clamp = options.clamp ?? true;

  const room = (side: FloatingSide): number =>
    Math.max(
      0,
      side === "bottom"
        ? boundary.bottom - anchor.bottom - offset
        : side === "top"
          ? anchor.top - boundary.top - offset
          : side === "right"
            ? boundary.right - anchor.right - offset
            : anchor.left - boundary.left - offset,
    );

  let side = options.side ?? "bottom";
  const vertical = side === "top" || side === "bottom";
  const mainSize = vertical ? floating.height : floating.width;
  if (flip && mainSize > room(side) && room(OPPOSITE[side]) > room(side)) {
    side = OPPOSITE[side];
  }

  const available = Math.floor(room(side));
  // The size the panel really takes on the main axis: a height is capped to the
  // room (the panel scrolls), a width is not.
  const mainShown = vertical ? Math.min(mainSize, available) : mainSize;

  // Cross axis: where the panel lines up along the anchor's edge.
  const crossStart = vertical ? anchor.left : anchor.top;
  const crossEnd = vertical ? anchor.right : anchor.bottom;
  const crossSize = vertical ? floating.width : floating.height;
  let cross =
    align === "start"
      ? crossStart
      : align === "end"
        ? crossEnd - crossSize
        : crossStart + (crossEnd - crossStart - crossSize) / 2;

  // Main axis: just past the anchor on the chosen side.
  let main =
    side === "bottom"
      ? anchor.bottom + offset
      : side === "top"
        ? anchor.top - offset - mainShown
        : side === "right"
          ? anchor.right + offset
          : anchor.left - offset - mainShown;

  const [crossMin, crossMax] = vertical
    ? [boundary.left, boundary.right]
    : [boundary.top, boundary.bottom];
  const [mainMin, mainMax] = vertical
    ? [boundary.top, boundary.bottom]
    : [boundary.left, boundary.right];

  if (clamp) {
    cross = Math.max(crossMin, Math.min(cross, crossMax - crossSize));
    main = Math.max(mainMin, Math.min(main, mainMax - mainShown));
  }

  const crossRoom = Math.max(0, Math.floor(crossMax - cross));
  return vertical
    ? {
        x: cross,
        y: main,
        side,
        align,
        maxHeight: available,
        maxWidth: crossRoom,
      }
    : {
        x: main,
        y: cross,
        side,
        align,
        maxHeight: crossRoom,
        maxWidth: available,
      };
}
