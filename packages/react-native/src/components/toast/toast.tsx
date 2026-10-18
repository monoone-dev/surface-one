import { useEffect, useRef } from "react";
import {
  AccessibilityInfo,
  Animated,
  Platform,
  View,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneStyles, useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, SoneText } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { alertLook, type AlertVariant } from "../alert/alert";
import { SoneBannerGlyph, type BannerKind } from "../banner/banner";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import {
  toast as store,
  useSoneToasts,
  type SoneToastItem,
  type ToastVariant,
} from "./toast-store";

const KIND: Record<ToastVariant, BannerKind | null> = {
  default: null,
  info: "info",
  success: "success",
  warning: "warning",
  destructive: "danger",
};

export type ToastPosition = "top" | "bottom";

export interface SoneToasterProps {
  /** The edge toasts appear at. */
  readonly position?: ToastPosition;
  /** The safe-area insets (`useSafeAreaInsets()` of react-native-safe-area-context). */
  readonly insets?: { readonly top?: number; readonly bottom?: number };
  /** How many show at once; the rest wait their turn. */
  readonly limit?: number;
  /** The default `duration`, in ms. */
  readonly duration?: number;
  readonly testID?: string;
}

interface ToastViewProps {
  readonly item: SoneToastItem;
  readonly position: ToastPosition;
  readonly duration: number;
}

function ToastView({ item, position, duration }: ToastViewProps) {
  const theme = useSoneTheme();
  const messages = useSoneMessages();
  const kind = KIND[item.variant];
  const urgent = item.variant === "destructive" || item.variant === "warning";
  const progress = useRef(
    new Animated.Value(theme.reduceMotion ? 1 : 0),
  ).current;
  const closing = useRef(false);
  const run = (to: 0 | 1, done?: () => void): void => {
    if (theme.reduceMotion) {
      progress.setValue(to);
      done?.();
      return;
    }
    Animated.timing(progress, {
      toValue: to,
      duration: theme.tokens.durationPop,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => finished && done?.());
  };
  const close = (): void => {
    if (closing.current) return;
    closing.current = true;
    run(0, () => store.dismiss(item.id));
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  const wait = item.duration ?? duration;
  useEffect(() => {
    run(1);
    // iOS has no live regions: say it.
    if (Platform.OS === "ios")
      AccessibilityInfo.announceForAccessibility(
        [item.title, item.description].filter(Boolean).join(". "),
      );
    if (!wait) return;
    const timer = setTimeout(() => closeRef.current(), wait);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, wait]);

  const s = useSoneStyles(
    (th) => {
      const t = th.tokens;
      const look = kind
        ? alertLook(
            th,
            (kind === "danger" ? "destructive" : kind) as AlertVariant,
          )
        : null;
      return {
        box: {
          flexDirection: "row",
          alignItems: "center",
          gap: t.alertGap,
          paddingVertical: t.alertPy,
          paddingHorizontal: t.alertPx,
          borderWidth: t.borderWidthThin,
          borderColor: look?.border ?? t.borderStrong,
          borderRadius: t.alertRadius,
          backgroundColor: t.surfaceOverlay,
          ...shadow(t.shadowLg),
        } as ViewStyle,
        iconInk: look?.icon ?? t.textPrimary,
        fg: {
          color: t.textPrimary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
          iconSize: t.controlIcon,
        },
        gap: t.space2,
      };
    },
    [kind],
  );

  const slide = position === "top" ? -theme.tokens.space6 : theme.tokens.space6;
  return (
    <Animated.View
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      pointerEvents="auto"
      testID={`sone-toast-${item.id}`}
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [slide, 0],
            }),
          },
        ],
      }}
    >
      <View style={s.box}>
        {kind ? <SoneBannerGlyph kind={kind} color={s.iconInk} /> : null}
        <SoneForegroundProvider value={s.fg}>
          <View style={{ flex: 1, minWidth: 0, gap: s.gap / 2 }}>
            {item.title ? (
              <SoneText weight="medium">{item.title}</SoneText>
            ) : null}
            {item.description ? (
              <SoneText tone={item.title ? "secondary" : "primary"}>
                {item.description}
              </SoneText>
            ) : null}
          </View>
        </SoneForegroundProvider>
        {item.action ? (
          <SoneButton
            variant="ghost"
            size="xs"
            onPress={() => {
              item.action?.onPress();
              close();
            }}
          >
            {item.action.label}
          </SoneButton>
        ) : null}
        <SoneButton
          variant="ghost"
          size="icon-xs"
          aria-label={messages.dismiss}
          onPress={close}
        >
          <SoneIcon name="close" />
        </SoneButton>
      </View>
    </Animated.View>
  );
}

/**
 * `<sone-toaster>` — mount it once near the root (inside `SurfaceOneProvider`, after the
 * screens) and call `toast("Saved")` / `toast.success(…)` from anywhere. Toasts queue
 * (`limit` at a time), dismiss themselves after `duration` and by their close button, are
 * announced to screen readers (errors and warnings assertively) and stand still under
 * reduced motion. Pass the safe-area `insets`.
 */
export function SoneToaster({
  position = "top",
  insets,
  limit = 3,
  duration = 4000,
  testID,
}: SoneToasterProps) {
  const t = useSoneTheme().tokens;
  const shown = useSoneToasts().slice(0, limit);
  if (!shown.length) return null;
  const edge =
    position === "top"
      ? { top: (insets?.top ?? 0) + t.space3 }
      : { bottom: (insets?.bottom ?? 0) + t.space3 };
  return (
    <View
      pointerEvents="box-none"
      testID={testID}
      style={[
        {
          position: "absolute",
          left: t.space4,
          right: t.space4,
          gap: t.space2,
          zIndex: 1000,
          elevation: 1000,
        },
        edge,
      ]}
    >
      {shown.map((item) => (
        <ToastView
          key={item.id}
          item={item}
          position={position}
          duration={duration}
        />
      ))}
    </View>
  );
}
