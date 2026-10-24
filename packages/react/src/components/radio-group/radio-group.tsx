"use client";

import {
  createContext,
  createElement,
  useContext,
  useId,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { useControllable } from "../../utils/controllable";
import { cx, flag } from "../../utils/part";

export type RadioGroupOrientation = "vertical" | "horizontal";

interface RadioGroupContext {
  readonly name: string;
  readonly value: string | null;
  readonly disabled: boolean;
  readonly required: boolean;
  select(value: string): void;
}

const RADIO_GROUP = createContext<RadioGroupContext | null>(null);

export interface SoneRadioGroupProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Render a `fieldset` (with a `legend`) instead of a `div` (give it an `aria-label`). */
  readonly as?: "div" | "fieldset";
  /** The checked radio's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string) => void;
  /** The `name` every radio of the group shares; unique by default. */
  readonly name?: string;
  /** Disables every radio of the group. */
  readonly disabled?: boolean;
  /** One of the radios must be checked (the native `required`). */
  readonly required?: boolean;
  /** Lays the radios out in a column or a row. */
  readonly orientation?: RadioGroupOrientation;
}

/**
 * `[soneRadioGroup]` — a set of native radios with one value (`role="radiogroup"`):
 * `value` / `defaultValue` / `onValueChange`, a shared `name` (unique by default),
 * `disabled`, `required`, `orientation`. The browser keeps the arrow keys and the single
 * Tab stop of radios that share a name.
 */
export function SoneRadioGroup({
  as = "div",
  value: valueProp,
  defaultValue = null,
  onValueChange,
  name,
  disabled = false,
  required = false,
  orientation = "vertical",
  className,
  children,
  ...rest
}: SoneRadioGroupProps): ReactElement {
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange as ((value: string | null) => void) | undefined,
  );
  const uid = `sone-radio-group-${useId()}`;
  const context: RadioGroupContext = {
    name: name ?? uid,
    value,
    disabled,
    required,
    select: setValue,
  };
  return (
    <RADIO_GROUP.Provider value={context}>
      {createElement(
        as,
        {
          "data-slot": "radio-group",
          role: "radiogroup",
          "data-orientation": orientation,
          "data-disabled": flag(disabled),
          "aria-disabled": disabled ? "true" : undefined,
          "aria-required": required ? "true" : undefined,
          ...rest,
          className: cx("radio-group", className),
        },
        children,
      )}
    </RADIO_GROUP.Provider>
  );
}

export interface SoneRadioProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "value" | "children"
> {
  /** What the group's value becomes when this radio is checked. */
  readonly value: string;
}

/**
 * `input[soneRadio]` — one native radio of a `SoneRadioGroup`: it takes the group's
 * `name`, is checked while its `value` is the group's, and checks it when picked. Every
 * other prop (`ref`, `id`, `aria-label`, `onChange`) goes to the `<input>`.
 */
export function SoneRadio({
  value,
  disabled = false,
  onChange,
  ...rest
}: SoneRadioProps): ReactElement {
  const group = useContext(RADIO_GROUP);
  return (
    <input
      type="radio"
      data-slot="radio"
      name={group?.name}
      value={value}
      {...(group && { checked: group.value === value })}
      disabled={disabled || !!group?.disabled}
      required={group?.required || undefined}
      {...rest}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        onChange?.(event);
        if (event.target.checked) group?.select(value);
      }}
    />
  );
}
