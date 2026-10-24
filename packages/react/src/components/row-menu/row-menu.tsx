"use client";

import {
  createElement,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import {
  createRowMenu,
  type RowMenuAlign,
  type RowMenuSide,
} from "@surface-one/core";

export type { RowMenuAlign, RowMenuSide } from "@surface-one/core";

import { useSoneTooltip } from "../../tooltip/tooltip";
import { cx } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

/** What a row menu's `handleRef` exposes. */
export interface SoneRowMenuHandle {
  readonly isOpen: boolean;
  /** Closes the menu. */
  close(): void;
}

export interface SoneRowMenuProps extends HTMLAttributes<HTMLElement> {
  /** The trigger's accessible name (and its native tooltip without `tooltip`). */
  readonly label: string;
  readonly disabled?: boolean;
  /** A page-level trigger: a small ghost button, always visible. */
  readonly prominent?: boolean;
  readonly side?: RowMenuSide;
  /** For `side="right"`: a selector of the ancestor whose right edge the panel opens from. */
  readonly sideEdge?: string | null;
  readonly align?: RowMenuAlign;
  readonly clipToScrollParents?: boolean;
  /** A styled tooltip on the trigger (it also names the panel). */
  readonly tooltip?: string | null;
  /** Replaces the ⋯ icon (`[soneRowMenuGlyph]`). */
  readonly glyph?: ReactNode;
  readonly onOpenChange?: (open: boolean) => void;
  /** `isOpen` and `close()`. */
  readonly handleRef?: Ref<SoneRowMenuHandle>;
  /** The menu items (`SoneMenuItem`, `SoneMenuGroup`, …). */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

const ELLIPSIS = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

/**
 * `<sone-row-menu>` — the ⋯ menu of a row (a tree row, a table row) or, `prominent`, of a
 * page. The panel floats on <body>, fixed next to the trigger and inside every scrolling
 * ancestor. Enter / Space / ArrowDown open it on the first item, ArrowUp on the last;
 * Arrow keys, Home / End move, and it closes on an activated item, Escape, Tab or a click
 * outside.
 */
export function SoneRowMenu({
  label,
  disabled = false,
  prominent = false,
  side = "bottom",
  sideEdge = null,
  align = "end",
  clipToScrollParents = true,
  tooltip = null,
  glyph,
  onOpenChange,
  handleRef,
  className,
  children,
  ref,
  ...rest
}: SoneRowMenuProps): ReactElement {
  const panelId = `sone-row-menu-${useId()}`;
  const [open, setOpen] = useState(false);
  const host = useRef<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  // The latest props for the controller, which is created once.
  const live = useRef({
    open,
    disabled,
    side,
    align,
    sideEdge,
    clipToScrollParents,
    onOpenChange,
  });
  useInsertionEffect(() => {
    live.current = {
      open,
      disabled,
      side,
      align,
      sideEdge,
      clipToScrollParents,
      onOpenChange,
    };
  });

  const [menu] = useState(() =>
    createRowMenu({
      host: () => host.current,
      trigger: () => trigger.current,
      panel: () => panel.current,
      isOpen: () => live.current.open,
      setOpen: (value) => {
        live.current.open = value;
        setOpen(value);
        live.current.onOpenChange?.(value);
      },
      disabled: () => live.current.disabled,
      side: () => live.current.side,
      align: () => live.current.align,
      sideEdge: () => live.current.sideEdge,
      clipToScrollParents: () => live.current.clipToScrollParents,
    }),
  );

  // After the DOM update: the panel is on <body> (or gone).
  useLayoutEffect(() => {
    if (!open) return;
    menu.attached();
    return menu.detached;
  }, [open, menu]);

  useImperativeHandle(handleRef, () => ({ isOpen: open, close: menu.close }), [
    open,
    menu,
  ]);

  const tooltipRef = useSoneTooltip<HTMLButtonElement>({
    text: tooltip ?? "",
    disabled: tooltip === null,
  });
  const triggerRef = useMemo(
    () => mergeRefs<HTMLButtonElement>(trigger, tooltipRef),
    [tooltipRef],
  );
  const hostRef = useMemo(() => mergeRefs(host, ref as never), [ref]);
  const state = open ? "open" : "closed";

  return createElement(
    "sone-row-menu",
    {
      "data-slot": "row-menu",
      "data-state": state,
      ...rest,
      ref: hostRef,
      className: cx(open && "is-open", prominent && "is-prominent", className),
    },
    <button
      ref={triggerRef}
      type="button"
      className={cx("row-menu-trigger", open && "is-open")}
      data-slot="row-menu-trigger"
      data-state={state}
      disabled={disabled}
      aria-haspopup="menu"
      aria-expanded={open ? "true" : "false"}
      aria-controls={panelId}
      aria-label={label}
      // The styled tooltip takes the place of the native `title`.
      title={tooltip === null ? label : undefined}
      onClick={(event) => menu.triggerClick(event)}
      onKeyDown={(event) => menu.triggerKeyDown(event)}
    >
      {glyph ?? ELLIPSIS}
    </button>,
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panel}
            id={panelId}
            className="menu row-menu-panel"
            data-slot="menu"
            data-state="open"
            data-side={side}
            role="menu"
            tabIndex={-1}
            aria-label={tooltip ?? label}
            onClick={(event) => menu.panelClick(event)}
            onKeyDown={(event) => menu.panelKeyDown(event)}
          >
            {children}
          </div>,
          document.body,
        )
      : null,
  );
}
