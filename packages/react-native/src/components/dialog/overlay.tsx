import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme, type SoneTheme } from "../../theme/context";
import { SoneForegroundProvider } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { drawerRelease, drawerSnapOffset } from "@surface-one/core/drawer";
import { useControllable } from "@surface-one/core/react/controllable";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type OverlayKind = "dialog" | "alertdialog" | "sheet";
export type SheetSide = "top" | "right" | "bottom" | "left";

/** What the parts of an open overlay read (the twin of `SONE_OVERLAY`). */
export interface SoneOverlayHost {
  readonly kind: OverlayKind;
  readonly size: string;
  /** The corner close button is drawn: the first header keeps clear of it. */
  readonly cornerClose: boolean;
  /** Dismiss it, when it may be dismissed. */
  requestClose(): void;
  /** A title names the panel; `undefined` unregisters it. */
  setTitleId(id: string | undefined): void;
  /** A header holds its own `SoneDialogClose`: the corner close steps aside. */
  setHeaderClose(on: boolean): void;
}

export const SoneOverlayContext = createContext<SoneOverlayHost | null>(null);

/** The overlay the part sits in (`null` outside one). */
export function useSoneOverlay(): SoneOverlayHost | null {
  return useContext(SoneOverlayContext);
}

/** The props every overlay shares. */
export interface SoneOverlayProps {
  /**
   * Shown or not, controlled with `onOpenChange` — or leave it out and render the
   * overlay conditionally (it is open while rendered: `defaultOpen` is `true`),
   * listening to `onDismiss`.
   */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** The scrim, the close button or the Android back button (Escape on the web) dismissed it. */
  readonly onDismiss?: () => void;
  /** The scrim, the back button and the close button may dismiss it. */
  readonly dismissible?: boolean;
  /** The corner close button. */
  readonly showClose?: boolean;
  /** The close button's name (default: the "Close" message). */
  readonly closeLabel?: string | null;
  /** Names the panel when it has no `SoneDialogTitle`. */
  readonly ariaLabel?: string | null;
  /** The panel's style, merged last. */
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly children?: ReactNode;
}

/** A sheet that is also a drawer: a drag handle that swipes it away or between snap points. */
export interface OverlayDrawer {
  /** Show the drag handle (and so the swipe). */
  readonly handle: boolean;
  /** Visible fractions it rests at, ascending; empty: open or dismissed. */
  readonly snapPoints: readonly number[];
  /** The snap point it rests at (`null`: the first, or fully open). */
  readonly activeSnapPoint: number | null;
  setActiveSnapPoint(snap: number | null): void;
}

interface OverlaySettings {
  readonly kind: OverlayKind;
  readonly size: string;
  readonly closeOnScrim: boolean;
  readonly cornerClose: boolean;
  readonly side?: SheetSide;
  readonly drawer?: OverlayDrawer;
}

// `--sheet-w-default: min(75vw, 24rem)` / `--sheet-w-lg: min(90vw, 32rem)` have no
// native token (a `min()` of a viewport length): the same two bounds, in dp.
const SHEET_W = {
  default: { width: "75%", maxWidth: 384 },
  lg: { width: "90%", maxWidth: 512 },
} as const;

/** The panel of a dialog / alert dialog / sheet — `.dialog-content` / `.sheet-content`. */
function panelLook(theme: SoneTheme, s: OverlaySettings): ViewStyle {
  const t = theme.tokens;
  const base: ViewStyle = { backgroundColor: t.surfaceOverlay };
  if (s.kind !== "sheet") {
    const maxWidth =
      s.kind === "alertdialog"
        ? s.size === "xs"
          ? t.dialogWXs
          : t.alertDialogW
        : ({
            xs: t.dialogWXs,
            sm: t.dialogWDefault,
            md: t.dialogWMd,
            lg: t.dialogWLg,
            xl: t.dialogWXl,
            "2xl": t.dialogW2xl,
          }[s.size] ?? t.dialogWDefault);
    const ring = `0px 0px 0px ${t.borderWidthThin}px ${t.overlayRing}`;
    return {
      ...base,
      width: "100%",
      maxWidth,
      maxHeight: "100%",
      borderRadius: t.dialogRadius,
      boxShadow: t.dialogShadow ? `${ring}, ${t.dialogShadow}` : ring,
    };
  }
  const side = s.side ?? "bottom";
  const edge = t.borderWidthThin;
  const out: ViewStyle = {
    ...base,
    position: "absolute",
    borderColor: t.sheetBorder,
    ...shadow(t.shadowLg),
  };
  if (side === "left" || side === "right") {
    Object.assign(out, SHEET_W[s.size === "lg" ? "lg" : "default"], {
      top: 0,
      bottom: 0,
      [side]: 0,
      [side === "right" ? "borderLeftWidth" : "borderRightWidth"]: edge,
    });
  } else {
    Object.assign(out, {
      left: 0,
      right: 0,
      maxHeight: "85%",
      [side]: 0,
      [side === "bottom" ? "borderTopWidth" : "borderBottomWidth"]: edge,
      ...(side === "bottom"
        ? {
            borderTopLeftRadius: t.sheetRadius,
            borderTopRightRadius: t.sheetRadius,
          }
        : {
            borderBottomLeftRadius: t.sheetRadius,
            borderBottomRightRadius: t.sheetRadius,
          }),
    });
  }
  return out;
}

/** The sheet's slide in from its side (`sone-sheet-in-*`); none under reduced motion. */
function useSlideIn(
  side: SheetSide | undefined,
  open: boolean,
  still: boolean,
  extra: Animated.Value | null = null,
) {
  const { tokens: t } = useSoneTheme();
  const window = useWindowDimensions();
  const progress = useRef(new Animated.Value(still ? 0 : 1)).current;
  useEffect(() => {
    if (!side || !open || still) {
      progress.setValue(open || still ? 0 : 1);
      return;
    }
    progress.setValue(1);
    const run = Animated.timing(progress, {
      toValue: 0,
      duration: t.sheetDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    });
    run.start();
    return () => run.stop();
  }, [side, open, still, progress, t.sheetDuration]);
  if (!side) return null;
  const horizontal = side === "left" || side === "right";
  const distance = horizontal ? window.width : window.height;
  const slide = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      side === "right" || side === "bottom" ? distance : -distance,
    ],
  });
  // A drawer's drag (px toward its edge) on top of the slide.
  const offset = extra
    ? Animated.add(
        slide,
        side === "right" || side === "bottom"
          ? extra
          : Animated.multiply(extra, -1),
      )
    : slide;
  return {
    transform: [horizontal ? { translateX: offset } : { translateY: offset }],
  };
}

/**
 * One modal overlay — a React Native `Modal` over the skin's scrim with the panel on
 * top. SoneDialog, SoneAlertDialog and SoneSheet are this with their own settings.
 */
export function SoneOverlay({
  settings,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onDismiss,
  dismissible = true,
  showClose = true,
  closeLabel = null,
  ariaLabel = null,
  style,
  testID,
  children,
}: SoneOverlayProps & { readonly settings: OverlaySettings }): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const messages = useSoneMessages();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [titleId, setTitleId] = useState<string | undefined>();
  const [headerClose, setHeaderClose] = useState(false);
  const cornerClose =
    settings.cornerClose && showClose && dismissible && !headerClose;
  const drawer = settings.drawer;
  const dragValue = useRef(new Animated.Value(0)).current;
  const slide = useSlideIn(
    settings.side,
    open,
    theme.reduceMotion,
    drawer ? dragValue : null,
  );
  const swipe = useDrawerSwipe(
    drawer,
    settings.side === "top" ? -1 : 1,
    dragValue,
    theme.reduceMotion ? 0 : t.sheetDuration,
    () => host.requestClose(),
    dismissible,
  );
  const handle = drawer?.handle ? (
    <View
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.handleRow, { paddingVertical: t.space3 }]}
      {...swipe.handlers}
    >
      <View
        style={{
          width: t.drawerHandleW,
          height: t.drawerHandleH,
          borderRadius: t.radiusPill,
          backgroundColor: t.drawerHandleBg,
        }}
      />
    </View>
  ) : null;

  const dismissRef = useRef<() => void>(() => undefined);
  dismissRef.current = () => {
    if (!dismissible) return;
    onDismiss?.();
    setOpen(false);
  };
  const host = useMemo<SoneOverlayHost>(
    () => ({
      kind: settings.kind,
      size: settings.size,
      cornerClose,
      requestClose: () => dismissRef.current(),
      setTitleId,
      setHeaderClose,
    }),
    [settings.kind, settings.size, cornerClose],
  );

  const sheet = settings.kind === "sheet";
  const panel = panelLook(theme, settings);
  const pad = sheet ? 0 : t.dialogPadding;
  const inset = sheet ? t.sheetCloseInset : t.dialogCloseInset;
  const content = sheet ? sheetChildren(children, t.sheetPadding) : children;

  return (
    <Modal
      visible={open}
      transparent
      statusBarTranslucent
      animationType={theme.reduceMotion ? "none" : "fade"}
      onRequestClose={() => host.requestClose()}
    >
      <View
        style={[
          styles.layer,
          !sheet && {
            alignItems: "center",
            justifyContent: "center",
            padding: t.space4,
          },
        ]}
      >
        <Pressable
          aria-hidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]}
          onPress={
            settings.closeOnScrim ? () => host.requestClose() : undefined
          }
        />
        <Animated.View
          testID={testID}
          role={settings.kind === "alertdialog" ? "alertdialog" : "dialog"}
          aria-modal
          aria-label={ariaLabel ?? undefined}
          aria-labelledby={ariaLabel ? undefined : titleId}
          style={[
            panel,
            // `--drawer-max-h` (80vh) has no native value: the same share of the window.
            drawer?.snapPoints.length ? styles.snapHeight : null,
            slide,
            style,
          ]}
          onLayout={drawer ? swipe.onLayout : undefined}
        >
          <SoneForegroundProvider
            value={{ color: t.textPrimary, fontSize: t.fontSizeSm }}
          >
            {settings.side !== "top" ? handle : null}
            <SoneOverlayContext.Provider value={host}>
              <ScrollView
                style={
                  settings.side === "left" || settings.side === "right"
                    ? styles.fill
                    : styles.hug
                }
                contentContainerStyle={{
                  flexGrow: 1,
                  padding: pad,
                  gap: sheet ? t.sheetGap : t.dialogGap,
                }}
                keyboardShouldPersistTaps="handled"
              >
                {content}
              </ScrollView>
            </SoneOverlayContext.Provider>
            {settings.side === "top" ? handle : null}
            {cornerClose ? (
              <SoneButton
                variant="ghost"
                size="icon-sm"
                aria-label={closeLabel ?? messages.close}
                onPress={() => host.requestClose()}
                style={[styles.corner, { top: inset, right: inset }]}
              >
                <SoneIcon name="close" />
              </SoneButton>
            ) : null}
          </SoneForegroundProvider>
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Inside a sheet every child but a header or footer gets the side padding (`--sheet-pad`). */
function sheetChildren(children: ReactNode, pad: number): ReactNode {
  return Children.map(children, (child) => {
    const part = isValidElement(child)
      ? (child.type as { soneSheetPart?: boolean }).soneSheetPart
      : false;
    return part || child === null || child === false ? (
      child
    ) : (
      <View style={{ paddingHorizontal: pad }}>{child}</View>
    );
  });
}

/**
 * A drawer's swipe: the handle row drags the panel (`drag`, px toward its edge); a
 * release dismisses it or settles it on a snap point (the web drawer's rules, from core).
 */
function useDrawerSwipe(
  drawer: OverlayDrawer | undefined,
  /** 1 when a drag down closes it (bottom), -1 when a drag up does (top). */
  sign: 1 | -1,
  drag: Animated.Value,
  /** The settle animation's length (ms); 0 under reduced motion. */
  duration: number,
  dismiss: () => void,
  dismissible: boolean,
) {
  const window = useWindowDimensions();
  /** The panel's height once laid out (the window's until then). */
  const measured = useRef(0);
  const size = {
    get current() {
      return measured.current || window.height;
    },
  };
  const live = useRef({ drawer, sign, duration, dismiss, dismissible });
  live.current = { drawer, sign, duration, dismiss, dismissible };
  const rest = (): number => {
    const d = live.current.drawer;
    if (!d) return 0;
    return drawerSnapOffset(
      d.activeSnapPoint ?? d.snapPoints[0] ?? null,
      size.current,
    );
  };
  const settle = (to: number): void => {
    if (live.current.duration <= 0) {
      drag.setValue(to);
      return;
    }
    Animated.timing(drag, {
      toValue: to,
      duration: live.current.duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };
  const active = drawer?.activeSnapPoint ?? drawer?.snapPoints[0] ?? null;
  useEffect(() => {
    if (measured.current > 0) settle(rest());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settle / rest read live refs
  }, [active]);
  const handlers = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
        onPanResponderGrant: () => drag.stopAnimation(),
        onPanResponderMove: (_e, g) => {
          const next = rest() + g.dy * live.current.sign;
          drag.setValue(next < 0 ? next / 4 : next);
        },
        onPanResponderRelease: (_e, g) => {
          const d = live.current.drawer;
          if (!d) return;
          const sign = live.current.sign;
          const release = drawerRelease({
            offset: Math.max(0, rest() + g.dy * sign),
            size: size.current,
            velocity: g.vy * sign,
            snapPoints: d.snapPoints,
          });
          if (release.dismiss && live.current.dismissible) {
            live.current.dismiss();
            drag.setValue(rest());
            return;
          }
          const snap = release.dismiss
            ? (d.snapPoints[0] ?? null)
            : release.snap;
          if (snap !== (d.activeSnapPoint ?? d.snapPoints[0] ?? null))
            d.setActiveSnapPoint(snap);
          settle(drawerSnapOffset(snap, size.current));
        },
        onPanResponderTerminate: () => settle(rest()),
      }).panHandlers,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reads live refs
    [drag],
  );
  return {
    handlers,
    onLayout: (e: { nativeEvent: { layout: { height: number } } }) => {
      const first = measured.current === 0;
      measured.current = e.nativeEvent.layout.height;
      if (first) drag.setValue(rest());
    },
  };
}

const styles = StyleSheet.create({
  layer: { flex: 1 },
  handleRow: { alignItems: "center", alignSelf: "stretch" },
  snapHeight: { height: "80%", maxHeight: "80%" },
  fill: { flex: 1 },
  hug: { flexGrow: 0, flexShrink: 1 },
  corner: { position: "absolute", zIndex: 1 },
});
