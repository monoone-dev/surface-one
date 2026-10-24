import { definePart } from "../../utils/part";

export type BubbleVariant =
  | "default"
  | "secondary"
  | "muted"
  | "tinted"
  | "outline"
  | "ghost"
  | "destructive";
export type BubbleAlign = "start" | "end";

/** `[soneBubble]` — a chat bubble; its text goes in a `SoneBubbleContent`. */
export const SoneBubble = definePart<
  "div",
  { variant?: BubbleVariant; align?: BubbleAlign }
>({
  name: "SoneBubble",
  tag: "div",
  slot: "bubble",
  props: ["variant", "align"],
  attrs: (p) => ({
    "data-variant": p.variant ?? "default",
    "data-align": p.align ?? "start",
  }),
});

export const SoneBubbleContent = definePart({
  name: "SoneBubbleContent",
  tag: "div",
  slot: "bubble-content",
});

/** `[soneBubbleGroup]` — consecutive bubbles from one sender. */
export const SoneBubbleGroup = definePart({
  name: "SoneBubbleGroup",
  tag: "div",
  slot: "bubble-group",
});
