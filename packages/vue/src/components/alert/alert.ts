import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type AlertVariant =
  "default" | "destructive" | "warning" | "success" | "info";

export const SoneAlert = definePart({
  name: "SoneAlert",
  tag: "div",
  className: "alert",
  slot: "alert",
  props: {
    variant: { type: String as PropType<AlertVariant>, default: "default" },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

export const SoneAlertTitle = definePart({
  name: "SoneAlertTitle",
  tag: "p",
  className: "alert-title",
  slot: "alert-title",
});

export const SoneAlertDescription = definePart({
  name: "SoneAlertDescription",
  tag: "p",
  className: "alert-description",
  slot: "alert-description",
});

export const SoneAlertAction = definePart({
  name: "SoneAlertAction",
  tag: "div",
  className: "alert-action",
  slot: "alert-action",
});
