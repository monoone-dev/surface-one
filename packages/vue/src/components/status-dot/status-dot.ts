import { defineComponent, h, type PropType } from "vue";

export type StatusDotTone =
  | "muted"
  | "live"
  | "success"
  | "warning"
  | "destructive"
  | "accent"
  | "current";
export type StatusDotSize = "default" | "sm";

/** `<sone-status-dot>` — a small round status mark; decorative unless it has a `label` (then `role="img"`). */
export const SoneStatusDot = defineComponent({
  name: "SoneStatusDot",
  props: {
    tone: { type: String as PropType<StatusDotTone>, default: "muted" },
    size: { type: String as PropType<StatusDotSize>, default: "default" },
    pulse: { type: Boolean, default: false },
    label: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    return () =>
      h("sone-status-dot", {
        "data-slot": "status-dot",
        "data-tone": props.tone,
        "data-size": props.size,
        "data-pulse": props.pulse ? "" : undefined,
        role: props.label ? "img" : undefined,
        "aria-label": props.label || undefined,
        "aria-hidden": props.label ? undefined : "true",
      });
  },
});
