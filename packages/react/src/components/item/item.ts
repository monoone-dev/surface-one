import { definePart } from "../../utils/part";

export type ItemVariant = "default" | "outline" | "muted";
export type ItemSize = "default" | "sm" | "xs";
export type ItemMediaVariant = "default" | "icon" | "image";

export const SoneItem = definePart<
  "div",
  { variant?: ItemVariant; size?: ItemSize }
>({
  name: "SoneItem",
  tag: "div",
  className: "item",
  slot: "item",
  props: ["variant", "size"],
  attrs: (p) => ({
    "data-variant": p.variant ?? "default",
    "data-size": p.size ?? "default",
  }),
});

export const SoneItemMedia = definePart<"div", { variant?: ItemMediaVariant }>({
  name: "SoneItemMedia",
  tag: "div",
  className: "item-media",
  slot: "item-media",
  props: ["variant"],
  attrs: (p) => ({ "data-variant": p.variant ?? "default" }),
});

export const SoneItemContent = definePart({
  name: "SoneItemContent",
  tag: "div",
  className: "item-content",
  slot: "item-content",
});

export const SoneItemTitle = definePart({
  name: "SoneItemTitle",
  tag: "p",
  className: "item-title",
  slot: "item-title",
});

export const SoneItemDescription = definePart({
  name: "SoneItemDescription",
  tag: "p",
  className: "item-description",
  slot: "item-description",
});

export const SoneItemActions = definePart({
  name: "SoneItemActions",
  tag: "div",
  className: "item-actions",
  slot: "item-actions",
});

export const SoneItemHeader = definePart({
  name: "SoneItemHeader",
  tag: "div",
  className: "item-header",
  slot: "item-header",
});

export const SoneItemFooter = definePart({
  name: "SoneItemFooter",
  tag: "div",
  className: "item-footer",
  slot: "item-footer",
});

export const SoneItemGroup = definePart<"div", { size?: ItemSize }>({
  name: "SoneItemGroup",
  tag: "div",
  className: "item-group",
  slot: "item-group",
  static: { role: "list" },
  props: ["size"],
  attrs: (p) => ({ "data-size": p.size ?? "default" }),
});

/** A decorative separator between items (`[soneItemSeparator]` = separator + item-separator). */
export const SoneItemSeparator = definePart({
  name: "SoneItemSeparator",
  tag: "div",
  className: "separator item-separator",
  slot: "item-separator",
  static: { role: "none", "data-orientation": "horizontal" },
});
