"use client";

import {
  createElement,
  isValidElement,
  useImperativeHandle,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { flattenChildren } from "@surface-one/core/react/children";

import { useSoneMessages } from "../../context/messages";
import { definePart } from "../../utils/part";
import { SoneRowMenu, type SoneRowMenuHandle } from "../row-menu/row-menu";

/** `[sonePageActionsStatus]` — your own status beside (or instead of) the `status` text. */
export const SonePageActionsStatus = definePart({
  name: "SonePageActionsStatus",
  tag: "span",
  slot: "page-actions-status",
});

/** `[sonePageActionsLead]` — buttons before the ⋯ menu (favourite, share). */
export const SonePageActionsLead = definePart({
  name: "SonePageActionsLead",
  tag: "span",
  slot: "page-actions-lead",
});

/** What a page actions' `handleRef` exposes. */
export interface SonePageActionsHandle {
  readonly isOpen: boolean;
  /** Closes the menu. */
  close(): void;
}

export interface SonePageActionsProps extends HTMLAttributes<HTMLElement> {
  readonly status?: string | null;
  /** The menu trigger's accessible name (default: the "More actions" message). */
  readonly label?: string;
  readonly tooltip?: string | null;
  readonly disabled?: boolean;
  readonly showMenu?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** `isOpen` and `close()`. */
  readonly handleRef?: Ref<SonePageActionsHandle>;
  readonly ref?: Ref<HTMLElement>;
}

const isPart = (node: ReactNode, part: unknown): boolean =>
  isValidElement(node) && node.type === part;

/**
 * `<sone-page-actions>` — the actions at the end of a page header: a muted status
 * ("Edited Oct 08"), the `SonePageActionsStatus` and `SonePageActionsLead` parts, then a
 * prominent ⋯ `SoneRowMenu` holding every other child (the menu items).
 */
export function SonePageActions({
  status = null,
  label,
  tooltip = null,
  disabled = false,
  showMenu = true,
  onOpenChange,
  handleRef,
  children,
  ...rest
}: SonePageActionsProps): ReactElement {
  const m = useSoneMessages();
  const [open, setOpen] = useState(false);
  const menu = useRef<SoneRowMenuHandle>(null);
  useImperativeHandle(
    handleRef,
    () => ({ isOpen: open, close: () => menu.current?.close() }),
    [open],
  );

  const nodes = flattenChildren(children);
  const statusParts = nodes.filter((n) => isPart(n, SonePageActionsStatus));
  const lead = nodes.filter((n) => isPart(n, SonePageActionsLead));
  const items = nodes.filter(
    (n) => !isPart(n, SonePageActionsStatus) && !isPart(n, SonePageActionsLead),
  );

  return createElement(
    "sone-page-actions",
    {
      "data-slot": "page-actions",
      "data-state": open && showMenu ? "open" : "closed",
      ...rest,
    },
    status ? (
      <span className="page-actions-status" data-slot="page-actions-status">
        {status}
      </span>
    ) : null,
    statusParts,
    lead,
    showMenu ? (
      <SoneRowMenu
        handleRef={menu}
        prominent
        label={label ?? m.pageActionsMore}
        tooltip={tooltip}
        disabled={disabled}
        onOpenChange={(value) => {
          setOpen(value);
          onOpenChange?.(value);
        }}
      >
        {items}
      </SoneRowMenu>
    ) : null,
  );
}
