"use client";

import {
  createElement,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { useControllable } from "@surface-one/core/react/controllable";

export type SwitchSize = "default" | "sm";

export interface SoneSwitchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "checked" | "defaultChecked" | "value"
> {
  /** On / off (controlled), with `onCheckedChange`; or `defaultChecked`. */
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly size?: SwitchSize;
  /** The checkbox's `id` (for a `<label for>`); `id` works too. */
  readonly inputId?: string | null;
  readonly ariaLabel?: string | null;
  readonly invalid?: boolean;
}

// Intentionally still a native checkbox, not `role="switch"` — as in @surface-one/angular.
/**
 * `<sone-switch>` — an on / off checkbox: `checked` / `defaultChecked` / `onCheckedChange`.
 * `className` / `style` style the host; every other prop (`ref` too) goes to the checkbox.
 */
export function SoneSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  size = "default",
  inputId,
  ariaLabel,
  invalid = false,
  className,
  style,
  onChange,
  ...control
}: SoneSwitchProps): ReactElement {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  return createElement(
    "sone-switch",
    { className, style },
    <input
      {...control}
      className="switch"
      type="checkbox"
      data-slot="switch"
      checked={on}
      disabled={disabled}
      id={inputId ?? control.id}
      data-size={size}
      data-state={on ? "checked" : "unchecked"}
      aria-invalid={invalid ? "true" : control["aria-invalid"]}
      aria-label={ariaLabel ?? control["aria-label"]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        setOn(e.target.checked);
      }}
    />,
  );
}
