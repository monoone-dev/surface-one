import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  Animated,
  Platform,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import {
  SONE_OTP_DIGITS,
  cleanOtp,
  otpCharTest,
  otpInputMode,
  otpLayout,
  otpSize,
} from "@surface-one/core/otp";

import { useSoneTheme } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { SoneIcon } from "../icon/icon";
import { useSoneFieldControl } from "../input/field";
import { inputFrameLook } from "../input/input";

export { SONE_OTP_ALPHANUMERIC, SONE_OTP_DIGITS } from "@surface-one/core/otp";

export interface SoneInputOtpProps extends Omit<
  TextInputProps,
  "value" | "defaultValue" | "style" | "editable" | "maxLength" | "onChangeText"
> {
  /** The code (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Every edit that fills all the slots, with the code. */
  readonly onComplete?: (code: string) => void;
  readonly length?: number;
  /** What one character may be (default: digits). */
  readonly pattern?: string | RegExp;
  /** Slot counts per group (`[3, 3]`), drawn with a separator between them. */
  readonly groups?: readonly number[] | null;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly style?: StyleProp<ViewStyle>;
}

/** The blinking caret of the empty active slot (steady under reduced motion). */
function Caret() {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (theme.reduceMotion) return;
    const half = t.durationBlink / 2;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 0,
          delay: half,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 0,
          delay: half,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, theme.reduceMotion, t.durationBlink]);
  return (
    <Animated.View
      style={{
        width: t.borderWidthThin,
        height: t.controlFontSize,
        backgroundColor: t.textPrimary,
        opacity,
      }}
    />
  );
}

/**
 * `<sone-input-otp>` — a one-time code: `value` / `defaultValue` / `onValueChange`,
 * `onComplete`. One real `TextInput` (SMS / keychain autofill, paste, screen readers)
 * lies transparent over the slots, as in @surface-one/angular.
 */
export function SoneInputOtp({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  length = 6,
  pattern = SONE_OTP_DIGITS,
  groups = null,
  disabled: disabledProp,
  invalid: invalidProp,
  style,
  onFocus,
  onBlur,
  "aria-label": ariaLabel,
  accessibilityHint,
  ...control
}: SoneInputOtpProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const { invalid, disabled, label, hint } = useSoneFieldControl({
    invalid: invalidProp,
    disabled: disabledProp,
    label: ariaLabel,
    hint: accessibilityHint,
  });
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [focused, setFocused] = useState(false);

  const size = otpSize(length);
  const source = typeof pattern === "string" ? pattern : pattern.source;
  const flags = typeof pattern === "string" ? "" : pattern.flags;
  const charTest = useMemo(
    () => otpCharTest(new RegExp(source, flags)),
    [source, flags],
  );
  const layout = otpLayout(groups, size);
  const chars = Array.from(cleanOtp(value, charTest, size));
  const active = Math.min(chars.length, size - 1);
  const numeric = otpInputMode(charTest) === "numeric";

  const frame = inputFrameLook(theme, "default", {
    focused: false,
    invalid,
    disabled: false,
  });
  const radius = t.controlRadius;
  const inner = Math.max(0, radius - t.borderWidthThin);
  const activeRing = invalid
    ? `0px 0px 0px ${t.focusRingWidth}px ${t.invalidRingColor}`
    : t.focusRing;

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          maxWidth: "100%",
          ...(disabled ? { opacity: t.disabledOpacity } : {}),
        },
        style,
      ]}
    >
      <View
        aria-hidden
        style={{ flexDirection: "row", alignItems: "center", gap: t.space2 }}
      >
        {layout.map((group, gi) => (
          <Fragment key={gi}>
            <View
              style={[
                frame,
                {
                  flexDirection: "row",
                  alignItems: "center",
                  height: undefined,
                  backgroundColor: disabled ? t.inputDisabledBg : t.inputBg,
                  ...(disabled ? { borderColor: t.inputBorder } : {}),
                },
              ]}
            >
              {group.map((slot, si) => {
                const isActive = focused && slot === active;
                return (
                  <View
                    key={slot}
                    testID={
                      control.testID
                        ? `${control.testID}-slot-${slot}`
                        : undefined
                    }
                    style={[
                      {
                        width: t.controlHMd,
                        height: t.controlHMd - 2 * t.borderWidthThin,
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      si > 0 && {
                        borderLeftWidth: t.borderWidthThin,
                        borderColor: t.border,
                      },
                      si === 0 && {
                        borderTopLeftRadius: inner,
                        borderBottomLeftRadius: inner,
                      },
                      si === group.length - 1 && {
                        borderTopRightRadius: inner,
                        borderBottomRightRadius: inner,
                      },
                      isActive && { zIndex: t.zRaised, ...shadow(activeRing) },
                    ]}
                  >
                    {chars[slot] ? (
                      <SoneText
                        numeric
                        style={{
                          color: t.textPrimary,
                          fontSize: t.controlFontSize,
                          lineHeight: t.controlFontSize,
                        }}
                      >
                        {chars[slot]}
                      </SoneText>
                    ) : isActive ? (
                      <Caret />
                    ) : null}
                  </View>
                );
              })}
            </View>
            {gi < layout.length - 1 ? (
              <SoneIcon
                name="minus"
                color={t.textTertiary}
                size={t.controlIcon}
              />
            ) : null}
          </Fragment>
        ))}
      </View>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        {...control}
        value={chars.join("")}
        maxLength={size}
        editable={!disabled}
        keyboardType={numeric ? "number-pad" : "default"}
        inputMode={numeric ? "numeric" : "text"}
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        caretHidden
        selectionColor="transparent"
        aria-label={label}
        accessibilityHint={hint}
        aria-disabled={disabled || undefined}
        onChangeText={(raw) => {
          const v = cleanOtp(raw, charTest, size);
          setValue(v);
          if (v.length === size) onComplete?.(v);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: t.zRaised + 1,
          margin: 0,
          padding: 0,
          borderWidth: 0,
          borderRadius: radius,
          backgroundColor: "transparent",
          color: "transparent",
          // The field's own text collapses to nothing; the slots draw the characters.
          fontSize: 1,
        }}
      />
    </View>
  );
}
