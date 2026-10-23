"use client";

import {
  createElement,
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { useControllable } from "../../utils/controllable";
import { mergeRefs } from "../../utils/refs";

export type NativeSelectSize = "default" | "sm";

export interface SoneSelectProps extends Omit<
  ComponentPropsWithRef<"select">,
  "value" | "defaultValue" | "size" | "multiple"
> {
  /** The picked option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** A user pick (never a change of `value` by the owner). */
  readonly onValueChange?: (value: string) => void;
  /** Only a user pick — never a programmatic `value` change. */
  readonly onSelectionChange?: (value: string) => void;
  readonly size?: NativeSelectSize;
  /** The `<select>`'s `id`; `id` works too. */
  readonly selectId?: string | null;
  readonly ariaLabel?: string | null;
  readonly invalid?: boolean;
  /** Extra ids for `aria-describedby` on the inner `<select>`. */
  readonly ariaDescribedby?: string | null;
}

/**
 * `<sone-select>` — a styled native `<select>`; `<option>`s are its children.
 * `value` / `defaultValue` / `onValueChange`; a user pick also calls `onSelectionChange`,
 * the owner changing `value` calls neither (as with a forms write in @surface-one/angular).
 * `className` / `style` style the host; every other prop (`ref` too) goes to the `<select>`.
 */
export function SoneSelect({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSelectionChange,
  disabled = false,
  size = "default",
  selectId,
  ariaLabel,
  invalid = false,
  ariaDescribedby,
  className,
  style,
  onChange,
  ref,
  children,
  ...control
}: SoneSelectProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const el = useRef<HTMLSelectElement | null>(null);
  const selectRef = useMemo(() => mergeRefs(el, ref), [ref]);
  // Re-asserts the value when late-rendered options made the <select> drift to its
  // first option; a value with no matching option is left alone.
  useLayoutEffect(() => {
    const select = el.current;
    if (!select || select.value === value) return;
    if (Array.from(select.options).some((o) => o.value === value))
      select.value = value;
  });
  return createElement(
    "sone-select",
    {
      className,
      style,
      "data-slot": "native-select-wrapper",
      "data-size": size,
      "data-disabled": disabled ? "true" : undefined,
    },
    <select
      {...control}
      ref={selectRef}
      data-slot="native-select"
      value={value}
      disabled={disabled}
      id={selectId ?? control.id}
      data-size={size}
      aria-label={ariaLabel ?? control["aria-label"]}
      aria-invalid={invalid ? "true" : control["aria-invalid"]}
      aria-describedby={ariaDescribedby ?? control["aria-describedby"]}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e);
        const v = e.target.value;
        setValue(v);
        onSelectionChange?.(v);
      }}
    >
      {children}
    </select>,
  );
}
