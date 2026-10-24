import { useState, type ReactElement } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { fontFamily, shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";

export type NativeSelectSize = "default" | "sm";

export interface SoneSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SoneSelectProps {
  readonly options: readonly SoneSelectOption[];
  /** The picked option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  /** A user pick (never a change of `value` by the owner). */
  readonly onValueChange?: (value: string) => void;
  /** Only a user pick — never a programmatic `value` change. */
  readonly onSelectionChange?: (value: string) => void;
  /** Shown while no option is picked. */
  readonly placeholder?: string;
  readonly size?: NativeSelectSize;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** Names the trigger and the list. */
  readonly ariaLabel?: string | null;
  /** The list opened or closed. */
  readonly onOpenChange?: (open: boolean) => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-select>` — a field-styled trigger that opens the options in a modal list (the
 * native `<select>` picker on the web). `value` / `defaultValue` / `onValueChange`; a
 * user pick also calls `onSelectionChange`.
 */
export function SoneSelect({
  options,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSelectionChange,
  placeholder = "",
  size = "default",
  disabled = false,
  invalid = false,
  ariaLabel,
  onOpenChange,
  style,
  testID,
}: SoneSelectProps): ReactElement {
  const theme = useSoneTheme();
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [open, setOpenState] = useState(false);
  const focus = useFocusRing();
  const s = useSoneStyles(
    (th) => {
      const t = th.tokens;
      const ring = (r: string) => [t.inputShadow, r].filter(Boolean).join(", ");
      return {
        trigger: {
          flexDirection: "row",
          alignItems: "center",
          height: size === "sm" ? t.controlHSm : t.controlHMd,
          paddingLeft: t.controlPxMd,
          paddingRight:
            t.nativeSelectIconInset + t.controlIcon + t.controlGapMd,
          borderWidth: t.borderWidthThin,
          borderColor: t.inputBorder,
          borderRadius:
            size === "sm" ? t.nativeSelectRadiusSm : t.controlRadius,
          backgroundColor: t.inputBg,
          ...shadow(t.inputShadow),
        } as ViewStyle,
        pressed: {
          borderColor: t.inputHoverBorder,
          backgroundColor: t.nativeSelectHoverBg,
        } as ViewStyle,
        focused: {
          borderColor: t.accentEdge,
          backgroundColor: t.inputBg,
          boxShadow: ring(t.focusRing),
        } as ViewStyle,
        invalid: {
          borderColor: t.invalidBorder,
          boxShadow: ring(
            `0px 0px 0px ${t.invalidRingRest}px ${t.invalidRingColor}`,
          ),
        } as ViewStyle,
        disabled: {
          opacity: t.disabledOpacity,
          backgroundColor: t.inputDisabledBg,
        } as ViewStyle,
        chevron: {
          position: "absolute",
          right: t.nativeSelectIconInset,
          transform: [{ rotate: "90deg" }],
        } as ViewStyle,
        scrim: {
          flex: 1,
          justifyContent: "center",
          padding: t.space4,
          backgroundColor: t.scrim,
        } as ViewStyle,
        panel: {
          maxHeight: "70%",
          padding: t.menuPadding,
          borderRadius: t.menuRadius,
          backgroundColor: t.surfaceOverlay,
          boxShadow: [
            `0px 0px 0px ${t.borderWidthThin}px ${t.overlayRing}`,
            t.menuShadow,
          ]
            .filter(Boolean)
            .join(", "),
        } as ViewStyle,
        option: {
          flexDirection: "row",
          alignItems: "center",
          gap: t.menuItemGap,
          minHeight: t.menuItemH,
          paddingHorizontal: t.menuItemPx,
          paddingVertical: t.menuItemPy,
          borderRadius: t.menuItemRadius,
        } as ViewStyle,
        optionPressed: { backgroundColor: t.surfaceHover } as ViewStyle,
        optionDisabled: { opacity: t.disabledOpacity } as ViewStyle,
        fg: {
          color: t.textPrimary,
          fontSize: size === "sm" ? t.controlFontSizeSm : t.controlFontSize,
          fontFamily: fontFamily(th),
          lineHeight: Math.round(t.controlFontSize * t.leadingSm),
          iconSize: t.controlIcon,
        },
        placeholderInk: t.textTertiary,
        chevronInk: t.textSecondary,
        checkInk: t.textPrimary,
        weight: weight(t.fontWeightMedium),
      };
    },
    [size],
  );

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const pick = (o: SoneSelectOption) => {
    if (o.disabled) return;
    setValue(o.value);
    onSelectionChange?.(o.value);
    setOpen(false);
  };
  const picked = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        role="button"
        // The name says the field and its value: "Fruit: Apple".
        aria-label={
          ariaLabel
            ? [ariaLabel, picked?.label ?? placeholder]
                .filter(Boolean)
                .join(": ")
            : undefined
        }
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onPress={() => setOpen(true)}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        testID={testID}
        style={({ pressed }) => [
          s.trigger,
          pressed && !disabled && s.pressed,
          invalid && s.invalid,
          (focus.focused || open) && s.focused,
          (focus.focused || open) &&
            invalid && {
              boxShadow: [
                theme.tokens.inputShadow,
                `0px 0px 0px ${theme.tokens.focusRingWidth}px ${theme.tokens.invalidRingColor}`,
              ]
                .filter(Boolean)
                .join(", "),
            },
          disabled && s.disabled,
          style,
        ]}
      >
        <SoneForegroundProvider value={s.fg}>
          <SoneText
            numberOfLines={1}
            style={picked ? undefined : { color: s.placeholderInk }}
          >
            {picked?.label ?? placeholder}
          </SoneText>
          <View style={s.chevron} pointerEvents="none">
            <SoneIcon name="chevron-right" color={s.chevronInk} />
          </View>
        </SoneForegroundProvider>
      </Pressable>
      <Modal
        visible={open}
        transparent
        animationType={theme.reduceMotion ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.scrim}>
          {/* The scrim behind the panel closes the list, as a tap outside a picker does. */}
          <Pressable
            aria-label={messages.close}
            onPress={() => setOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            role="radiogroup"
            aria-label={ariaLabel ?? undefined}
            style={s.panel}
          >
            <ScrollView>
              <SoneForegroundProvider value={s.fg}>
                {options.map((o) => {
                  const on = o.value === value;
                  return (
                    <Pressable
                      key={o.value}
                      role="radio"
                      aria-checked={on}
                      aria-disabled={o.disabled || undefined}
                      disabled={o.disabled}
                      onPress={() => pick(o)}
                      style={({ pressed }) => [
                        s.option,
                        pressed && s.optionPressed,
                        o.disabled && s.optionDisabled,
                      ]}
                    >
                      <SoneText
                        style={[{ flex: 1 }, on && { fontWeight: s.weight }]}
                      >
                        {o.label}
                      </SoneText>
                      {on ? <SoneIcon name="check" color={s.checkInk} /> : null}
                    </Pressable>
                  );
                })}
              </SoneForegroundProvider>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
