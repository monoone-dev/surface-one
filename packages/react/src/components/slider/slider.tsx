"use client";

import {
  createElement,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";

import { useControllable } from "../../utils/controllable";

export interface SoneSliderProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "defaultValue" | "min" | "max" | "step"
> {
  /** The number (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly ariaLabel?: string | null;
}

/**
 * `<sone-slider>` — a styled native range input: `value` / `defaultValue` / `onValueChange`.
 * `className` / `style` style the host; every other prop (`ref` too) goes to the input.
 */
export function SoneSlider({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  ariaLabel,
  className,
  style,
  onChange,
  ...control
}: SoneSliderProps) {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const span = max - min;
  const frac = (value - min) / span;
  const fill =
    !Number.isFinite(span) || span <= 0
      ? "0%"
      : `${Math.min(Math.max(Number.isFinite(frac) ? frac : 0, 0), 1) * 100}%`;
  return createElement(
    "sone-slider",
    {
      className,
      style,
      "data-slot": "slider",
      "data-orientation": "horizontal",
      "data-disabled": disabled ? "" : undefined,
    },
    <input
      {...control}
      className="sone-range"
      style={{ "--sone-range-fill": fill } as CSSProperties}
      type="range"
      data-slot="slider-thumb"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel ?? control["aria-label"]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        setValue(Number(e.target.value));
      }}
    />,
  );
}
