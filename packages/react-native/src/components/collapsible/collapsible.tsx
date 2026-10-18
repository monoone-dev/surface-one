import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, textChildren } from "../../theme/foreground";
import { shadow } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";

interface CollapsibleContext {
  readonly expanded: boolean;
  readonly disabled: boolean;
  toggle(): void;
}

const COLLAPSIBLE = createContext<CollapsibleContext | null>(null);
/** The trigger is held down: its icon takes the label's ink. */
const PRESSED = createContext(false);

export interface SoneCollapsibleProps extends ViewProps {
  /** Shown or not, controlled with `onExpandedChange`. */
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly disabled?: boolean;
}

/** `[soneCollapsible]` — `expanded` / `defaultExpanded` / `onExpandedChange`. */
export function SoneCollapsible({
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  ...rest
}: SoneCollapsibleProps) {
  const [expanded, setExpanded] = useControllable(
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  const context = useMemo<CollapsibleContext>(
    () => ({
      expanded,
      disabled,
      toggle: () => {
        if (!disabled) setExpanded(!expanded);
      },
    }),
    [expanded, disabled, setExpanded],
  );
  return (
    <COLLAPSIBLE.Provider value={context}>
      <View {...rest} />
    </COLLAPSIBLE.Provider>
  );
}

export interface SoneCollapsibleTriggerProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/** `button[soneCollapsibleTrigger]` — toggles its collapsible; `aria-expanded`. */
export function SoneCollapsibleTrigger({
  onPress,
  onFocus,
  onBlur,
  disabled: disabledProp,
  style,
  children,
  ...rest
}: SoneCollapsibleTriggerProps) {
  const { tokens: t } = useSoneTheme();
  const root = useContext(COLLAPSIBLE);
  const focus = useFocusRing(onFocus, onBlur);
  const disabled = disabledProp === true || root?.disabled === true;
  return (
    <Pressable
      role="button"
      {...rest}
      aria-expanded={root?.expanded}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      onPress={(e) => {
        onPress?.(e);
        root?.toggle();
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.space2,
          width: "100%",
          paddingVertical: t.space2,
          borderRadius: t.radiusLg,
        },
        focus.focused && shadow(t.focusRing),
        disabled && { opacity: t.disabledOpacity },
        style,
      ]}
    >
      {({ pressed }) => (
        <PRESSED.Provider value={pressed && !disabled}>
          <SoneForegroundProvider value={{ color: t.textPrimary }}>
            {textChildren(children)}
          </SoneForegroundProvider>
        </PRESSED.Provider>
      )}
    </Pressable>
  );
}

/** `[soneCollapsibleContent]` — not drawn (nor read) while collapsed. */
export function SoneCollapsibleContent({ style, ...rest }: ViewProps) {
  const root = useContext(COLLAPSIBLE);
  if (!root) throw new Error("SoneCollapsibleContent needs a SoneCollapsible");
  return (
    <View {...rest} style={[style, !root.expanded && { display: "none" }]} />
  );
}

/** `[soneCollapsibleIcon]` — the chevron (or your icon) that turns a quarter when expanded. */
export function SoneCollapsibleIcon({ style, children, ...rest }: ViewProps) {
  const { tokens: t } = useSoneTheme();
  const root = useContext(COLLAPSIBLE);
  const pressed = useContext(PRESSED);
  return (
    <View
      aria-hidden
      {...rest}
      style={[
        {
          flexShrink: 0,
          width: t.controlIcon,
          height: t.controlIcon,
          alignItems: "center",
          justifyContent: "center",
        },
        root?.expanded && { transform: [{ rotate: "90deg" }] },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color: pressed ? t.textPrimary : t.textMuted,
          iconSize: t.controlIcon,
        }}
      >
        {children ?? <SoneIcon name="chevron-right" />}
      </SoneForegroundProvider>
    </View>
  );
}
