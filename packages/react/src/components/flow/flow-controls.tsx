"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useSoneTooltip, type TooltipSide } from "../../tooltip/tooltip";
import { cx } from "../../utils/part";
import { SoneButton, type ButtonSize } from "../button";
import { SoneIcon } from "../icon";
import { useSoneFlow } from "./flow";
import type { SoneFlowPanelPosition } from "./types";

export interface SoneFlowControlsLabels {
  readonly group: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
  readonly resetZoom: string;
  readonly lock: string;
}

export interface SoneFlowControlsProps extends HTMLAttributes<HTMLElement> {
  readonly position?: SoneFlowPanelPosition;
  readonly orientation?: "horizontal" | "vertical";
  /** Show the zoom level as a button that resets it to 100%. */
  readonly showZoom?: boolean;
  readonly showLock?: boolean;
  readonly labels?: Partial<SoneFlowControlsLabels>;
}

interface ControlProps {
  readonly tooltip: string;
  readonly side: TooltipSide;
  readonly label: string;
  readonly size?: ButtonSize;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly pressed?: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

/** A ghost icon button with its tooltip. */
function Control({
  tooltip,
  side,
  label,
  size = "icon-sm",
  className,
  disabled,
  pressed,
  onClick,
  children,
}: ControlProps) {
  const ref = useSoneTooltip<HTMLButtonElement>({ text: tooltip, side });
  return (
    <SoneButton
      ref={ref}
      variant="ghost"
      size={size}
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={
        pressed === undefined
          ? undefined
          : (String(pressed) as "true" | "false")
      }
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </SoneButton>
  );
}

/**
 * `<sone-flow-controls>` — zoom in, zoom out, fit view, the zoom level (a reset to
 * 100%) and a lock toggle for the `<SoneFlow>` it sits in.
 */
export function SoneFlowControls({
  position = "bottom-left",
  orientation = "vertical",
  showZoom = false,
  showLock = true,
  labels,
  className,
  ...rest
}: SoneFlowControlsProps): ReactElement {
  const flow = useSoneFlow();
  const m = useSoneMessages();
  const t: SoneFlowControlsLabels = {
    group: m.flowControls,
    zoomIn: m.flowZoomIn,
    zoomOut: m.flowZoomOut,
    fit: m.flowFit,
    resetZoom: m.flowResetZoom,
    lock: m.flowLock,
    ...labels,
  };
  const zoom = flow.zoom;
  const interactive = flow.interactive;
  const percent = `${Math.round(zoom * 100)}%`;
  /** Away from the edge the controls sit on. */
  const side: TooltipSide =
    orientation === "horizontal"
      ? position.startsWith("top")
        ? "bottom"
        : "top"
      : position.endsWith("right")
        ? "left"
        : "right";

  return createElement(
    "sone-flow-controls",
    {
      "data-slot": "flow-controls",
      role: "group",
      "aria-label": t.group,
      "data-position": position,
      "data-orientation": orientation,
      ...rest,
      className: cx("flow-panel", className),
    },
    <Control
      key="in"
      tooltip={t.zoomIn}
      side={side}
      label={t.zoomIn}
      disabled={zoom >= flow.maxZoom()}
      onClick={() => flow.zoomIn()}
    >
      <SoneIcon icon="zoom-in" />
    </Control>,
    <Control
      key="out"
      tooltip={t.zoomOut}
      side={side}
      label={t.zoomOut}
      disabled={zoom <= flow.minZoom()}
      onClick={() => flow.zoomOut()}
    >
      <SoneIcon icon="zoom-out" />
    </Control>,
    showZoom ? (
      <Control
        key="zoom"
        tooltip={t.resetZoom}
        side={side}
        label={`${t.resetZoom}, ${percent}`}
        size="sm"
        className="flow-controls-zoom"
        onClick={() => flow.zoomTo(1)}
      >
        {percent}
      </Control>
    ) : null,
    <Control
      key="fit"
      tooltip={t.fit}
      side={side}
      label={t.fit}
      onClick={() => flow.fit()}
    >
      <SoneIcon icon="fit" />
    </Control>,
    showLock ? (
      <Control
        key="lock"
        tooltip={t.lock}
        side={side}
        label={t.lock}
        pressed={!interactive}
        onClick={() => flow.setInteractive(!interactive)}
      >
        <SoneIcon icon={interactive ? "unlock" : "lock"} />
      </Control>
    ) : null,
  );
}
