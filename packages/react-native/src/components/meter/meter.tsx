import {
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles } from "../../theme/context";
import { SoneText } from "../../theme/foreground";

export interface SoneMeterProps extends Omit<ViewProps, "style"> {
  readonly label?: string;
  readonly value?: number;
  /** The number of pips (at most 10). */
  readonly max?: number;
  readonly detail?: string | null;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `<sone-meter>` — a relative rating in pips (at most 10). Not a progress bar: it is one
 * `img` that announces a sentence ("Accuracy: 3 of 4") instead of a percentage.
 */
export function SoneMeter({
  label = "",
  value = 0,
  max = 4,
  detail = null,
  style,
  ...rest
}: SoneMeterProps) {
  const messages = useSoneMessages();
  const n = Number.isFinite(max) ? Math.round(max) : 0;
  const pips = Math.min(Math.max(n, 0), 10);
  const filled = Number.isFinite(value)
    ? Math.min(Math.max(Math.round(value), 0), pips)
    : 0;
  const count = messages.meterCount(filled, pips);
  const trimmed = label.trim();
  const base = trimmed ? `${trimmed}: ${count}` : count;
  const ariaText = detail ? `${base}. ${detail}` : base;

  const s = useSoneStyles(({ tokens: t }) => ({
    root: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: t.space2,
      minWidth: 0,
    } satisfies ViewStyle,
    pips: { flexDirection: "row", gap: t.space1 } satisfies ViewStyle,
    pip: {
      width: 14, // the CSS pip width — a fixed size, no token
      height: t.meterPipH,
      borderRadius: t.radiusPill,
      backgroundColor: t.trackBg,
      boxShadow: `inset 0px 0px 0px ${t.borderWidthThin}px ${t.trackBorder}`,
    } satisfies ViewStyle,
    on: {
      backgroundColor: t.accentIndicator,
      boxShadow: "",
    } satisfies ViewStyle,
    detail: { color: t.textTertiary },
  }));

  return (
    <View
      role="img"
      accessible
      aria-label={ariaText}
      {...rest}
      style={[s.root, style]}
    >
      {label ? (
        <SoneText tone="primary" size="sm" weight="medium">
          {label}
        </SoneText>
      ) : null}
      <View style={s.pips} aria-hidden>
        {Array.from({ length: pips }, (_, i) => (
          <View key={i} style={[s.pip, i < filled && s.on]} />
        ))}
      </View>
      {detail ? (
        <SoneText size="sm" numeric style={s.detail}>
          {detail}
        </SoneText>
      ) : null}
    </View>
  );
}
