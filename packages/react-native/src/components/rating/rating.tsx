import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";

export type RatingSize = "sm" | "default" | "lg";

/** The star outline, 24 × 24 — the same path as @surface-one/angular. */
const STAR =
  "M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z";

/** One star: the empty outline, and the filled one clipped to `fill` (0–1) of its width. */
function Glyph({
  fill,
  size,
}: {
  readonly fill: number;
  readonly size: number;
}) {
  const t = useSoneTheme().tokens;
  const star = (color: string, filled: boolean) => (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d={STAR}
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
  return (
    <View aria-hidden style={{ width: size, height: size }}>
      {star(t.borderStrong, false)}
      {fill > 0 ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size * fill,
            height: size,
            overflow: "hidden",
          }}
        >
          {star(t.warning, true)}
        </View>
      ) : null}
    </View>
  );
}

function Star({
  value,
  fill,
  size,
  checked,
  disabled,
  onSelect,
}: {
  readonly value: number;
  readonly fill: number;
  readonly size: number;
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly onSelect: (n: number) => void;
}) {
  const messages = useSoneMessages();
  const theme = useSoneTheme();
  const t = theme.tokens;
  const focus = useFocusRing();
  return (
    <Pressable
      role="radio"
      aria-checked={checked}
      aria-label={messages.ratingStar(value)}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onPress={() => onSelect(value)}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={({ pressed }) => [
        { borderRadius: t.radiusXs },
        pressed && !theme.reduceMotion && { transform: [{ scale: 1.12 }] },
        focus.focused && { boxShadow: t.focusRing },
      ]}
    >
      <Glyph fill={fill} size={size} />
    </Pressable>
  );
}

export interface SoneRatingProps {
  /** The score (controlled; 0 = no rating), with `onValueChange`; or `defaultValue`. */
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number) => void;
  readonly max?: number;
  readonly size?: RatingSize;
  readonly readonly?: boolean;
  readonly disabled?: boolean;
  /** Choosing the current score again clears it (to 0). */
  readonly clearable?: boolean;
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-rating>` — stars for a score. `readonly`: one image named "4.5 out of 5";
 * otherwise a radio group of stars: `value` / `defaultValue` / `onValueChange`.
 */
export function SoneRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  max = 5,
  size = "default",
  readonly = false,
  disabled = false,
  clearable = false,
  ariaLabel,
  style,
  testID,
}: SoneRatingProps) {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const s = useSoneStyles(
    ({ tokens: t }) => ({
      px:
        size === "sm"
          ? t.iconSizeSm
          : size === "lg"
            ? t.iconSizeBase
            : t.iconSize,
      row: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: t.space0_5,
      } as ViewStyle,
      disabled: { opacity: t.disabledOpacity } as ViewStyle,
    }),
    [size],
  );
  const count = Math.max(1, Math.round(max));
  const stars = Array.from({ length: count }, (_, i) => ({
    value: i + 1,
    fill: Math.min(Math.max(value - i, 0), 1),
  }));

  if (readonly) {
    const text = messages.ratingSummary(Math.round(value * 10) / 10, max);
    return (
      <View
        role="img"
        aria-label={ariaLabel ? `${ariaLabel}: ${text}` : text}
        testID={testID}
        style={[s.row, disabled && s.disabled, style]}
      >
        {stars.map((star) => (
          <Glyph key={star.value} fill={star.fill} size={s.px} />
        ))}
      </View>
    );
  }
  return (
    <View
      role="radiogroup"
      aria-label={ariaLabel ?? messages.ratingLabel}
      aria-disabled={disabled || undefined}
      testID={testID}
      style={[s.row, disabled && s.disabled, style]}
    >
      {stars.map((star) => (
        <Star
          key={star.value}
          value={star.value}
          fill={star.fill}
          size={s.px}
          checked={value === star.value}
          disabled={disabled}
          onSelect={(n) => setValue(clearable && n === value ? 0 : n)}
        />
      ))}
    </View>
  );
}
