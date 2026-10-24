"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import { useSoneTooltip } from "../../tooltip/tooltip";
import { definePart } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

/**
 * `[soneSidePanel]` — a panel docked beside the main content (details, comments): a
 * fixed-width column with the sidebar surface and a hairline on its leading edge.
 * Name it with `aria-labelledby` pointing at its `SoneSidePanelTitle`.
 */
export const SoneSidePanel = definePart({
  name: "SoneSidePanel",
  tag: "aside",
  className: "side-panel",
  slot: "side-panel",
});

/** `[soneSidePanelHeader]` — the title row: the title, then the actions. */
export const SoneSidePanelHeader = definePart({
  name: "SoneSidePanelHeader",
  tag: "header",
  className: "side-panel-header",
  slot: "side-panel-header",
});

/** `[soneSidePanelTitle]` — the panel's heading, truncated to one line. */
export const SoneSidePanelTitle = definePart({
  name: "SoneSidePanelTitle",
  tag: "h2",
  className: "side-panel-title",
  slot: "side-panel-title",
});

/** `[soneSidePanelActions]` — the buttons at the end of the header. */
export const SoneSidePanelActions = definePart({
  name: "SoneSidePanelActions",
  tag: "div",
  className: "side-panel-actions",
  slot: "side-panel-actions",
});

/** `[soneSidePanelContent]` — the scrolling body. */
export const SoneSidePanelContent = definePart({
  name: "SoneSidePanelContent",
  tag: "div",
  className: "side-panel-content",
  slot: "side-panel-content",
});

export interface SoneSidePanelCloseProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** The button's accessible name and tooltip ("Close details"). */
  readonly label: string;
  /** The button was pressed. */
  readonly onClosed?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-side-panel-close>` — the ghost × button of a side panel's header, named and
 * tooltipped by `label`; calls `onClosed`.
 */
export function SoneSidePanelClose({
  label,
  onClosed,
  ...rest
}: SoneSidePanelCloseProps): ReactElement {
  const tooltip = useSoneTooltip<HTMLButtonElement>(label);
  return createElement(
    "sone-side-panel-close",
    { "data-slot": "side-panel-close", ...rest },
    <SoneButton
      ref={tooltip}
      variant="ghost"
      size="icon-sm"
      type="button"
      aria-label={label}
      onClick={() => onClosed?.()}
    >
      <SoneIcon icon="close" />
    </SoneButton>,
  );
}
