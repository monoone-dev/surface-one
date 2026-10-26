import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import {
  markSizePreset,
  markSizeStyle,
  type MarkSize,
  type MarkTone,
  type ShellIcon,
} from "@surface-one/core";

import { SoneIcon } from "../icon/icon";

export type { MarkSize, MarkTone } from "@surface-one/core";
export { MARK_TONES } from "@surface-one/core";

export interface SoneMarkProps extends HTMLAttributes<HTMLElement> {
  readonly icon?: ShellIcon;
  readonly tone?: MarkTone;
  /** `sm` (20), `md` (28), `lg` (40) or a size in px. */
  readonly size?: MarkSize;
  /** The accessible name; leave it out when text beside the mark already names it. */
  readonly label?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-mark>` — an app or source mark: a small rounded tile with a gradient `tone` and
 * a white glyph. Decorative unless it has a `label` (then `role="img"`).
 */
export function SoneMark({
  icon = "layout-grid",
  tone = "brand",
  size = "md",
  label = null,
  style,
  ...rest
}: SoneMarkProps): ReactElement {
  const px = markSizeStyle(size);
  return createElement(
    "sone-mark",
    {
      "data-slot": "mark",
      "data-tone": tone,
      "data-size": markSizePreset(size) ?? undefined,
      role: label ? "img" : undefined,
      "aria-label": label || undefined,
      "aria-hidden": label ? undefined : "true",
      ...rest,
      style: px ? ({ "--mark-size": px, ...style } as CSSProperties) : style,
    },
    <SoneIcon icon={icon} />,
  );
}
