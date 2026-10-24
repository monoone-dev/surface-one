import {
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { useControllable } from "@surface-one/core/react/controllable";
import { joinShadows } from "../input/input";
import { placeTooltip } from "../tooltip/tooltip";
import {
  POPOVER,
  usePopover,
  type PopoverAlign,
  type PopoverContext,
  type PopoverSide,
  type Rect,
} from "./context";

export type { PopoverAlign, PopoverSide } from "./context";

export interface SonePopoverProps {
  /** Shown or not (controlled), with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** The side of the trigger the panel opens on; it flips when that side lacks room. */
  readonly side?: PopoverSide;
  /** Alignment along the trigger's edge. */
  readonly align?: PopoverAlign;
  /** Gap between the trigger and the panel, in dp (default: the theme's `space1`). */
  readonly offset?: number;
  /** A `SonePopoverTrigger` and a `SonePopoverContent`. */
  readonly children?: ReactNode;
}

/**
 * `<SonePopover>` — the popover root, the React Native twin of the web one: `open` /
 * `defaultOpen` / `onOpenChange` and the placement (`side`, `align`, `offset`) for its
 * `SonePopoverTrigger` and `SonePopoverContent`.
 */
export function SonePopover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset,
  children,
}: SonePopoverProps): ReactElement {
  const [open, setOpenState] = useControllable(
    openProp,
    defaultOpen,
    onOpenChange,
  );
  const [anchor, setAnchor] = useState<Rect | null>(null);
  const anchorRef = useRef<ComponentRef<typeof View> | null>(null);
  const contentId = `sone-popover-${useId()}`;

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        // Measure the trigger in window coordinates: the panel is placed against it.
        anchorRef.current?.measureInWindow?.(
          (x: number, y: number, width: number, height: number) =>
            setAnchor({ x, y, width, height }),
        );
      }
      setOpenState(next);
    },
    [setOpenState],
  );

  const context = useMemo<PopoverContext>(
    () => ({
      open,
      anchor,
      side,
      align,
      offset,
      contentId,
      anchorRef,
      setOpen,
      close: () => setOpen(false),
    }),
    [open, anchor, side, align, offset, contentId, setOpen],
  );
  return <POPOVER.Provider value={context}>{children}</POPOVER.Provider>;
}

type Handler = ((...args: never[]) => unknown) | undefined;

interface TriggerChildProps {
  onPress?: Handler;
  "aria-haspopup"?: unknown;
  "aria-expanded"?: unknown;
  "aria-controls"?: unknown;
}

export interface SonePopoverTriggerProps {
  /** One pressable element — a `SoneButton`, a `Pressable` — that opens the popover. */
  readonly children: ReactElement;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `[sonePopoverTrigger]` — wraps the one element that opens its `SonePopover`: a press
 * toggles it, and the element says `aria-haspopup="dialog"` and `aria-expanded`.
 */
export function SonePopoverTrigger({
  children,
  style,
}: SonePopoverTriggerProps): ReactElement {
  const popover = usePopover("SonePopoverTrigger");
  if (!isValidElement<TriggerChildProps>(children)) return children;
  const own = children.props;
  const trigger = cloneElement(children, {
    "aria-haspopup": "dialog",
    "aria-expanded": popover.open,
    "aria-controls": popover.open ? popover.contentId : undefined,
    onPress: (...args: unknown[]) => {
      (own.onPress as ((...a: unknown[]) => unknown) | undefined)?.(...args);
      popover.setOpen(!popover.open);
    },
  });
  return (
    <View
      ref={popover.anchorRef}
      collapsable={false}
      style={[styles.anchor, style]}
    >
      {trigger}
    </View>
  );
}

export interface SonePopoverContentProps extends Omit<ViewProps, "children"> {
  /** The panel's content, or a function of `close`. */
  readonly children?: ReactNode | ((close: () => void) => ReactNode);
}

/**
 * `[sonePopoverContent]` — the panel: while open, a `Modal` layer with the popover
 * surface placed next to the trigger (flipped when that side lacks room, kept inside
 * the window). A press outside it, the Android back button or Escape closes it.
 * `role="dialog"`; name it with `aria-label` (or `aria-labelledby` on the web).
 */
export function SonePopoverContent({
  children,
  style,
  onLayout,
  ...rest
}: SonePopoverContentProps): ReactElement | null {
  const popover = usePopover("SonePopoverContent");
  const theme = useSoneTheme();
  const t = theme.tokens;
  const messages = useSoneMessages();
  const window = useWindowDimensions();
  const [box, setBox] = useState<{ width: number; height: number } | null>(
    null,
  );
  if (!popover.open) return null;

  const margin = t.space3;
  const placement =
    box && popover.anchor
      ? placeTooltip(
          popover.anchor,
          box,
          window,
          popover.side,
          popover.align,
          popover.offset ?? t.space1,
          margin,
        )
      : null;
  const content =
    typeof children === "function" ? children(popover.close) : children;

  return (
    <Modal
      visible
      transparent
      animationType={theme.reduceMotion ? "none" : "fade"}
      onRequestClose={popover.close}
    >
      {/* A press outside the panel closes it, as a click outside does on the web. */}
      <Pressable
        role="button"
        aria-label={messages.close}
        onPress={popover.close}
        style={StyleSheet.absoluteFill}
      />
      <View
        role="dialog"
        nativeID={popover.contentId}
        {...rest}
        onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          if (!box || box.width !== width || box.height !== height)
            setBox({ width, height });
          onLayout?.(e);
        }}
        style={[
          styles.panel,
          {
            // Hidden until measured and placed, so it never flashes at 0,0.
            opacity: placement ? 1 : 0,
            left: popover.anchor
              ? popover.anchor.x + (placement?.left ?? 0)
              : 0,
            top: popover.anchor ? popover.anchor.y + (placement?.top ?? 0) : 0,
            width: t.popoverW,
            maxWidth: window.width - 2 * margin,
            gap: t.popoverGap,
            padding: t.popoverPadding,
            borderRadius: t.menuRadius,
            backgroundColor: t.surfaceOverlay,
            ...shadow(
              joinShadows(
                `0px 0px 0px ${t.borderWidthThin}px ${t.overlayRing}`,
                t.menuShadow,
              ),
            ),
          },
          style,
        ]}
      >
        <SoneForegroundProvider
          value={{ color: t.textPrimary, fontSize: t.fontSizeSm }}
        >
          {textChildren(content)}
        </SoneForegroundProvider>
      </View>
    </Modal>
  );
}

/** `[sonePopoverHeader]` — the title and description at the top of a popover. */
export function SonePopoverHeader({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View {...rest} style={[{ gap: t.popoverHeaderGap }, style]}>
      {textChildren(children)}
    </View>
  );
}

/** `[sonePopoverTitle]` — the popover's title. */
export function SonePopoverTitle({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      role="heading"
      {...rest}
      style={[
        {
          fontSize: t.popoverTitleSize,
          fontWeight: weight(t.fontWeightMedium),
        },
        style,
      ]}
    />
  );
}

/** `[sonePopoverDescription]` — a secondary line under the title. */
export function SonePopoverDescription({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          color: t.textSecondary,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.leadingSm),
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  anchor: { alignSelf: "flex-start" },
  panel: { position: "absolute" },
});
