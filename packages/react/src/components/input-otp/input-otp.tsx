"use client";

import {
  createElement,
  Fragment,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
} from "react";

import { useControllable } from "../../utils/controllable";
import { mergeRefs } from "../../utils/refs";

/** Digits only — the default `pattern`. */
export const SONE_OTP_DIGITS = "^\\d+$";
/** Latin letters and digits. */
export const SONE_OTP_ALPHANUMERIC = "^[a-zA-Z0-9]+$";

const NUMERIC = ["^\\d+$", "^[0-9]+$", "^\\d*$", "^[0-9]*$"];

const SEPARATOR = (
  <svg viewBox="0 0 16 16" fill="none">
    <path
      d="M4 8h8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export interface SoneInputOtpProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "pattern" | "type" | "maxLength"
> {
  /** The code (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Every edit that fills all the slots, with the code. */
  readonly onComplete?: (code: string) => void;
  readonly length?: number;
  /** What one character may be (default: digits). */
  readonly pattern?: string | RegExp;
  /** Slot counts per group (`[3, 3]`), drawn with a separator between them. */
  readonly groups?: readonly number[] | null;
  readonly invalid?: boolean;
  readonly ariaLabel?: string | null;
  /** Extra ids for `aria-describedby` on the real input. */
  readonly ariaDescribedby?: string | null;
  readonly inputId?: string | null;
}

/**
 * `<sone-input-otp>` — a one-time code: `value` / `defaultValue` / `onValueChange`,
 * `onComplete`. One real `<input autocomplete="one-time-code">` lies transparent over
 * the slots, as in @surface-one/angular, so paste, autofill and screen readers just
 * work. `className` / `style` style the host; every other prop (`ref` too, for
 * `focus()`) goes to the input.
 */
export function SoneInputOtp({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  length = 6,
  pattern = SONE_OTP_DIGITS,
  groups: groupsProp = null,
  disabled = false,
  invalid = false,
  ariaLabel,
  ariaDescribedby,
  inputId,
  className,
  style,
  ref,
  onChange,
  onFocus,
  onBlur,
  onClick,
  onSelect,
  onKeyUp,
  ...control
}: SoneInputOtpProps) {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [focused, setFocused] = useState(false);
  const field = useRef<HTMLInputElement | null>(null);
  const fieldRef = useMemo(() => mergeRefs(field, ref), [ref]);

  const truncated = Math.trunc(length);
  const size = Number.isFinite(truncated) && truncated > 0 ? truncated : 6;
  const source = typeof pattern === "string" ? pattern : pattern.source;
  const flags = typeof pattern === "string" ? "" : pattern.flags;
  const charTest = useMemo(
    () => new RegExp(source, flags.replace(/[gy]/g, "")),
    [source, flags],
  );
  const g = (groupsProp ?? []).map((x) => Math.trunc(x));
  const ok =
    g.length > 0 && g.every((x) => x > 0) && g.reduce((a, b) => a + b) === size;
  let at = 0;
  const layout = (ok ? g : [size]).map((count) =>
    Array.from({ length: count }, () => at++),
  );
  const clean = (raw: string): string =>
    Array.from(raw)
      .filter((ch) => charTest.test(ch))
      .slice(0, size)
      .join("");

  const caretToEnd = (): void => {
    const el = field.current;
    if (!el) return;
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end)
      el.setSelectionRange(end, end);
  };
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange?.(e);
    const el = e.target;
    const v = clean(el.value);
    if (el.value !== v) el.value = v;
    setValue(v);
    caretToEnd();
    if (v.length === size) onComplete?.(v);
  };

  const chars = Array.from(clean(value));
  const active = Math.min(chars.length, size - 1);

  return createElement(
    "sone-input-otp",
    {
      className,
      style,
      "data-slot": "input-otp",
      "data-disabled": disabled ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
    },
    <input
      {...control}
      ref={fieldRef}
      className="otp-input"
      data-slot="input-otp-input"
      type="text"
      autoComplete="one-time-code"
      spellCheck="false"
      autoCapitalize="off"
      value={chars.join("")}
      disabled={disabled}
      id={inputId ?? control.id}
      maxLength={size}
      inputMode={NUMERIC.includes(charTest.source) ? "numeric" : "text"}
      aria-label={ariaLabel ?? control["aria-label"]}
      aria-describedby={ariaDescribedby ?? control["aria-describedby"]}
      aria-invalid={invalid ? "true" : control["aria-invalid"]}
      onChange={handleChange}
      onFocus={(e) => {
        onFocus?.(e);
        setFocused(true);
        caretToEnd();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        setFocused(false);
      }}
      onClick={(e) => {
        onClick?.(e);
        caretToEnd();
      }}
      onSelect={(e) => {
        onSelect?.(e);
        caretToEnd();
      }}
      onKeyUp={(e) => {
        onKeyUp?.(e);
        caretToEnd();
      }}
    />,
    <div className="otp-slots" aria-hidden="true">
      {layout.map((group, gi) => (
        <Fragment key={gi}>
          <div className="otp-group" data-slot="input-otp-group">
            {group.map((slot) => {
              const isActive = focused && slot === active;
              return (
                <div
                  key={slot}
                  className="otp-slot"
                  data-slot="input-otp-slot"
                  data-active={isActive ? "" : undefined}
                  data-filled={chars[slot] ? "" : undefined}
                >
                  {chars[slot] ?? ""}
                  {isActive && !chars[slot] ? (
                    <span className="otp-caret" />
                  ) : null}
                </div>
              );
            })}
          </div>
          {gi < layout.length - 1 ? (
            <div className="otp-separator" data-slot="input-otp-separator">
              {SEPARATOR}
            </div>
          ) : null}
        </Fragment>
      ))}
    </div>,
  );
}
