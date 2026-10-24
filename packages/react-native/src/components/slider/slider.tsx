import { useMemo, useRef, useState, type ReactElement } from "react";
import {
  PanResponder,
  View,
  type AccessibilityActionEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useSoneStyles } from "../../theme/context";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";

/** The height of the native range input in range.css; the track and thumb centre in it. */
const RANGE_HEIGHT = 22;

/** A raw value → on the `step` grid from `min`, inside [min, max]. */
export function snapSliderValue(
  raw: number,
  min: number,
  max: number,
  step: number,
): number {
  if (!(max > min)) return min;
  const clamped = Math.min(Math.max(raw, min), max);
  if (!(step > 0)) return clamped;
  const snapped = min + Math.round((clamped - min) / step) * step;
  // Float steps (0.1) would leave 0.30000000000000004.
  const decimals = (String(step).split(".")[1] ?? "").length;
  return Math.min(Number(snapped.toFixed(decimals)), max);
}

export interface SoneSliderProps {
  /** The number (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: number;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number) => void;
  /** The drag ended (or a screen-reader step) — commit here, preview in `onValueChange`. */
  readonly onSlidingComplete?: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly disabled?: boolean;
  readonly ariaLabel?: string | null;
  /** The spoken value instead of the number ("40 %"). */
  readonly ariaValueText?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

/**
 * `<sone-slider>` — a horizontal range: drag the thumb or tap the track. Screen readers
 * get an adjustable `slider` with `aria-valuemin/max/now` and increment / decrement
 * actions (one `step`). `value` / `defaultValue` / `onValueChange`.
 */
export function SoneSlider({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  ariaLabel,
  ariaValueText,
  style,
  testID,
}: SoneSliderProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [width, setWidth] = useState(0);
  const [dragging, setDragging] = useState(false);
  const focus = useFocusRing();
  const s = useSoneStyles(({ tokens: t }) => {
    const ring = `0px 0px 0px ${t.borderWidthThin}px ${t.sliderThumbBorder}`;
    const join = (...parts: string[]) => parts.filter(Boolean).join(", ");
    return {
      thumbSize: t.sliderThumb,
      host: { height: RANGE_HEIGHT, justifyContent: "center" } as ViewStyle,
      track: {
        height: t.sliderTrackH,
        borderRadius: t.radiusPill,
        backgroundColor: t.trackBg,
        overflow: "hidden",
      } as ViewStyle,
      fill: { height: "100%", backgroundColor: t.accentIndicator } as ViewStyle,
      // The inset ring of the track, drawn over the fill as in CSS.
      trackRing: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        borderRadius: t.radiusPill,
        borderWidth: t.borderWidthThin,
        borderColor: t.trackBorder,
      } as ViewStyle,
      thumb: {
        position: "absolute",
        top: (RANGE_HEIGHT - t.sliderThumb) / 2,
        width: t.sliderThumb,
        height: t.sliderThumb,
        borderRadius: t.radiusPill,
        backgroundColor: t.sliderThumbBg,
        boxShadow: join(ring, t.sliderThumbShadow),
      } as ViewStyle,
      thumbActive: {
        boxShadow: join(
          ring,
          `0px 0px 0px ${t.sliderThumbRing}px ${t.sliderThumbHalo}`,
          t.sliderThumbShadow,
        ),
      } as ViewStyle,
      thumbFocused: {
        boxShadow: join(ring, t.focusRing, t.sliderThumbShadow),
      } as ViewStyle,
      disabled: { opacity: t.disabledOpacity } as ViewStyle,
    };
  });

  // The responder outlives renders: it reads the latest props through this ref.
  const live = useRef({
    min,
    max,
    step,
    width,
    disabled,
    thumb: s.thumbSize,
    value,
    setValue,
  });
  live.current = {
    min,
    max,
    step,
    width,
    disabled,
    thumb: s.thumbSize,
    value,
    setValue,
  };
  const origin = useRef(0);
  const complete = useRef(onSlidingComplete);
  complete.current = onSlidingComplete;

  const pan = useMemo(() => {
    const at = (x: number): number => {
      const l = live.current;
      const usable = Math.max(l.width - l.thumb, 1);
      const frac = (x - l.thumb / 2) / usable;
      const next = snapSliderValue(
        l.min + frac * (l.max - l.min),
        l.min,
        l.max,
        l.step,
      );
      l.setValue(next);
      return next;
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !live.current.disabled,
      onMoveShouldSetPanResponder: () => !live.current.disabled,
      // A horizontal drag inside a ScrollView stays with the slider.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        // The children ignore touches, so locationX is relative to the host.
        origin.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
        setDragging(true);
        at(e.nativeEvent.locationX);
      },
      onPanResponderMove: (_, g) => {
        at(g.moveX - origin.current);
      },
      onPanResponderRelease: (_, g) => {
        setDragging(false);
        // A tap never moved: its x is where it started.
        complete.current?.(at((g.moveX || g.x0) - origin.current));
      },
      onPanResponderTerminate: () => setDragging(false),
    });
  }, []);

  const span = max - min;
  const frac =
    span > 0 && Number.isFinite(value)
      ? Math.min(Math.max((value - min) / span, 0), 1)
      : 0;
  const nudge = (dir: 1 | -1) => {
    const next = snapSliderValue(value + dir * step, min, max, step);
    setValue(next);
    onSlidingComplete?.(next);
  };

  return (
    <View
      role="slider"
      accessible
      focusable={!disabled}
      aria-label={ariaLabel ?? undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText}
      aria-disabled={disabled || undefined}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={(e: AccessibilityActionEvent) => {
        if (disabled) return;
        if (e.nativeEvent.actionName === "increment") nudge(1);
        if (e.nativeEvent.actionName === "decrement") nudge(-1);
      }}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      hitSlop={{ top: RANGE_HEIGHT / 2, bottom: RANGE_HEIGHT / 2 }}
      testID={testID}
      {...pan.panHandlers}
      style={[s.host, disabled && s.disabled, style]}
    >
      <View style={s.track} pointerEvents="none">
        <View style={[s.fill, { width: `${frac * 100}%` }]} />
        <View style={s.trackRing} />
      </View>
      <View
        pointerEvents="none"
        style={[
          s.thumb,
          { left: frac * Math.max(width - s.thumbSize, 0) },
          dragging && !disabled && s.thumbActive,
          focus.focused && s.thumbFocused,
        ]}
      />
    </View>
  );
}
