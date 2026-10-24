import type { ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";

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
  /** Only the icon shows; `label` becomes its accessible name. */
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
}

export interface SoneSegmentedProps {
  readonly options: readonly SegmentOption[];
  /** The picked option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  readonly ariaLabel?: string | null;
  readonly size?: ToggleSize;
  readonly variant?: ToggleVariant;
  readonly orientation?: ToggleOrientation;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
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
  style,
  testID,
}: SoneSegmentedProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  return (
    <SoneToggleGroup
      variant={variant}
      size={size}
      orientation={orientation}
      aria-label={ariaLabel ?? undefined}
      style={style}
      testID={testID}
    >
      {options.map((o) => {
        const glyphOnly = !!o.iconOnly && !!o.icon;
        return (
          <SoneToggleGroupItem
            key={o.value}
            pressed={value === o.value}
            disabled={o.disabled ?? false}
            aria-label={glyphOnly ? o.label : undefined}
            onPress={() => setValue(o.value)}
          >
            {o.icon ? <SoneIcon name={o.icon} /> : null}
            {glyphOnly ? null : o.label}
          </SoneToggleGroupItem>
        );
      })}
    </SoneToggleGroup>
  );
}
