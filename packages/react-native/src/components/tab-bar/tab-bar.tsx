import type { ReactNode, ReactElement } from "react";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneStyles } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import type { SoneGlyph } from "../icon/glyph";
import { SoneIcon, type ShellIcon } from "../icon/icon";

export interface TabBarIconState {
  readonly active: boolean;
  /** The ink of the tab (on-accent when active). */
  readonly color: string;
  /** The icon size, in dp. */
  readonly size: number;
}

export interface TabBarItem {
  readonly value: string;
  /** The visible label and the tab's accessible name. */
  readonly label: string;
  /** A SurfaceOne glyph. */
  readonly icon?: ShellIcon;
  /** Your own glyph in the same shape, instead of `icon`. */
  readonly glyph?: SoneGlyph;
  /** Your icon library's icon (Ionicons, Lucide …) instead of `icon` / `glyph`. */
  readonly renderIcon?: (state: TabBarIconState) => ReactNode;
  readonly disabled?: boolean;
  readonly testID?: string;
}

export type TabBarLabels = "active" | "always";

export interface SoneTabBarProps {
  readonly items: readonly TabBarItem[];
  /** The active tab's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Names the tab list. */
  readonly ariaLabel?: string | null;
  /** `active` (the default) shows the label of the active tab only; `always` of every tab. */
  readonly labels?: TabBarLabels;
  /**
   * Float over the screen: pinned to the bottom, centred, as a pill (the default).
   * `false` renders it in the flow, full width, as a bar with a top hairline.
   */
  readonly floating?: boolean;
  /** The safe-area bottom inset (`useSafeAreaInsets().bottom`). */
  readonly bottomInset?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

interface TabProps {
  readonly item: TabBarItem;
  readonly active: boolean;
  readonly showLabel: boolean;
  readonly onPress: () => void;
}

function Tab({ item, active, showLabel, onPress }: TabProps) {
  const focus = useFocusRing();
  const s = useSoneStyles((th) => {
    const t = th.tokens;
    return {
      tab: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: t.controlGapMd,
        minWidth: t.controlHLg,
        minHeight: t.controlHLg,
        paddingHorizontal: t.controlPxMd,
        borderRadius: t.radiusPill,
      } as ViewStyle,
      active: { backgroundColor: t.accent } as ViewStyle,
      pressed: { backgroundColor: t.surfaceHover } as ViewStyle,
      activePressed: { backgroundColor: t.accentHover } as ViewStyle,
      focused: { boxShadow: t.focusRing } as ViewStyle,
      disabled: { opacity: t.disabledOpacity } as ViewStyle,
      activeInk: t.textOnAccent,
      ink: t.textSecondary,
      size: t.controlIcon + t.space1,
      fontSize: t.fontSizeSm,
      lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
      weight: weight(t.fontWeightMedium),
    };
  });
  const color = active ? s.activeInk : s.ink;
  return (
    <Pressable
      role="tab"
      aria-label={item.label}
      aria-selected={active}
      aria-disabled={item.disabled || undefined}
      disabled={item.disabled}
      onPress={onPress}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      testID={item.testID}
      style={({ pressed }) => [
        s.tab,
        active && s.active,
        pressed && !item.disabled && (active ? s.activePressed : s.pressed),
        focus.focused && s.focused,
        item.disabled && s.disabled,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color,
          fontSize: s.fontSize,
          fontWeight: s.weight,
          lineHeight: s.lineHeight,
          iconSize: s.size,
        }}
      >
        {item.renderIcon ? (
          item.renderIcon({ active, color, size: s.size })
        ) : item.icon || item.glyph ? (
          <SoneIcon name={item.icon} glyph={item.glyph} />
        ) : null}
        {showLabel ? <SoneText aria-hidden>{item.label}</SoneText> : null}
      </SoneForegroundProvider>
    </Pressable>
  );
}

/**
 * `<sone-tab-bar>` — a bottom tab bar: a floating pill by default, icons with the active
 * tab's label beside its icon. `value` / `defaultValue` / `onValueChange`; each tab is
 * `role="tab"` named by its label even while the label is hidden. Pass `bottomInset`.
 */
export function SoneTabBar({
  items,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  ariaLabel,
  labels = "active",
  floating = true,
  bottomInset = 0,
  style,
  testID,
}: SoneTabBarProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const s = useSoneStyles(
    (th) => {
      const t = th.tokens;
      return {
        dock: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: bottomInset + t.space6,
          alignItems: "center",
          zIndex: 999,
        } as ViewStyle,
        pill: {
          flexDirection: "row",
          alignItems: "center",
          gap: t.space1,
          padding: t.space2,
          borderRadius: t.radiusPill,
          borderWidth: t.borderWidthThin,
          borderColor: t.border,
          backgroundColor: t.surfaceOverlay,
          ...shadow(t.shadowLg),
        } as ViewStyle,
        bar: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          paddingTop: t.space2,
          paddingHorizontal: t.space2,
          paddingBottom: bottomInset + t.space2,
          borderTopWidth: t.borderWidthThin,
          borderTopColor: t.border,
          backgroundColor: t.surfaceRaised,
        } as ViewStyle,
      };
    },
    [bottomInset],
  );
  const tabs = (
    <View
      role="tablist"
      aria-label={ariaLabel ?? undefined}
      testID={testID}
      style={[floating ? s.pill : s.bar, !floating && style]}
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          item={item}
          active={item.value === value}
          showLabel={labels === "always" || item.value === value}
          onPress={() => setValue(item.value)}
        />
      ))}
    </View>
  );
  return floating ? (
    <View pointerEvents="box-none" style={[s.dock, style]}>
      {tabs}
    </View>
  ) : (
    tabs
  );
}
