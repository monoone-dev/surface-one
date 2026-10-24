import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type MessageAlign = "start" | "end";

/** `[soneMessage]` — one chat row: avatar beside the content; `align="end"` mirrors it. */
export const SoneMessage = definePart({
  name: "SoneMessage",
  tag: "div",
  slot: "message",
  props: {
    align: { type: String as PropType<MessageAlign>, default: "start" },
  },
  attrs: (p) => ({ "data-align": p.align }),
});

/** `[soneMessageAvatar]` — `:as="SoneAvatar"` puts the slot on an avatar. */
export const SoneMessageAvatar = definePart({
  name: "SoneMessageAvatar",
  tag: "div",
  slot: "message-avatar",
});

export const SoneMessageContent = definePart({
  name: "SoneMessageContent",
  tag: "div",
  slot: "message-content",
});

export const SoneMessageHeader = definePart({
  name: "SoneMessageHeader",
  tag: "div",
  slot: "message-header",
});

export const SoneMessageFooter = definePart({
  name: "SoneMessageFooter",
  tag: "div",
  slot: "message-footer",
});

/** `[soneMessageGroup]` — consecutive messages, spaced as one conversation. */
export const SoneMessageGroup = definePart({
  name: "SoneMessageGroup",
  tag: "div",
  slot: "message-group",
});
