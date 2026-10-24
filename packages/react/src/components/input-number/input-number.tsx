"use client";

import {
  createElement,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type InputNumberSize = "sm" | "default";

export interface SoneInputNumberProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  /** The number (controlled; `null` = empty), with `onValueChange`; or `defaultValue`. */
  readonly value?: number | null;
  readonly defaultValue?: number | null;
  readonly onValueChange?: (value: number | null) => void;
  readonly min?: number | null;
  readonly max?: number | null;
  readonly step?: number;
  readonly size?: InputNumberSize;
  readonly placeholder?: string;
  readonly inputId?: string | null;
  readonly ariaLabel?: string | null;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly decrementLabel?: string | null;
  readonly incrementLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-input-number>` — a number field with − and + buttons, a WAI-ARIA spinbutton
 * (↑ / ↓, Page Up / Down, Home / End): `value` / `defaultValue` / `onValueChange`
 * (`number | null`). Other props go to the host.
 */
export function SoneInputNumber({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min = null,
  max = null,
  step = 1,
  size = "default",
  placeholder = "",
  inputId,
  ariaLabel,
  disabled = false,
  invalid = false,
  decrementLabel,
  incrementLabel,
  ...rest
}: SoneInputNumberProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<number | null>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [draft, setDraft] = useState<string | null>(null);

  const text = draft !== null ? draft : value === null ? "" : String(value);
  const atMin = value !== null && min !== null && value <= min;
  const atMax = value !== null && max !== null && value >= max;

  const clamp = (n: number): number => {
    let v = n;
    if (min !== null) v = Math.max(v, min);
    if (max !== null) v = Math.min(v, max);
    const decimals = (String(step).split(".")[1] ?? "").length;
    return Number(v.toFixed(decimals));
  };
  const commit = (v: number | null): void => {
    setDraft(null);
    setValue(v);
  };
  const stepBy = (times: number): void => {
    if (disabled) return;
    commit(clamp((value ?? min ?? 0) + step * times));
  };
  const parseDraft = (): void => {
    if (draft === null) return;
    const trimmed = draft.trim().replace(",", ".");
    const n = Number(trimmed);
    if (trimmed === "") commit(null);
    else if (Number.isFinite(n)) commit(clamp(n));
    setDraft(null);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => stepBy(1),
      ArrowDown: () => stepBy(-1),
      PageUp: () => stepBy(10),
      PageDown: () => stepBy(-10),
      Home: () => min !== null && commit(min),
      End: () => max !== null && commit(max),
      Enter: parseDraft,
    };
    const run = keys[e.key];
    if (!run) return;
    if (e.key !== "Enter") e.preventDefault();
    run();
  };

  const stepButton = (dir: -1 | 1) => (
    <SoneButton
      className="input-number-step"
      variant="ghost"
      size={size === "sm" ? "icon-xs" : "icon-sm"}
      type="button"
      tabIndex={-1}
      data-slot={dir < 0 ? "input-number-decrement" : "input-number-increment"}
      aria-label={
        dir < 0
          ? (decrementLabel ?? messages.decrease)
          : (incrementLabel ?? messages.increase)
      }
      aria-controls={inputId ?? undefined}
      disabled={disabled || (dir < 0 ? atMin : atMax)}
      onClick={() => stepBy(dir)}
    >
      <SoneIcon icon={dir < 0 ? "minus" : "plus"} />
    </SoneButton>
  );

  return createElement(
    "sone-input-number",
    {
      "data-slot": "input-number",
      "data-size": size,
      "data-invalid": invalid ? "true" : undefined,
      "data-disabled": disabled ? "true" : undefined,
      ...rest,
    },
    stepButton(-1),
    <input
      className="input-number-field"
      data-slot="input-number-field"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      role="spinbutton"
      id={inputId ?? undefined}
      aria-label={ariaLabel ?? undefined}
      aria-valuenow={value ?? undefined}
      aria-valuemin={min ?? undefined}
      aria-valuemax={max ?? undefined}
      aria-invalid={invalid ? "true" : undefined}
      placeholder={placeholder}
      value={text}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={parseDraft}
    />,
    stepButton(1),
  );
}
