"use client";

import {
  createElement,
  useRef,
  type HTMLAttributes,
  type PointerEvent,
  type ReactElement,
} from "react";

import { cx } from "../../utils/part";
import { useSoneFlow } from "./flow";
import { flowBounds } from "./geometry";
import type { SoneFlowPanelPosition } from "./types";

const PAD = 24;

export interface SoneFlowMinimapProps extends HTMLAttributes<HTMLElement> {
  readonly position?: SoneFlowPanelPosition;
  readonly width?: number;
  readonly height?: number;
}

/**
 * `<sone-flow-minimap>` — a small overview of the whole `<SoneFlow>`: every node as a
 * block and the visible area as a frame. Click or drag in it to move the view there.
 * A pointer shortcut — the keyboard has the controls and Tab between nodes — so it is
 * hidden from assistive technology.
 */
export function SoneFlowMinimap({
  position = "bottom-right",
  width = 200,
  height = 136,
  className,
  style,
  ...rest
}: SoneFlowMinimapProps): ReactElement {
  const flow = useSoneFlow();
  const svg = useRef<SVGSVGElement | null>(null);
  const dragging = useRef<number | null>(null);

  const v = flow.viewport;
  const pane = flow.paneSize;
  const visible = pane.width
    ? {
        x: -v.x / v.zoom,
        y: -v.y / v.zoom,
        width: pane.width / v.zoom,
        height: pane.height / v.zoom,
      }
    : null;
  const rects = flow.rendered.map((r) => r.rect);
  const world = flowBounds(visible ? [...rects, visible] : rects) ?? {
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  };
  const box = [
    world.x - PAD,
    world.y - PAD,
    world.width + PAD * 2,
    world.height + PAD * 2,
  ];
  // One screen pixel of the frame, whatever the scale.
  const stroke = 1.5 * Math.max(box[2]! / width, box[3]! / height);

  const moveTo = (e: PointerEvent): void => {
    const ctm = svg.current?.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    flow.centerOn({ x: p.x, y: p.y });
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>): void => {
    if (e.button !== 0) return;
    dragging.current = e.pointerId;
    svg.current?.setPointerCapture?.(e.pointerId);
    moveTo(e);
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>): void => {
    if (dragging.current === e.pointerId) moveTo(e);
  };
  const onPointerUp = (e: PointerEvent<SVGSVGElement>): void => {
    if (dragging.current !== e.pointerId) return;
    dragging.current = null;
    const el = svg.current;
    if (el?.hasPointerCapture?.(e.pointerId))
      el.releasePointerCapture(e.pointerId);
  };

  return createElement(
    "sone-flow-minimap",
    {
      "data-slot": "flow-minimap",
      "aria-hidden": "true",
      "data-position": position,
      ...rest,
      className: cx("flow-panel", className),
      style: { width: `${width}px`, height: `${height}px`, ...style },
    },
    <svg
      ref={svg}
      className="flow-minimap-svg"
      viewBox={box.join(" ")}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {flow.rendered.map((r) => (
        <rect
          key={r.node.id}
          className="flow-minimap-node"
          data-tone={r.node.tone ?? "neutral"}
          data-selected={r.selected ? "" : undefined}
          x={r.rect.x}
          y={r.rect.y}
          width={r.rect.width}
          height={r.rect.height}
          rx={r.node.shape === "circle" ? r.rect.width / 2 : 6}
        />
      ))}
      {visible ? (
        <rect
          key="viewport"
          className="flow-minimap-viewport"
          x={visible.x}
          y={visible.y}
          width={visible.width}
          height={visible.height}
          strokeWidth={stroke}
          rx="4"
        />
      ) : null}
    </svg>,
  );
}
