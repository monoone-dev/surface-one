import type { ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { useSoneTheme } from "../../theme/context";
import { shadow } from "../../theme/style";

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
  const t = useSoneTheme().tokens;
  // A skin can draw the joined outline group as a capsule well with a raised thumb (Surface):
  // the same --segmented-* tokens as the shared stylesheet.
  const well = variant === "outline" && orientation === "horizontal";
  const pad = t.segmentedPad;
  const height =
    size === "sm" ? t.controlHSm : size === "lg" ? t.controlHLg : t.controlHMd;
  const outer = Math.max(t.segmentedItemRadius, t.controlRadius);
  const itemStyle = (
    on: boolean,
    first: boolean,
    last: boolean,
  ): ViewStyle => ({
    height: height - 2 * pad,
    ...(t.segmentedItemBorder !== t.toggleOutlineBorder && {
      borderColor: t.segmentedItemBorder,
    }),
    borderTopLeftRadius: first ? outer : t.segmentedItemRadius,
    borderBottomLeftRadius: first ? outer : t.segmentedItemRadius,
    borderTopRightRadius: last ? outer : t.segmentedItemRadius,
    borderBottomRightRadius: last ? outer : t.segmentedItemRadius,
    backgroundColor: on ? t.segmentedOnBg : t.segmentedItemBg,
    ...(on && shadow(t.segmentedOnShadow)),
  });
  return (
    <SoneToggleGroup
      variant={variant}
      size={size}
      orientation={orientation}
      aria-label={ariaLabel ?? undefined}
      style={[
        well && {
          padding: pad,
          borderRadius: t.segmentedRadius,
          backgroundColor: t.segmentedBg,
        },
        style,
      ]}
      testID={testID}
    >
      {options.map((o, i) => {
        const glyphOnly = !!o.iconOnly && !!o.icon;
        return (
          <SoneToggleGroupItem
            key={o.value}
            pressed={value === o.value}
            disabled={o.disabled ?? false}
            aria-label={glyphOnly ? o.label : undefined}
            onPress={() => setValue(o.value)}
            style={
              well
                ? itemStyle(
                    value === o.value,
                    i === 0,
                    i === options.length - 1,
                  )
                : undefined
            }
          >
            {o.icon ? <SoneIcon name={o.icon} /> : null}
            {glyphOnly ? null : o.label}
          </SoneToggleGroupItem>
        );
      })}
    </SoneToggleGroup>
  );
}
