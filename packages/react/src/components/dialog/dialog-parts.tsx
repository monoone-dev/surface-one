"use client";

import {
  createElement,
  useContext,
  useId,
  useLayoutEffect,
  type ElementType,
} from "react";

import { SONE_OVERLAY, type SoneOverlayHost } from "../../hooks/overlay";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";

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
