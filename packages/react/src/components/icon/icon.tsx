import { createElement, type HTMLAttributes } from "react";

import { SONE_ICONS, type ShellIcon } from "./icons.generated";

export type { ShellIcon };
export type IconSize = "xs" | "sm" | "base" | "lg" | "xl";

export interface SoneIconProps extends HTMLAttributes<HTMLElement> {
  readonly icon: ShellIcon;
  readonly size?: IconSize | null;
  /** The accessible name — only for a MEANINGFUL icon, the only thing saying what it means. */
  readonly label?: string | null;
  /** Beside text in a button or badge: `start` or `end`. */
  readonly inline?: "start" | "end" | null;
}

/**
 * `<sone-icon>` — one of the SurfaceOne glyphs (the same set as @surface-one/angular).
 * Decorative (`aria-hidden`) unless it has a `label`.
 */
export function SoneIcon({ icon, size, label, inline, ...rest }: SoneIconProps) {
  return createElement(
    "sone-icon",
    {
      ...rest,
      "data-slot": "icon",
      "data-icon": icon,
      "data-size": size ?? undefined,
      "data-inline": inline ?? undefined,
    },
    <span
      className="nav-icon"
      aria-hidden={label ? undefined : "true"}
      role={label ? "img" : undefined}
      aria-label={label ?? undefined}
      dangerouslySetInnerHTML={{ __html: SONE_ICONS[icon] ?? "" }}
    />,
  );
}
