import type { ReactNode, ReactElement } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useSoneStyles } from "../../theme/context";
import { SoneText } from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export interface SoneAppBarProps {
  readonly title: string;
  /** A line under the title. */
  readonly subtitle?: string;
  /** Shows a back button; it calls this. */
  readonly onBack?: () => void;
  /** The back button's name (default: "Back"). */
  readonly backLabel?: string;
  /** What sits at the end: an avatar, an icon button … */
  readonly trailing?: ReactNode;
  /** The safe-area top inset (`useSafeAreaInsets().top`). */
  readonly topInset?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-app-bar>` — the top bar of a screen: an optional back button, the title (a
 * `heading`) with a subtitle, and a trailing slot, below the status bar (`topInset`).
 * `SonePageHeader` is the title block inside the content; this is the bar above it.
 */
export function SoneAppBar({
  title,
  subtitle,
  onBack,
  backLabel = "Back",
  trailing,
  topInset = 0,
  style,
  testID,
}: SoneAppBarProps): ReactElement {
  const s = useSoneStyles(
    (th) => {
      const t = th.tokens;
      return {
        bar: {
          flexDirection: "row",
          alignItems: "center",
          gap: t.space3,
          minHeight: t.controlHLg + topInset + t.space4,
          paddingTop: topInset + t.space2,
          paddingBottom: t.space2,
          paddingHorizontal: t.space4,
          borderBottomWidth: t.borderWidthThin,
          borderBottomColor: t.border,
          backgroundColor: t.surfaceRaised,
          ...shadow(t.shadowSm),
        } as ViewStyle,
        title: {
          fontSize: t.fontSizeLg,
          fontWeight: weight(t.fontWeightSemibold),
          lineHeight: Math.round(t.fontSizeLg * t.leadingSm),
        },
      };
    },
    [topInset],
  );
  return (
    <View testID={testID} style={[s.bar, style]}>
      {onBack ? (
        <SoneButton
          variant="ghost"
          size="icon"
          aria-label={backLabel}
          onPress={onBack}
        >
          <SoneIcon name="arrow-left" />
        </SoneButton>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <SoneText
          role="heading"
          aria-level={1}
          numberOfLines={1}
          style={s.title}
        >
          {title}
        </SoneText>
        {subtitle ? (
          <SoneText tone="secondary" size="sm" numberOfLines={1}>
            {subtitle}
          </SoneText>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}
