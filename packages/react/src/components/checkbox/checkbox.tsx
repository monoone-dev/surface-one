"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { useControllable } from "../../utils/controllable";
import { mergeRefs } from "../../utils/refs";

export interface SoneCheckboxProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "checked" | "defaultChecked" | "children"
> {
  /** Checked or not (controlled), with `onCheckedChange`; or `defaultChecked`. */
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  /** The mixed state ("some of them"), with `onIndeterminateChange`; a click clears it. */
  readonly indeterminate?: boolean;
  readonly defaultIndeterminate?: boolean;
  readonly onIndeterminateChange?: (indeterminate: boolean) => void;
}

/**
 * `input[soneCheckbox]` — the native checkbox, the React twin of the Angular directive:
 * `checked` / `defaultChecked` / `onCheckedChange` and `indeterminate` (the mixed state,
 * cleared when the user toggles it). Every other prop (`ref`, `id`, `name`, `disabled`,
 * `aria-invalid`, `onChange`) goes to the `<input>`, so a `<label htmlFor>` or a
 * `SoneField` pairs it.
 */
export function SoneCheckbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate,
  defaultIndeterminate = false,
  onIndeterminateChange,
  onChange,
  ref,
  ...rest
}: SoneCheckboxProps): ReactElement {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange);
  const [mixed, setMixed] = useControllable(
    indeterminate,
    defaultIndeterminate,
    onIndeterminateChange,
  );
  const el = useRef<HTMLInputElement | null>(null);
  const setRef = useMemo(() => mergeRefs(el, ref), [ref]);

  // A DOM property only (no attribute): set after every render, a click having dropped it.
  useLayoutEffect(() => {
    if (el.current) el.current.indeterminate = mixed;
  });

  return (
    <input
      {...rest}
      ref={setRef}
      type="checkbox"
      data-slot="checkbox"
      checked={on}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        setOn(event.target.checked);
        if (mixed) setMixed(false);
      }}
    />
  );
}
