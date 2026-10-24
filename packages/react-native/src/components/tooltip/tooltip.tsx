import {
  cloneElement,
  isValidElement,
  type ComponentRef,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { shadow, weight } from "../../theme/style";

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

/** The same options as the React `SoneTooltip` / `useSoneTooltip`. */
export interface TooltipOptions {
  readonly text?: string;
  readonly side?: TooltipSide;
  readonly align?: TooltipAlign;
  readonly arrow?: boolean;
  readonly disabled?: boolean;
  /** Before it shows on focus or hover, in ms (a long press shows it at once). */
  readonly showDelay?: number;
}

export interface SoneTooltipProps extends TooltipOptions {
  /** One element — a `SoneButton`, a `Pressable` — that takes press, focus and hover handlers. */
  readonly children: ReactElement;
  /** How long the bubble stays after the finger lifts, in ms. */
  readonly hideDelay?: number;
  /** The bubble's style, merged last. */
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/** The web twins' delays (packages/core/src/tooltip.ts). */
const SHOW_DELAY_MS = 500;
const HIDE_DELAY_MS = 1500;

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Size {
  readonly width: number;
  readonly height: number;
}

export interface TooltipPlacement {
  readonly side: TooltipSide;
  /** The bubble's top-left corner, in the anchor's coordinates. */
  readonly left: number;
  readonly top: number;
  /** Where along the bubble's edge the arrow points (dp from its start). */
  readonly arrowAt: number;
}

/**
 * Places a bubble of `box` beside `anchor` (both in window coordinates) on `side`,
 * flipped when it does not fit the window, aligned by `align` and kept inside it —
 * the native take on the web tooltip's placement. Pure, so it is tested alone.
 */
export function placeTooltip(
  anchor: Rect,
  box: Size,
  window: Size,
  side: TooltipSide,
  align: TooltipAlign,
  offset: number,
  margin: number,
): TooltipPlacement {
  const fits = (s: TooltipSide): boolean => {
    switch (s) {
      case "top":
        return anchor.y - offset - box.height >= margin;
      case "bottom":
        return (
          anchor.y + anchor.height + offset + box.height <=
          window.height - margin
        );
      case "left":
        return anchor.x - offset - box.width >= margin;
      case "right":
        return (
          anchor.x + anchor.width + offset + box.width <= window.width - margin
        );
    }
  };
  const placed = fits(side) || !fits(OPPOSITE[side]) ? side : OPPOSITE[side];
  const vertical = placed === "top" || placed === "bottom";
  const along = (start: number, length: number, size: number): number =>
    align === "start"
      ? start
      : align === "end"
        ? start + length - size
        : start + (length - size) / 2;
  const clamp = (v: number, lo: number, hi: number): number =>
    Math.max(lo, Math.min(v, Math.max(lo, hi)));
  let x: number;
  let y: number;
  if (vertical) {
    x = clamp(
      along(anchor.x, anchor.width, box.width),
      margin,
      window.width - margin - box.width,
    );
    y =
      placed === "top"
        ? anchor.y - offset - box.height
        : anchor.y + anchor.height + offset;
  } else {
    y = clamp(
      along(anchor.y, anchor.height, box.height),
      margin,
      window.height - margin - box.height,
    );
    x =
      placed === "left"
        ? anchor.x - offset - box.width
        : anchor.x + anchor.width + offset;
  }
  const arrowAt = vertical
    ? anchor.x + anchor.width / 2 - x
    : anchor.y + anchor.height / 2 - y;
  return {
    side: placed,
    left: x - anchor.x,
    top: y - anchor.y,
    arrowAt,
  };
}

type Handler = ((...args: never[]) => unknown) | undefined;

interface TriggerProps {
  onLongPress?: Handler;
  onPressOut?: Handler;
  onFocus?: Handler;
  onBlur?: Handler;
  onHoverIn?: Handler;
  onHoverOut?: Handler;
  accessibilityHint?: string;
  delayLongPress?: number;
}

/**
 * `<SoneTooltip text="Copy"><SoneButton …/></SoneTooltip>` — the React Native twin of
 * `[soneTooltip]`: a short label shown on a long press (and on keyboard focus or hover
 * where there is one), placed on `side` and flipped when it does not fit. It hides
 * `hideDelay` ms after the finger lifts, and on blur. The bubble is hidden from
 * assistive technology; the text reaches it as the control's accessibility hint.
 */
export function SoneTooltip({
  children,
  text = "",
  side = "bottom",
  align = "center",
  arrow = true,
  disabled = false,
  showDelay = SHOW_DELAY_MS,
  hideDelay = HIDE_DELAY_MS,
  style,
  testID,
}: SoneTooltipProps): ReactElement {
  const theme = useSoneTheme();
  const t = theme.tokens;
  const window = useWindowDimensions();
  const anchorRef = useRef<ComponentRef<typeof View> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const [box, setBox] = useState<Size | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const active = open && !disabled && text !== "";

  const clearTimer = (): void => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  const show = (): void => {
    clearTimer();
    const node = anchorRef.current;
    if (node?.measureInWindow) {
      node.measureInWindow(
        (x: number, y: number, width: number, height: number) =>
          setAnchor({ x, y, width, height }),
      );
    }
    setOpen(true);
  };
  const hide = (): void => {
    clearTimer();
    setOpen(false);
    setBox(null);
  };
  const later = (fn: () => void, ms: number): void => {
    clearTimer();
    timer.current = setTimeout(fn, ms);
  };

  const measured = active && box !== null;
  useEffect(() => {
    if (!measured) {
      opacity.setValue(0);
      return;
    }
    if (theme.reduceMotion) {
      opacity.setValue(1);
      return;
    }
    const run = Animated.timing(opacity, {
      toValue: 1,
      duration: t.durationPop,
      useNativeDriver: Platform.OS !== "web",
    });
    run.start();
    return () => run.stop();
  }, [measured, theme.reduceMotion, t.durationPop, opacity]);

  if (!isValidElement<TriggerProps>(children)) return children;
  const own = children.props;
  const call = (fn: Handler, ...args: unknown[]): void => {
    (fn as ((...a: unknown[]) => unknown) | undefined)?.(...args);
  };
  const trigger = cloneElement(children, {
    accessibilityHint:
      own.accessibilityHint ?? (disabled || !text ? undefined : text),
    onLongPress: (...args: unknown[]) => {
      call(own.onLongPress, ...args);
      if (!disabled) show();
    },
    onPressOut: (...args: unknown[]) => {
      call(own.onPressOut, ...args);
      if (open) later(hide, hideDelay);
    },
    onFocus: (...args: unknown[]) => {
      call(own.onFocus, ...args);
      if (!disabled) later(show, showDelay);
    },
    onBlur: (...args: unknown[]) => {
      call(own.onBlur, ...args);
      hide();
    },
    onHoverIn: (...args: unknown[]) => {
      call(own.onHoverIn, ...args);
      if (!disabled) later(show, showDelay);
    },
    onHoverOut: (...args: unknown[]) => {
      call(own.onHoverOut, ...args);
      hide();
    },
  });

  // `.sone-tooltip`: padding calc(space-1 * 1.5) space-3, line-height space-1 * 4.
  const offset = t.space2;
  const margin = t.space2;
  const frame: Rect = anchor ?? { x: 0, y: 0, width: 0, height: 0 };
  const placement =
    box && anchor
      ? placeTooltip(frame, box, window, side, align, offset, margin)
      : null;
  const arrowSize = t.space1 * 2.5;
  const arrowEdge = t.tooltipArrowInset - arrowSize / 2 - t.tooltipBorderWidth;
  const placed = placement?.side ?? side;

  return (
    <View ref={anchorRef} collapsable={false} style={styles.anchor}>
      {trigger}
      {active ? (
        <Animated.View
          testID={testID}
          aria-hidden
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          onLayout={(e: LayoutChangeEvent) => {
            const { width, height } = e.nativeEvent.layout;
            if (!box || box.width !== width || box.height !== height)
              setBox({ width, height });
          }}
          style={[
            styles.bubble,
            {
              zIndex: t.zTooltip,
              maxWidth: t.tooltipMaxW,
              paddingVertical: t.space1 * 1.5,
              paddingHorizontal: t.space3,
              borderWidth: t.tooltipBorderWidth,
              borderColor: t.tooltipBorder,
              borderRadius: t.tooltipRadius,
              backgroundColor: t.tooltipBg,
              opacity,
              left: placement?.left ?? 0,
              top: placement?.top ?? 0,
              ...shadow(t.tooltipShadow),
            },
            style,
          ]}
        >
          {arrow && placement ? (
            <View
              style={[
                styles.arrow,
                {
                  width: arrowSize,
                  height: arrowSize,
                  backgroundColor: t.tooltipBg,
                  borderColor: t.tooltipBorder,
                  borderWidth: t.tooltipBorderWidth,
                },
                placed === "top" || placed === "bottom"
                  ? {
                      left: placement.arrowAt - arrowSize / 2,
                      [placed === "bottom" ? "top" : "bottom"]: arrowEdge,
                    }
                  : {
                      top: placement.arrowAt - arrowSize / 2,
                      [placed === "right" ? "left" : "right"]: arrowEdge,
                    },
              ]}
            />
          ) : null}
          <Text
            style={{
              color: t.tooltipFg,
              fontSize: t.fontSizeXs,
              lineHeight: t.space1 * 4,
              fontWeight: weight(t.tooltipFontWeight),
              textAlign: t.tooltipTextAlign === "center" ? "center" : "left",
            }}
          >
            {text}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: { position: "relative", alignSelf: "flex-start" },
  bubble: { position: "absolute" },
  arrow: { position: "absolute", transform: [{ rotate: "45deg" }] },
});
