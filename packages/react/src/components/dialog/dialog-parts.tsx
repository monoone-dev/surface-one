"use client";

import {
  createElement,
  type ComponentPropsWithRef,
  type MouseEvent,
  useContext,
  useId,
  useLayoutEffect,
  type ElementType,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { SONE_OVERLAY, type SoneOverlayHost } from "../../hooks/overlay";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type DialogMediaTone = "default" | "accent" | "destructive" | "warning";

export const SoneDialogHeader = definePart({
  name: "SoneDialogHeader",
  tag: "div",
  className: "dialog-header",
  slot: "dialog-header",
});

export const SoneDialogFooter = definePart({
  name: "SoneDialogFooter",
  tag: "div",
  className: "dialog-footer",
  slot: "dialog-footer",
});

export const SoneDialogMedia = definePart<"div", { tone?: DialogMediaTone }>({
  name: "SoneDialogMedia",
  tag: "div",
  className: "dialog-media",
  slot: "dialog-media",
  static: { "aria-hidden": "true" },
  props: ["tone"],
  attrs: (p) => ({ "data-tone": p.tone ?? "default" }),
});

type Registrar = (host: SoneOverlayHost) => {
  add(label: { id: () => string }): void;
  remove(label: { id: () => string }): void;
};

/** A title or description that names / describes the overlay it sits in. */
function defineLabel<D extends ElementType>(
  name: string,
  className: string,
  tag: D,
  register: Registrar,
) {
  function Label<E extends ElementType = D>({
    as,
    id,
    className: extra,
    ...rest
  }: PolymorphicProps<E, { id?: string }>) {
    const fallback = `sone-${className}-${useId()}`;
    const resolved = id ?? fallback;
    const overlay = useContext(SONE_OVERLAY);
    useLayoutEffect(() => {
      if (!overlay) return;
      const reg = register(overlay);
      const label = { id: () => resolved };
      reg.add(label);
      // A conditionally rendered title must not leave the dialog labelled by a dead id.
      return () => reg.remove(label);
    }, [overlay, resolved]);
    return createElement(as ?? tag, {
      "data-slot": className,
      ...rest,
      id: resolved,
      className: cx(className, extra),
    });
  }
  Label.displayName = name;
  return Label;
}

export const SoneDialogTitle = defineLabel(
  "SoneDialogTitle",
  "dialog-title",
  "h2",
  (o) => ({ add: o.registerTitle, remove: o.unregisterTitle }),
);

export const SoneDialogDescription = defineLabel(
  "SoneDialogDescription",
  "dialog-description",
  "p",
  (o) => ({ add: o.registerDescription, remove: o.unregisterDescription }),
);

export interface SoneDialogCloseProps extends ComponentPropsWithRef<"button"> {
  /** The button's name (default: the "Close" message). */
  readonly label?: string | null;
}

/**
 * `button[soneDialogClose]` — a close button for a dialog or sheet header. Inside an
 * overlay it closes it (when it may be dismissed) and the corner close steps aside;
 * `onClick` runs first and can `preventDefault()` to keep it open.
 */
export function SoneDialogClose({
  label = null,
  className,
  onClick,
  children,
  ...rest
}: SoneDialogCloseProps) {
  const overlay = useContext(SONE_OVERLAY);
  const messages = useSoneMessages();
  return createElement(
    "button",
    {
      type: "button",
      "data-slot": "dialog-close",
      "data-variant": "ghost",
      "data-size": "icon-sm",
      "aria-label": label ?? messages.close,
      ...rest,
      className: cx("btn dialog-header-close", className),
      onClick: (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) overlay?.requestClose?.();
      },
    },
    children ?? <SoneIcon icon="close" />,
  );
}
