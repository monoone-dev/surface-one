import type { PropType } from "vue";

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
export const SoneBubble = definePart({
  name: "SoneBubble",
  tag: "div",
  slot: "bubble",
  props: {
    variant: { type: String as PropType<BubbleVariant>, default: "default" },
    align: { type: String as PropType<BubbleAlign>, default: "start" },
  },
  attrs: (p) => ({ "data-variant": p.variant, "data-align": p.align }),
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
