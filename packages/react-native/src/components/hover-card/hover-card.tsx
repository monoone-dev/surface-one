import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { createHoverIntent } from "@surface-one/core/hover-intent";
import { useSoneTheme } from "../../theme/context";
import { usePopover } from "../popover/context";
import {
  SonePopover,
  SonePopoverContent,
  type PopoverAlign,
  type PopoverSide,
  type SonePopoverContentProps,
} from "../popover/popover";

export interface SoneHoverCardProps {
  /** Shown or not (controlled), with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** ms from hovering the trigger (where there is a pointer) to opening. */
  readonly openDelay?: number;
  /** ms from leaving the trigger to closing (where there is a pointer). */
  readonly closeDelay?: number;
  /** The side of the trigger the card opens on; it flips when that side lacks room. */
  readonly side?: PopoverSide;
  /** Alignment along the trigger's edge (centred, as on the web). */
  readonly align?: PopoverAlign;
  /** Gap between the trigger and the card, in dp (default: the theme's `space1`). */
  readonly offset?: number;
  /** A `SoneHoverCardTrigger` and a `SoneHoverCardContent`. */
  readonly children?: ReactNode;
}

interface Delays {
  readonly openDelay: number;
  readonly closeDelay: number;
}

const DELAYS = createContext<Delays>({ openDelay: 700, closeDelay: 300 });

/**
 * `<SoneHoverCard>` — the React Native twin of the web hover card: a preview card
 * anchored to its trigger. A long press opens it (a phone has no hover); where there is
 * a pointer (the web, a tablet with a trackpad) hovering opens it after `openDelay`.
 * A press outside, the back button or Escape closes it.
 */
export function SoneHoverCard({
  openDelay = 700,
  closeDelay = 300,
  align = "center",
  children,
  ...rest
}: SoneHoverCardProps): ReactElement {
  return (
    <SonePopover align={align} {...rest}>
      <DELAYS.Provider value={{ openDelay, closeDelay }}>
        {children}
      </DELAYS.Provider>
    </SonePopover>
  );
}

type Handler = ((...args: never[]) => unknown) | undefined;

interface TriggerChildProps {
  onLongPress?: Handler;
  onHoverIn?: Handler;
  onHoverOut?: Handler;
  "aria-describedby"?: unknown;
}

export interface SoneHoverCardTriggerProps {
  /** The one element that previews the card — a link `SoneText`, a `Pressable`. */
  readonly children: ReactElement;
  readonly style?: StyleProp<ViewStyle>;
}

/**
 * `[soneHoverCardTrigger]` — wraps the element that previews its `SoneHoverCard`: a
 * long press opens the card (its own `onPress` still runs on a plain press), and a
 * hover opens it after the delay where there is a pointer.
 */
export function SoneHoverCardTrigger({
  children,
  style,
}: SoneHoverCardTriggerProps): ReactElement {
  const popover = usePopover("SoneHoverCardTrigger", "SoneHoverCard");
  const delayProps = useContext(DELAYS);
  const delays = useRef(delayProps);
  delays.current = delayProps;
  const live = useRef(popover);
  live.current = popover;
  const [intent] = useState(() =>
    createHoverIntent({
      isOpen: () => live.current.open,
      open: () => live.current.setOpen(true),
      close: () => live.current.setOpen(false),
      openDelay: () => delays.current.openDelay,
      closeDelay: () => delays.current.closeDelay,
    }),
  );
  useEffect(() => intent.cancel, [intent]);
  if (!isValidElement<TriggerChildProps>(children)) return children;
  const own = children.props;
  const call = (fn: Handler, ...args: unknown[]): void =>
    void (fn as ((...a: unknown[]) => unknown) | undefined)?.(...args);
  const trigger = cloneElement(children, {
    "aria-describedby": popover.open ? popover.contentId : undefined,
    onLongPress: (...args: unknown[]) => {
      call(own.onLongPress, ...args);
      intent.openNow();
    },
    onHoverIn: (...args: unknown[]) => {
      call(own.onHoverIn, ...args);
      intent.enter();
    },
    onHoverOut: (...args: unknown[]) => {
      call(own.onHoverOut, ...args);
      intent.leave();
    },
  });
  return (
    <View
      ref={popover.anchorRef}
      collapsable={false}
      style={[{ alignSelf: "flex-start" }, style]}
    >
      {trigger}
    </View>
  );
}

/**
 * `[soneHoverCard]` / `[soneHoverCardContent]` — the card: the popover layer at
 * `--hover-card-w`, with no dialog role (it describes its trigger).
 */
export function SoneHoverCardContent({
  style,
  ...rest
}: Omit<SonePopoverContentProps, "role">): ReactElement | null {
  const t = useSoneTheme().tokens;
  return (
    <SonePopoverContent
      role="none"
      {...rest}
      style={[{ width: t.hoverCardW }, style]}
    />
  );
}
