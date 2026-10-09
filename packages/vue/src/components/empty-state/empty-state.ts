import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type EmptyMediaVariant = "default" | "icon";

export const SoneEmpty = definePart({
  name: "SoneEmpty",
  tag: "div",
  className: "empty-state",
  slot: "empty",
});

export const SoneEmptyHeader = definePart({
  name: "SoneEmptyHeader",
  tag: "div",
  className: "empty-header",
  slot: "empty-header",
});

export const SoneEmptyMedia = definePart({
  name: "SoneEmptyMedia",
  tag: "div",
  className: "empty-media",
  slot: "empty-media",
  props: {
    variant: {
      type: String as PropType<EmptyMediaVariant>,
      default: "default",
    },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

export const SoneEmptyTitle = definePart({
  name: "SoneEmptyTitle",
  tag: "h3",
  className: "empty-title",
  slot: "empty-title",
});

export const SoneEmptyDescription = definePart({
  name: "SoneEmptyDescription",
  tag: "p",
  className: "empty",
  slot: "empty-description",
});

export const SoneEmptyContent = definePart({
  name: "SoneEmptyContent",
  tag: "div",
  className: "empty-content",
  slot: "empty-content",
});
