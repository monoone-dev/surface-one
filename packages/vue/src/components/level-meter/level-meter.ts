import { computed, defineComponent, h, type PropType } from "vue";

const unit = (v: number): number =>
  Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;

/**
 * `<sone-level-meter>` — a row of bars for a microphone's input level. With `level`
 * alone the bars sway with it; with `history` (recent levels 0..1, oldest first) each
 * bar draws one real sample, the newest at the end. Decorative (`aria-hidden`).
 */
export const SoneLevelMeter = defineComponent({
  name: "SoneLevelMeter",
  props: {
    /** The current input level, 0..1 — drives the synthetic sway. */
    level: { type: Number, default: 0 },
    bars: { type: Number, default: 30 },
    /** Recent levels (0..1), oldest first; each bar draws one sample instead of the sway. */
    history: {
      type: Array as PropType<readonly number[] | null>,
      default: null,
    },
  },
  setup(props) {
    const count = computed(() => Math.max(0, Math.floor(props.bars)));
    /** One value per bar, right-aligned to the newest sample; `null` in sway mode. */
    const samples = computed<number[] | null>(() => {
      const history = props.history;
      if (!history) return null;
      const n = count.value;
      const recent = history.slice(Math.max(0, history.length - n));
      return [
        ...Array.from({ length: n - recent.length }, () => 0),
        ...recent.map(unit),
      ];
    });
    return () => {
      const values = samples.value;
      return h(
        "sone-level-meter",
        {
          "data-slot": "level-meter",
          "aria-hidden": "true",
          "data-mode": props.history ? "history" : "sway",
          style: { "--level": unit(props.level) },
        },
        Array.from({ length: count.value }, (_, b) =>
          h("span", {
            key: b,
            class: "bar",
            style: values ? { "--i": b, "--v": values[b] } : { "--i": b },
          }),
        ),
      );
    };
  },
});
