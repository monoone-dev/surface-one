"use client";

import {
  createElement,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { RATING_STAR_PATH } from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

export type RatingSize = "sm" | "default" | "lg";

const glyph = (fill: number, key?: number) => (
  <span
    key={key}
    className="rating-glyph"
    style={{ "--rating-fill": String(fill) } as CSSProperties}
    aria-hidden="true"
  >
    <svg className="rating-base" viewBox="0 0 24 24">
      <path d={RATING_STAR_PATH} />
    </svg>
    <svg className="rating-fill" viewBox="0 0 24 24">
      <path d={RATING_STAR_PATH} />
    </svg>
  </span>
);

export interface SoneRatingProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  /** The score (controlled; 0 = no rating), with `onValueChange`; or `defaultValue`. */
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number) => void;
  readonly max?: number;
  readonly size?: RatingSize;
  readonly readonly?: boolean;
  readonly disabled?: boolean;
  /** Choosing the current score again clears it (to 0). */
  readonly clearable?: boolean;
  readonly ariaLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-rating>` — stars for a score. `readonly`: one image named "4.5 out of 5";
 * otherwise a native radio group: `value` / `defaultValue` / `onValueChange`.
 */
export function SoneRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  size = "default",
  readonly = false,
  disabled = false,
  clearable = false,
  ariaLabel,
  ...rest
}: SoneRatingProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [hover, setHover] = useState<number | null>(null);
  // useId, not a module counter: the server and the client must agree on the name.
  const name = `sone-rating-${useId()}`;

  const count = Math.max(1, Math.round(max));
  const shown = readonly ? value : (hover ?? value);
  const stars = Array.from({ length: count }, (_, i) => ({
    value: i + 1,
    fill: Math.min(Math.max(shown - i, 0), 1),
  }));

  const select = (n: number): void => {
    if (disabled || readonly) return;
    setValue(clearable && n === value ? 0 : n);
  };
  const preview = (n: number | null): void => {
    if (!disabled && !readonly) setHover(n);
  };

  const host = {
    "data-slot": "rating",
    "data-size": size,
    "data-readonly": readonly ? "" : undefined,
    "data-disabled": disabled ? "" : undefined,
    ...rest,
  };
  if (readonly) {
    const score = Math.round(value * 10) / 10;
    const text = messages.ratingSummary(score, max);
    return createElement(
      "sone-rating",
      host,
      <span
        className="rating-stars"
        role="img"
        aria-label={ariaLabel ? `${ariaLabel}: ${text}` : text}
      >
        {stars.map((s) => glyph(s.fill, s.value))}
      </span>,
    );
  }
  return createElement(
    "sone-rating",
    host,
    <div
      className="rating-stars"
      role="radiogroup"
      aria-label={ariaLabel ?? messages.ratingLabel}
      onMouseLeave={() => preview(null)}
    >
      {stars.map((s) => (
        <label
          key={s.value}
          className="rating-star"
          onMouseEnter={() => preview(s.value)}
        >
          <input
            className="rating-input"
            type="radio"
            name={name}
            value={s.value}
            checked={value === s.value}
            disabled={disabled}
            onChange={() => select(s.value)}
            onClick={() => {
              if (clearable && s.value === value) select(s.value);
            }}
          />
          <span className="sr-only">{messages.ratingStar(s.value)}</span>
          {glyph(s.fill)}
        </label>
      ))}
    </div>,
  );
}
