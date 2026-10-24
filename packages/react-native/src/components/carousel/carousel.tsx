import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { carouselStep } from "@surface-one/core/carousel";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneButton,
  type ButtonSize,
  type ButtonVariant,
} from "../button/button";
import { SoneIcon } from "../icon/icon";

interface CarouselContext {
  readonly index: number;
  readonly count: number;
  readonly loop: boolean;
  readonly width: number;
  readonly contentHeight: number;
  goTo(index: number): void;
  setCount(count: number): void;
  setWidth(width: number): void;
  setContentHeight(height: number): void;
  readonly scroller: RefObject<ComponentRef<typeof ScrollView> | null>;
}

const CAROUSEL = createContext<CarouselContext | null>(null);
const ITEM = createContext<number>(-1);

function useCarousel(part: string): CarouselContext {
  const context = useContext(CAROUSEL);
  if (!context) throw new Error(`${part} needs a SoneCarousel`);
  return context;
}

export interface SoneCarouselProps {
  /** The current slide (controlled), with `onIndexChange`; or `defaultIndex`. */
  readonly index?: number;
  readonly defaultIndex?: number;
  readonly onIndexChange?: (index: number) => void;
  /** Wrap from the last slide to the first and back. */
  readonly loop?: boolean;
  /** The carousel's accessible name. */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
  readonly children?: ReactNode;
}

/**
 * `<SoneCarousel>` — the React Native twin of `sone-carousel`: a horizontal, paging
 * `ScrollView` of `SoneCarouselItem`s (in `SoneCarouselContent`), stepped by a swipe,
 * `SoneCarouselPrevious` / `SoneCarouselNext` and `SoneCarouselDots`. `index` /
 * `defaultIndex` / `onIndexChange` is the current slide, `loop` wraps at the ends; each
 * slide is named "N of M". There is no auto-rotation on mobile.
 */
export function SoneCarousel({
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  loop = false,
  ariaLabel = null,
  style,
  testID,
  children,
}: SoneCarouselProps): ReactElement {
  const [index, setIndex] = useControllable(
    indexProp,
    defaultIndex,
    onIndexChange,
  );
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const scroller = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const { tokens: t } = useSoneTheme();
  const context = useMemo<CarouselContext>(
    () => ({
      index,
      count,
      loop,
      width,
      contentHeight,
      goTo: (i) => setIndex(Math.max(0, Math.min(i, count - 1))),
      setCount,
      setWidth,
      setContentHeight,
      scroller,
    }),
    [index, count, loop, width, contentHeight, setIndex],
  );
  return (
    <CAROUSEL.Provider value={context}>
      <View
        testID={testID}
        role="region"
        aria-label={ariaLabel ?? undefined}
        style={[{ position: "relative", gap: t.space3 }, style]}
      >
        {children}
      </View>
    </CAROUSEL.Provider>
  );
}

export interface SoneCarouselContentProps {
  readonly style?: StyleProp<ViewStyle>;
  readonly children?: ReactNode;
}

/** `[soneCarouselContent]` — the paging `ScrollView` of the slides. */
export function SoneCarouselContent({
  style,
  children,
}: SoneCarouselContentProps): ReactElement {
  const c = useCarousel("SoneCarouselContent");
  const { tokens: t, reduceMotion } = useSoneTheme();
  const slides = Children.toArray(children).filter(isValidElement);
  const step = c.width + t.carouselGap;
  const { setCount } = c;
  useEffect(() => setCount(slides.length), [slides.length, setCount]);
  const shown = useRef(c.index);
  useEffect(() => {
    if (c.width <= 0) return;
    c.scroller.current?.scrollTo({
      x: c.index * step,
      animated: shown.current !== c.index && !reduceMotion,
    });
    shown.current = c.index;
  }, [c.index, c.width, step, reduceMotion, c.scroller]);
  return (
    <ScrollView
      ref={c.scroller}
      horizontal
      snapToInterval={step > 0 ? step : undefined}
      decelerationRate="fast"
      disableIntervalMomentum
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: t.carouselGap }}
      style={[{ borderRadius: t.radiusLg }, style]}
      onLayout={(e: LayoutChangeEvent) => {
        c.setWidth(e.nativeEvent.layout.width);
        c.setContentHeight(e.nativeEvent.layout.height);
      }}
      onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (step <= 0) return;
        const at = Math.round(e.nativeEvent.contentOffset.x / step);
        shown.current = at;
        c.goTo(at);
      }}
    >
      {slides.map((slide, i) => (
        <ITEM.Provider key={slide.key ?? i} value={i}>
          {slide}
        </ITEM.Provider>
      ))}
    </ScrollView>
  );
}

export interface SoneCarouselItemProps {
  /** The slide's name (default: its position, "2 of 5"). */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
  readonly children?: ReactNode;
}

/** `[soneCarouselItem]` — one slide, a page of the carousel's width, named "N of M". */
export function SoneCarouselItem({
  ariaLabel = null,
  style,
  children,
}: SoneCarouselItemProps): ReactElement {
  const c = useCarousel("SoneCarouselItem");
  const at = useContext(ITEM);
  const m = useSoneMessages();
  return (
    <View
      role="group"
      aria-label={
        ariaLabel ??
        (at >= 0 ? m.carouselSlidePosition(at + 1, c.count) : undefined)
      }
      aria-hidden={at >= 0 && at !== c.index ? true : undefined}
      style={[{ width: c.width > 0 ? c.width : "100%" }, style]}
    >
      {children}
    </View>
  );
}

export interface SoneCarouselStepProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** The button's name (default: the "Previous slide" / "Next slide" message). */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
}

function step(name: string, dir: -1 | 1) {
  function Step({
    variant = "outline",
    size = "icon-sm",
    ariaLabel = null,
    style,
  }: SoneCarouselStepProps): ReactElement {
    const c = useCarousel(name);
    const { tokens: t } = useSoneTheme();
    const m = useSoneMessages();
    const last = c.count - 1;
    const can = c.loop || (dir < 0 ? c.index > 0 : c.index < last);
    const half = t.controlHSm / 2;
    return (
      <SoneButton
        variant={variant}
        size={size}
        aria-label={
          ariaLabel ?? (dir < 0 ? m.carouselPrevious : m.carouselNext)
        }
        disabled={!can}
        onPress={() => c.goTo(carouselStep(c.index, last, dir, c.loop))}
        style={[
          {
            position: "absolute",
            zIndex: 1,
            borderRadius: t.radiusPill,
            top: c.contentHeight > 0 ? c.contentHeight / 2 - half : "40%",
            [dir < 0 ? "left" : "right"]: t.space2,
          },
          style,
        ]}
      >
        <SoneIcon name={dir < 0 ? "chevron-left" : "chevron-right"} />
      </SoneButton>
    );
  }
  Step.displayName = name;
  return Step;
}

/** `button[soneCarouselPrevious]` — steps back one slide; disabled on the first unless `loop`. */
export const SoneCarouselPrevious = step("SoneCarouselPrevious", -1);

/** `button[soneCarouselNext]` — steps on one slide; disabled on the last unless `loop`. */
export const SoneCarouselNext = step("SoneCarouselNext", 1);

export interface SoneCarouselDotsProps {
  /** The group's name (default: the "Choose slide" message). */
  readonly ariaLabel?: string | null;
  readonly style?: StyleProp<ViewStyle>;
}

/** `<sone-carousel-dots>` — one button per slide; the current one is selected. */
export function SoneCarouselDots({
  ariaLabel = null,
  style,
}: SoneCarouselDotsProps): ReactElement {
  const c = useCarousel("SoneCarouselDots");
  const { tokens: t } = useSoneTheme();
  const m = useSoneMessages();
  return (
    <View
      role="group"
      aria-label={ariaLabel ?? m.carouselDots}
      style={[
        { flexDirection: "row", justifyContent: "center", gap: t.space1 },
        style,
      ]}
    >
      {Array.from({ length: c.count }, (_, i) => {
        const current = i === c.index;
        return (
          <Pressable
            key={i}
            role="button"
            aria-label={m.carouselGoTo(i + 1)}
            aria-selected={current}
            onPress={() => c.goTo(i)}
            style={{
              width: t.carouselDotHit,
              height: t.carouselDotHit,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: current ? t.carouselDotActiveW : t.carouselDotSize,
                height: t.carouselDotSize,
                borderRadius: t.radiusPill,
                backgroundColor: current
                  ? t.carouselDotActiveBg
                  : t.carouselDotBg,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
