import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

const unit = (v: number): number =>
  Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;

export interface SoneLevelMeterProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** The current input level, 0..1 — drives the synthetic sway. */
  readonly level?: number;
  readonly bars?: number;
  /** Recent levels (0..1), oldest first; each bar draws one sample instead of the sway. */
  readonly history?: readonly number[] | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-level-meter>` — a row of bars for a microphone's input level. With `level`
 * alone the bars sway with it; with `history` (recent levels 0..1, oldest first) each
 * bar draws one real sample, the newest at the end. Decorative (`aria-hidden`).
 */
export function SoneLevelMeter({
  level = 0,
  bars = 30,
  history = null,
  style,
  ...rest
}: SoneLevelMeterProps): ReactElement {
  const count = Math.max(0, Math.floor(bars));
  let values: number[] | null = null;
  if (history) {
    const recent = history.slice(Math.max(0, history.length - count));
    values = [
      ...Array.from({ length: count - recent.length }, () => 0),
      ...recent.map(unit),
    ];
  }
  return createElement(
    "sone-level-meter",
    {
      "data-slot": "level-meter",
      "aria-hidden": "true",
      "data-mode": history ? "history" : "sway",
      ...rest,
      style: { "--level": unit(level), ...style } as CSSProperties,
    },
    Array.from({ length: count }, (_, b) => (
      <span
        key={b}
        className="bar"
        style={
          (values
            ? { "--i": b, "--v": values[b] }
            : { "--i": b }) as unknown as CSSProperties
        }
      />
    )),
  );
}
