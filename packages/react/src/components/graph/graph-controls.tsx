"use client";

import {
  createElement,
  useLayoutEffect,
  useRef,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { rovingFocusTarget } from "@surface-one/core";
import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";

export interface SoneGraphControlsLabels {
  fit: string;
  fitLabel: string;
  zoomIn: string;
  zoomOut: string;
  list: string;
  listLabel: string;
}

export interface SoneGraphControlsProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Accessible name of the toolbar. */
  readonly label: string;
  /** The zoom readout, in percent of the fitted view. */
  readonly zoomPct?: number;
  /** `true` / `false` shows the list toggle pressed / not pressed; `null` hides it. */
  readonly list?: boolean | null;
  readonly labels?: Partial<SoneGraphControlsLabels>;
  /** The info panel: a legend, counts. */
  readonly children?: ReactNode;
  readonly onZoomIn?: () => void;
  readonly onZoomOut?: () => void;
  readonly onFit?: () => void;
  readonly onListChange?: (value: boolean) => void;
}

/**
 * `<sone-graph-controls>` — the overlay toolbar of a graph: an info panel (`children`: a
 * legend, counts) and Fit / zoom out / zoom readout / zoom in, plus an optional list
 * toggle. One tab stop; arrow keys, Home and End move between the buttons (WAI-ARIA
 * toolbar).
 */
export function SoneGraphControls({
  label,
  zoomPct = 100,
  list = null,
  labels,
  children,
  onZoomIn,
  onZoomOut,
  onFit,
  onListChange,
  ...rest
}: SoneGraphControlsProps): ReactElement {
  const m = useSoneMessages();
  const t: SoneGraphControlsLabels = {
    fit: m.graphFit,
    fitLabel: m.graphFitLabel,
    zoomIn: m.graphZoomIn,
    zoomOut: m.graphZoomOut,
    list: m.graphList,
    listLabel: m.graphListLabel,
    ...labels,
  };
  const host = useRef<HTMLElement | null>(null);
  const active = useRef(0);

  const buttons = (): HTMLButtonElement[] => [
    ...(host.current?.querySelectorAll<HTMLButtonElement>(
      "[data-slot=graph-controls-actions] button",
    ) ?? []),
  ];
  const syncTabStops = (): void => {
    const all = buttons();
    active.current = Math.min(active.current, all.length - 1);
    all.forEach((b, i) => (b.tabIndex = i === active.current ? 0 : -1));
  };
  useLayoutEffect(syncTabStops);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const all = buttons();
    const at = all.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    rovingFocusTarget(event, all, at, { orientation: "both" })?.focus();
  };
  const onFocus = (event: FocusEvent<HTMLElement>): void => {
    const at = buttons().indexOf(event.target as HTMLButtonElement);
    if (at >= 0) {
      active.current = at;
      syncTabStops();
    }
  };

  return createElement(
    "sone-graph-controls",
    {
      "data-slot": "graph-controls",
      role: "toolbar",
      "aria-label": label,
      ...rest,
      ref: host,
      onKeyDown,
      onFocus,
    },
    <div className="gc-panel gc-info" data-slot="graph-controls-info">
      {children}
    </div>,
    <div className="gc-panel gc-actions" data-slot="graph-controls-actions">
      {list !== null ? (
        <>
          <SoneButton
            variant="ghost"
            size="xs"
            type="button"
            aria-label={t.listLabel}
            aria-pressed={list}
            onClick={() => onListChange?.(!list)}
          >
            {t.list}
          </SoneButton>
          <span className="gc-divider" aria-hidden="true" />
        </>
      ) : null}
      <SoneButton
        variant="ghost"
        size="xs"
        type="button"
        aria-label={t.fitLabel}
        onClick={() => onFit?.()}
      >
        {t.fit}
      </SoneButton>
      <span className="gc-divider" aria-hidden="true" />
      <SoneButton
        variant="ghost"
        size="icon-xs"
        type="button"
        aria-label={t.zoomOut}
        onClick={() => onZoomOut?.()}
      >
        −
      </SoneButton>
      <span className="gc-zoom" aria-hidden="true">
        {`${zoomPct}%`}
      </span>
      <SoneButton
        variant="ghost"
        size="icon-xs"
        type="button"
        aria-label={t.zoomIn}
        onClick={() => onZoomIn?.()}
      >
        +
      </SoneButton>
    </div>,
  );
}
