"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useSoneTooltip } from "../../tooltip/tooltip";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type FloatingBarState = "idle" | "live" | "processing";

export interface SoneFloatingBarProps extends HTMLAttributes<HTMLElement> {
  readonly state?: FloatingBarState;
  /** The close button's name (default: the "Hide" message). */
  readonly closeLabel?: string;
  /** Show the trailing close button. */
  readonly closable?: boolean;
  /**
   * An attribute that marks the bar's chrome as the window's drag handle — Tauri's
   * `data-tauri-drag-region`; `null` = none.
   */
  readonly dragRegionAttr?: string | null;
  /** The attribute's value: `deep` (default) drags from anywhere but controls; `""` the background only. */
  readonly dragRegionValue?: string;
  /** The close button was pressed. */
  readonly onClosed?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-floating-bar>` — the compact always-on-top recording bar of a desktop app: your
 * content (an orb, a status line) in a pill, with an optional close button. `state`
 * tints it; `dragRegionAttr` marks its chrome as the window's drag handle
 * (`data-tauri-drag-region`).
 */
export function SoneFloatingBar({
  state = "idle",
  closeLabel,
  closable = true,
  dragRegionAttr = null,
  dragRegionValue = "deep",
  onClosed,
  children,
  ...rest
}: SoneFloatingBarProps): ReactElement {
  const m = useSoneMessages();
  const label = closeLabel ?? m.floatingBarHide;
  const tooltip = useSoneTooltip<HTMLButtonElement>(label);
  const drag = dragRegionAttr?.trim();
  return createElement(
    "sone-floating-bar",
    { "data-slot": "floating-bar", "data-state": state, ...rest },
    <div
      className="floating-bar"
      data-slot="floating-bar-chrome"
      {...(drag ? { [drag]: dragRegionValue } : {})}
    >
      <div className="floating-bar-content">{children}</div>
      {closable ? (
        <SoneButton
          ref={tooltip}
          variant="ghost"
          size="icon-xs"
          type="button"
          className="floating-bar-close"
          data-slot="floating-bar-close"
          aria-label={label}
          onClick={() => onClosed?.()}
        >
          <SoneIcon icon="close" />
        </SoneButton>
      ) : null}
    </div>,
  );
}
