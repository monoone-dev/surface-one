"use client";

import {
  createElement,
  Fragment,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import {
  SONE_OTP_DIGITS,
  cleanOtp,
  otpCharTest,
  otpInputMode,
  otpLayout,
  otpSize,
} from "@surface-one/core";

export { SONE_OTP_ALPHANUMERIC, SONE_OTP_DIGITS } from "@surface-one/core";

import { useControllable } from "../../utils/controllable";
import { mergeRefs } from "../../utils/refs";

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
}: SoneInputOtpProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [focused, setFocused] = useState(false);
  const field = useRef<HTMLInputElement | null>(null);
  const fieldRef = useMemo(() => mergeRefs(field, ref), [ref]);

  const size = otpSize(length);
  const source = typeof pattern === "string" ? pattern : pattern.source;
  const flags = typeof pattern === "string" ? "" : pattern.flags;
  const charTest = useMemo(
    () => otpCharTest(new RegExp(source, flags)),
    [source, flags],
  );
  const layout = otpLayout(groupsProp, size);
  const clean = (raw: string): string => cleanOtp(raw, charTest, size);

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
      inputMode={otpInputMode(charTest)}
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
