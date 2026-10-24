import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { graphCardPlacement, type GraphSceneAnchor } from "@surface-one/core";
import { cx } from "../../utils/part";
import { SoneButton } from "../button/button";

export interface SoneGraphCardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly anchor?: GraphSceneAnchor | null;
  readonly heading: string;
  readonly meta?: string;
  /** Any CSS colour for the swatch, e.g. `var(--graph-note)`. */
  readonly tone?: string;
  readonly square?: boolean;
  readonly pinned?: boolean;
  /** The text of the open action of a pinned card; `null` hides it. */
  readonly openLabel?: string | null;
  /** Replaces the heading and meta lines. */
  readonly children?: ReactNode;
  readonly onOpen?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-graph-card>` — the node card of a graph. Floating, it sits above (or below,
 * near the top edge) the node at `anchor` and ignores the pointer; `pinned`, it docks to
 * the bottom-left corner and offers the `openLabel` action. `children` replace the
 * heading and meta lines. `data-node-x` / `data-node-y` expose the node's on-screen
 * position for tests.
 */
export function SoneGraphCard({
  anchor = null,
  heading,
  meta = "",
  tone = "var(--graph-ink)",
  square = false,
  pinned = false,
  openLabel = null,
  children,
  onOpen,
  className,
  style,
  ...rest
}: SoneGraphCardProps): ReactElement {
  const p = graphCardPlacement(anchor, pinned);
  return createElement(
    "sone-graph-card",
    {
      "data-slot": "graph-card",
      "data-state": pinned ? "pinned" : "floating",
      "data-node-x": anchor?.x,
      "data-node-y": anchor?.y,
      ...rest,
      className: cx(p.below ? "is-below" : undefined, className),
      style: {
        ...style,
        ...(p.left === null ? {} : { left: p.left }),
        ...(p.top === null ? {} : { top: p.top }),
      },
    },
    <div className="gcard-text">
      {children ?? (
        <>
          <span className="gcard-title" data-slot="graph-card-title">
            {heading}
          </span>
          {meta ? (
            <span className="gcard-meta" data-slot="graph-card-meta">
              <span
                className={cx("gcard-swatch", square ? "is-square" : undefined)}
                style={{ background: tone }}
                aria-hidden="true"
              />
              {meta}
            </span>
          ) : null}
        </>
      )}
    </div>,
    pinned && openLabel ? (
      <SoneButton
        variant="outline"
        size="xs"
        type="button"
        onClick={() => onOpen?.()}
      >
        {openLabel}
      </SoneButton>
    ) : null,
  );
}
