import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneToggle } from "../toggle-group/toggle-group";

const svgAttrs = {
  class: "mic-ico",
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": "true",
  focusable: "false",
} as const;
const stroke = {
  stroke: "currentColor",
  "stroke-width": "1.9",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

const mutedGlyph = () =>
  h("svg", svgAttrs, [
    h("path", {
      d: "M9 9V5a3 3 0 0 1 5.12-2.12M15 9.34V10a3 3 0 0 1-3 3",
      ...stroke,
    }),
    h("path", {
      d: "M17 11a5 5 0 0 1-.54 2.27M5 11a7 7 0 0 0 7 7m0 0v3m0-3a6.97 6.97 0 0 0 1.6-.18",
      ...stroke,
    }),
    h("path", { d: "M3 3l18 18", ...stroke }),
  ]);

const liveGlyph = () =>
  h("svg", svgAttrs, [
    h("rect", {
      x: "9",
      y: "2",
      width: "6",
      height: "12",
      rx: "3",
      stroke: "currentColor",
      "stroke-width": "1.9",
    }),
    h("path", { d: "M5 11a7 7 0 0 0 14 0M12 18v3", ...stroke }),
  ]);

/**
 * `<sone-mic-toggle>` — the microphone's mute button: a pressed toggle with the mic
 * glyph and a "Mute" / "Muted" label (`compact` hides the label). Emits `muteToggle`;
 * the parent owns `muted`.
 */
export const SoneMicToggle = defineComponent({
  name: "SoneMicToggle",
  props: {
    muted: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** The accessible name while live (default: the "Mute microphone" message). */
    muteLabel: { type: String as PropType<string>, default: undefined },
    /** The accessible name while muted (default: the "Unmute microphone" message). */
    unmuteLabel: { type: String as PropType<string>, default: undefined },
  },
  emits: { muteToggle: () => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    return () => {
      const m = messages.value;
      const label = props.muted
        ? (props.unmuteLabel ?? m.micUnmute)
        : (props.muteLabel ?? m.micMute);
      return h(
        "sone-mic-toggle",
        {
          "data-slot": "mic-toggle",
          "data-state": props.muted ? "muted" : "live",
        },
        h(
          SoneToggle,
          {
            variant: "outline",
            type: "button",
            class: {
              mic: true,
              "is-muted": props.muted,
              "is-compact": props.compact,
            },
            pressed: props.muted,
            disabled: props.disabled,
            "aria-label": label,
            title: label,
            onClick: () => emit("muteToggle"),
          },
          () => [
            props.muted ? mutedGlyph() : liveGlyph(),
            props.compact
              ? null
              : h(
                  "span",
                  { class: "mic-label" },
                  props.muted ? m.micMuted : m.micMuteAction,
                ),
          ],
        ),
      );
    };
  },
});
