"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useControllable } from "@surface-one/core/react/controllable";
import { SoneIcon, type ShellIcon } from "../icon/icon";
import {
  SoneToggleGroup,
  SoneToggleGroupItem,
  type ToggleOrientation,
  type ToggleSize,
  type ToggleVariant,
} from "../toggle-group/toggle-group";

export interface SegmentOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: ShellIcon;
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
}

export interface SoneSegmentedProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  readonly options: readonly SegmentOption[];
  /** The picked option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly ariaLabel?: string | null;
  readonly size?: ToggleSize;
  readonly variant?: ToggleVariant;
  readonly orientation?: ToggleOrientation;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-segmented>` — pick one of a few options: `value` / `defaultValue` / `onValueChange`. */
export function SoneSegmented({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  ariaLabel,
  size = "default",
  variant = "outline",
  orientation = "horizontal",
  ...rest
}: SoneSegmentedProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  return createElement(
    "sone-segmented",
    { "data-slot": "segmented", ...rest },
    <SoneToggleGroup
      variant={variant}
      size={size}
      orientation={orientation}
      role="group"
      aria-label={ariaLabel ?? undefined}
    >
      {options.map((o) => {
        const glyphOnly = !!o.iconOnly && !!o.icon;
        return (
          <SoneToggleGroupItem
            key={o.value}
            type="button"
            pressed={value === o.value}
            disabled={o.disabled ?? false}
            aria-label={glyphOnly ? o.label : undefined}
            title={glyphOnly ? o.label : undefined}
            onClick={() => setValue(o.value)}
          >
            {o.icon ? (
              <SoneIcon icon={o.icon} inline={glyphOnly ? null : "start"} />
            ) : null}
            {glyphOnly ? null : o.label}
          </SoneToggleGroupItem>
        );
      })}
    </SoneToggleGroup>,
  );
}
