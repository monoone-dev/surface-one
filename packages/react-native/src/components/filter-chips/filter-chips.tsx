import type { ReactNode, ReactElement } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneStyles, useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  type SoneForeground,
} from "../../theme/foreground";
import { em, fontFamily, shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { pressedProps } from "../../utils/a11y";
import { SoneBadge } from "../badge/badge";
import {
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../toggle-group/toggle-group";

export type FilterChipTone =
  "default" | "danger" | "warning" | "success" | "accent";

export interface FilterChipOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  /** Shown in a badge after the label; leave it out (or `null`) for none. */
  readonly count?: number | null;
  /** Tints the count badge (`danger` for errors, `warning` for warnings). */
  readonly tone?: FilterChipTone;
  readonly disabled?: boolean;
}

export type FilterChipsVariant = "toggle" | "tabs";
export type FilterChipsSize = "sm" | "default";

const COUNT_VARIANT = {
  default: "secondary",
  danger: "destructive",
  warning: "warning",
  success: "success",
  accent: "accent",
} as const;

/** The count badge: a `SoneBadge` in the tone's look. */
function Count({
  count,
  tone,
}: {
  readonly count: number;
  readonly tone: FilterChipTone;
}) {
  return <SoneBadge variant={COUNT_VARIANT[tone]}>{String(count)}</SoneBadge>;
}

/** One trigger of the tabs look — `.tabs-trigger`. */
function TabsTrigger({
  active,
  disabled,
  onPress,
  children,
}: {
  readonly active: boolean;
  readonly disabled: boolean;
  readonly onPress: () => void;
  readonly children: ReactNode;
}) {
  const focus = useFocusRing();
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    const fg: SoneForeground = {
      color: t.tabsTriggerFg,
      fontSize: t.fontSizeSm,
      fontWeight: weight(t.fontWeightMedium),
      fontFamily: fontFamily(th),
      lineHeight: Math.round(t.fontSizeSm * t.leadingNone),
      iconSize: t.controlIcon,
    };
    return {
      rest: {
        flexGrow: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: t.controlGapMd,
        alignSelf: "stretch",
        paddingHorizontal: t.tabsTriggerPx,
        borderWidth: t.tabsTriggerBorderWidth,
        borderColor: "transparent",
        borderRadius: t.tabsTriggerRadius,
      } as ViewStyle,
      active: {
        borderColor: t.tabsActiveBorder,
        backgroundColor: t.tabsActiveBg,
        ...shadow(t.tabsActiveShadow),
      } as ViewStyle,
      focused: {
        borderColor: t.accentEdge,
        ...shadow(t.focusRing),
      } as ViewStyle,
      disabled: { opacity: t.disabledOpacity } as ViewStyle,
      fg,
      activeFg: { ...fg, color: t.tabsActiveFg },
      pressedFg: { ...fg, color: t.textPrimary },
    };
  });
  return (
    <Pressable
      {...pressedProps(active)}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={[
        s.rest,
        active && s.active,
        focus.focused && s.focused,
        disabled && s.disabled,
      ]}
    >
      {({ pressed }) => (
        <SoneForegroundProvider
          value={
            active ? s.activeFg : pressed && !disabled ? s.pressedFg : s.fg
          }
        >
          {children}
        </SoneForegroundProvider>
      )}
    </Pressable>
  );
}

export interface SoneFilterChipsProps {
  readonly options: readonly FilterChipOption[];
  /** The selected option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: FilterChipsVariant;
  /** The chip size of `variant="toggle"` (the tabs list has one size). */
  readonly size?: FilterChipsSize;
  /** Names the group ("Filter by level"). */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-filter-chips>` — one-of-many filter buttons rendered from data, with an optional
 * count badge per option. `variant="toggle"` is an outline Toggle Group of separate chips;
 * `variant="tabs"` the Tabs list look. Either way each option is a toggle button in a
 * labelled `group` — a filter, not a tab panel. `value` / `defaultValue` / `onValueChange`.
 */
export function SoneFilterChips({
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  variant = "toggle",
  size = "sm",
  ariaLabel,
  style,
  testID,
}: SoneFilterChipsProps): ReactElement {
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange as ((value: string | null) => void) | undefined,
  );
  const list = useSoneStyles(
    ({ tokens: t }) =>
      ({
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: t.tabsListGap,
        height: t.controlHMd,
        padding: t.tabsListPad,
        borderWidth: t.tabsListBorderWidth,
        borderColor: t.borderSubtle,
        borderRadius: t.tabsRadius,
        backgroundColor: t.tabsListBg,
      }) as ViewStyle,
  );
  const label = (o: FilterChipOption) => [
    <SoneText key="l">{o.label}</SoneText>,
    o.count != null ? (
      <Count key="c" count={o.count} tone={o.tone ?? "default"} />
    ) : null,
  ];
  const pick = (o: FilterChipOption) => {
    if (!o.disabled) setValue(o.value);
  };
  if (variant === "tabs")
    return (
      <View
        role="group"
        aria-label={ariaLabel ?? undefined}
        testID={testID}
        style={[list, style]}
      >
        {options.map((o) => (
          <TabsTrigger
            key={o.value}
            active={value === o.value}
            disabled={!!o.disabled}
            onPress={() => pick(o)}
          >
            {label(o)}
          </TabsTrigger>
        ))}
      </View>
    );
  return (
    <SoneToggleGroup
      variant="outline"
      spacing={2}
      size={size === "sm" ? "sm" : "default"}
      aria-label={ariaLabel ?? undefined}
      testID={testID}
      style={style}
    >
      {options.map((o) => (
        <SoneToggleGroupItem
          key={o.value}
          pressed={value === o.value}
          disabled={!!o.disabled}
          onPress={() => pick(o)}
        >
          {label(o)}
        </SoneToggleGroupItem>
      ))}
    </SoneToggleGroup>
  );
}
