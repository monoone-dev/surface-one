"use client";

import {
  createElement,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type PasswordAutocomplete = "current-password" | "new-password" | "off";

const EYE_OFF = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1.8 12S6 4.8 12 4.8 22.2 12 22.2 12 18 19.2 12 19.2 1.8 12 1.8 12z" />
    <circle cx="12" cy="12" r="3.1" />
    <path d="M3.5 3.5l17 17" />
  </svg>
);

export interface SonePasswordInputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "type" | "autoComplete"
> {
  /** The password (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Shown as text (controlled), with `onVisibleChange`; or `defaultVisible`. */
  readonly visible?: boolean;
  readonly defaultVisible?: boolean;
  readonly onVisibleChange?: (visible: boolean) => void;
  readonly autoComplete?: PasswordAutocomplete;
  readonly inputId?: string | null;
  readonly ariaLabel?: string | null;
  readonly ariaDescribedby?: string | null;
  readonly invalid?: boolean;
  /** The toggle's name (default: the "Show password" message). */
  readonly toggleLabel?: string | null;
}

/**
 * `<sone-password-input>` — a password field with a show / hide toggle button
 * (`aria-pressed`): `value` / `defaultValue` / `onValueChange` and `visible` /
 * `defaultVisible` / `onVisibleChange`. `className` / `style` style the host; every
 * other prop (`ref` too, for `focus()`) goes to the input.
 */
export function SonePasswordInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  autoComplete = "current-password",
  placeholder = "",
  inputId,
  ariaLabel,
  ariaDescribedby,
  invalid = false,
  disabled = false,
  readOnly = false,
  toggleLabel,
  className,
  style,
  onChange,
  ...control
}: SonePasswordInputProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [visible, setVisible] = useControllable(
    visibleProp,
    defaultVisible,
    onVisibleChange,
  );
  const label = toggleLabel ?? messages.showPassword;
  return createElement(
    "sone-password-input",
    {
      className,
      style,
      "data-slot": "password-input",
      "data-visible": visible ? "" : undefined,
    },
    <SoneInputGroup invalid={invalid} disabled={disabled}>
      <input
        {...control}
        data-slot="input-group-control"
        spellCheck="false"
        autoCapitalize="off"
        type={visible ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        id={inputId ?? control.id}
        autoComplete={autoComplete}
        aria-label={ariaLabel ?? control["aria-label"]}
        aria-describedby={ariaDescribedby ?? control["aria-describedby"]}
        aria-invalid={invalid ? "true" : control["aria-invalid"]}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e);
          setValue(e.target.value);
        }}
      />
      <SoneInputGroupAddon as="span" align="inline-end">
        <SoneButton
          variant="ghost"
          size="icon-xs"
          type="button"
          data-slot="password-input-toggle"
          disabled={disabled}
          aria-pressed={visible ? "true" : "false"}
          aria-label={label}
          title={label}
          onClick={() => setVisible(!visible)}
        >
          {visible ? EYE_OFF : <SoneIcon icon="eye" />}
        </SoneButton>
      </SoneInputGroupAddon>
    </SoneInputGroup>,
  );
}
