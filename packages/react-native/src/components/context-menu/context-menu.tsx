import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import {
  SoneForegroundProvider,
  SoneText,
  textChildren,
  type SoneTextProps,
} from "../../theme/foreground";
import { weight } from "../../theme/style";
import { usePopover } from "../popover/context";
import {
  SonePopover,
  SonePopoverContent,
  type SonePopoverContentProps,
  type SonePopoverProps,
} from "../popover/popover";

export type SoneContextMenuProps = SonePopoverProps;

/**
 * `<SoneContextMenu>` — the React Native take on the web context menu: a long press on
 * its `SoneContextMenuTrigger` opens a menu anchored to it (a phone has no right click).
 * `open` / `defaultOpen` / `onOpenChange`, `side`, `align`, `offset`. A press outside,
 * the back button or Escape closes it; pressing an item runs it and closes it.
 */
export function SoneContextMenu(props: SoneContextMenuProps): ReactElement {
  return <SonePopover {...props} />;
}

type Handler = ((...args: never[]) => unknown) | undefined;

export interface SoneContextMenuTriggerProps {
  /** The one element a long press opens the menu on; its own `onPress` still runs. */
  readonly children: ReactElement;
  readonly style?: StyleProp<ViewStyle>;
}

/** `[soneContextMenuTrigger]` — wraps the element a long press opens the menu on. */
export function SoneContextMenuTrigger({
  children,
  style,
}: SoneContextMenuTriggerProps): ReactElement {
  const popover = usePopover("SoneContextMenuTrigger", "SoneContextMenu");
  if (!isValidElement<{ onLongPress?: Handler }>(children)) return children;
  const own = children.props.onLongPress as
    ((...args: unknown[]) => unknown) | undefined;
  const trigger = cloneElement(children, {
    onLongPress: (...args: unknown[]) => {
      own?.(...args);
      popover.setOpen(true);
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

/** The menu: the anchored popover layer as a `role="menu"` list of items. */
export function SoneContextMenuContent({
  style,
  children,
  ...rest
}: Omit<SonePopoverContentProps, "role">): ReactElement | null {
  const t = useSoneTheme().tokens;
  return (
    <SonePopoverContent
      role="menu"
      {...rest}
      style={[
        {
          width: undefined,
          minWidth: t.menuMinW,
          gap: 0,
          padding: t.menuPadding,
        },
        style,
      ]}
    >
      {children}
    </SonePopoverContent>
  );
}

export type ContextMenuItemVariant = "default" | "destructive";

export interface SoneContextMenuItemProps extends Omit<
  PressableProps,
  "children"
> {
  readonly variant?: ContextMenuItemVariant;
  readonly children?: ReactNode;
}

/** `[soneMenuItem]` — one action (`role="menuitem"`); pressing it runs it and closes the menu. */
export function SoneContextMenuItem({
  variant = "default",
  disabled,
  onPress,
  style,
  children,
  ...rest
}: SoneContextMenuItemProps): ReactElement {
  const popover = usePopover("SoneContextMenuItem", "SoneContextMenu");
  const t = useSoneTheme().tokens;
  const ink = variant === "destructive" ? t.dangerText : t.textPrimary;
  return (
    <Pressable
      role="menuitem"
      aria-disabled={disabled || undefined}
      disabled={disabled}
      {...rest}
      onPress={(e) => {
        onPress?.(e);
        popover.close();
      }}
      style={(state) => [
        {
          minHeight: t.menuItemH,
          flexDirection: "row",
          alignItems: "center",
          gap: t.menuItemGap,
          paddingVertical: t.menuItemPy,
          paddingHorizontal: t.menuItemPx,
          borderRadius: t.menuItemRadius,
        },
        state.pressed && {
          backgroundColor:
            variant === "destructive" ? t.dangerSoft : t.surfaceHover,
        },
        disabled && { opacity: t.disabledOpacity },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color: ink,
          fontSize: t.fontSizeSm,
          lineHeight: Math.round(t.fontSizeSm * t.menuItemLeading),
          iconSize: t.controlIcon,
        }}
      >
        {textChildren(children)}
      </SoneForegroundProvider>
    </Pressable>
  );
}

/** `[soneMenuLabel]` — a quiet heading over a group of items. */
export function SoneContextMenuLabel({
  style,
  ...rest
}: SoneTextProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <SoneText
      {...rest}
      style={[
        {
          paddingVertical: t.menuLabelPy,
          paddingHorizontal: t.menuItemPx,
          color: t.textTertiary,
          fontSize: t.fontSizeXs,
          fontWeight: weight(t.menuLabelWeight),
        },
        style,
      ]}
    />
  );
}

/** `[soneMenuSeparator]` — a hairline between groups. */
export function SoneContextMenuSeparator({
  style,
  ...rest
}: ViewProps): ReactElement {
  const t = useSoneTheme().tokens;
  return (
    <View
      role="separator"
      {...rest}
      style={[
        {
          height: t.borderWidthThin,
          marginVertical: t.space1,
          marginHorizontal: -t.menuPadding,
          backgroundColor: t.borderSubtle,
        },
        style,
      ]}
    />
  );
}
