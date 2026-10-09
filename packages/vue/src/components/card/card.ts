import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type CardSize = "default" | "sm";

export const SoneCard = definePart({
  name: "SoneCard",
  tag: "div",
  className: "card",
  slot: "card",
  props: { size: { type: String as PropType<CardSize>, default: "default" } },
  attrs: (p) => ({ "data-size": p.size }),
});

export const SoneCardHeader = definePart({
  name: "SoneCardHeader",
  tag: "div",
  className: "card-header",
  slot: "card-header",
});

export const SoneCardTitle = definePart({
  name: "SoneCardTitle",
  tag: "h3",
  className: "card-title",
  slot: "card-title",
});

export const SoneCardDescription = definePart({
  name: "SoneCardDescription",
  tag: "p",
  className: "card-description",
  slot: "card-description",
});

export const SoneCardAction = definePart({
  name: "SoneCardAction",
  tag: "div",
  className: "card-action",
  slot: "card-action",
});

export const SoneCardContent = definePart({
  name: "SoneCardContent",
  tag: "div",
  className: "card-content",
  slot: "card-content",
});

export const SoneCardFooter = definePart({
  name: "SoneCardFooter",
  tag: "div",
  className: "card-footer",
  slot: "card-footer",
});
