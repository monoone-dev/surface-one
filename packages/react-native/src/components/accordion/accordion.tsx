import {
  Children,
  createContext,
  useContext,
  useId,
  useMemo,
  type ReactNode,
  type ReactElement,
} from "react";
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import {
  isAccordionItemOpen,
  toggleAccordionValue,
  type AccordionType,
  type AccordionValue,
} from "@surface-one/core/accordion";

import { useSoneTheme } from "../../theme/context";
import { SoneForegroundProvider, textChildren } from "../../theme/foreground";
import { shadow, weight } from "../../theme/style";
import { useControllable } from "../../utils/controllable";
import { useFocusRing } from "../../utils/focus";
import { SoneIcon } from "../icon/icon";

export type { AccordionType, AccordionValue };

interface AccordionContext {
  readonly disabled: boolean;
  isOpen(item: string): boolean;
  toggle(item: string): void;
}

interface AccordionItemContext {
  readonly open: boolean;
  readonly disabled: boolean;
  readonly triggerId: string;
  toggle(): void;
}

const ACCORDION = createContext<AccordionContext | null>(null);
const ITEM = createContext<AccordionItemContext | null>(null);
/** The item is the accordion's last child: it draws no divider below. */
const LAST = createContext(false);
/** The trigger is held down: its icon takes the label's ink. */
const PRESSED = createContext(false);

function useItem(part: string): AccordionItemContext {
  const item = useContext(ITEM);
  if (!item) throw new Error(`${part} needs a SoneAccordionItem`);
  return item;
}

export interface SoneAccordionProps extends ViewProps {
  /** The open item values, controlled with `onValueChange`. */
  readonly value?: AccordionValue;
  readonly defaultValue?: AccordionValue;
  readonly onValueChange?: (value: AccordionValue) => void;
  /** `single`: one item open at a time; `multiple`: any number. */
  readonly type?: AccordionType;
  /** A `single` accordion lets its open item close again. */
  readonly collapsible?: boolean;
  readonly disabled?: boolean;
}

/**
 * `[soneAccordion]` — headed sections that show and hide their content.
 * `type`, `collapsible`, `value` / `defaultValue` / `onValueChange`.
 */
export function SoneAccordion({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  type = "single",
  collapsible = false,
  disabled = false,
  children,
  ...rest
}: SoneAccordionProps): ReactElement {
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const context = useMemo<AccordionContext>(
    () => ({
      disabled,
      isOpen: (item) => isAccordionItemOpen(value, item),
      toggle: (item) =>
        setValue(toggleAccordionValue(value, item, type, collapsible)),
    }),
    [disabled, value, setValue, type, collapsible],
  );
  const items = Children.toArray(children);
  return (
    <ACCORDION.Provider value={context}>
      <View {...rest}>
        {items.map((child, i) => (
          <LAST.Provider key={i} value={i === items.length - 1}>
            {child}
          </LAST.Provider>
        ))}
      </View>
    </ACCORDION.Provider>
  );
}

export interface SoneAccordionItemProps extends ViewProps {
  /** Names the item in the accordion's value; unique by default. */
  readonly value?: string;
  readonly disabled?: boolean;
}

/** `[soneAccordionItem]` — one section: a trigger and its content, a hairline below. */
export function SoneAccordionItem({
  value: valueProp,
  disabled: disabledProp = false,
  style,
  ...rest
}: SoneAccordionItemProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const root = useContext(ACCORDION);
  if (!root) throw new Error("SoneAccordionItem needs a SoneAccordion");
  const last = useContext(LAST);
  const uid = `sone-accordion-item-${useId()}`;
  const value = valueProp ?? uid;
  const open = root.isOpen(value);
  const disabled = disabledProp || root.disabled;
  const { toggle } = root;
  const context = useMemo<AccordionItemContext>(
    () => ({
      open,
      disabled,
      triggerId: `${uid}-trigger`,
      toggle: () => {
        if (!disabled) toggle(value);
      },
    }),
    [open, disabled, uid, toggle, value],
  );
  return (
    <ITEM.Provider value={context}>
      <View
        {...rest}
        style={[
          !last && {
            borderBottomWidth: t.borderWidthThin,
            borderBottomColor: t.border,
          },
          style,
        ]}
      />
    </ITEM.Provider>
  );
}

export interface SoneAccordionTriggerProps extends Omit<
  PressableProps,
  "style" | "children"
> {
  /** The heading level of the trigger (`aria-level`). */
  readonly level?: number;
  /** Replaces the chevron: a `SoneAccordionIcon`. */
  readonly icon?: ReactNode;
  /** The label (a string becomes its text). */
  readonly children?: ReactNode;
  readonly style?: StyleProp<ViewStyle>;
}

/** `<sone-accordion-trigger>` — the item's heading with the button that opens and closes it. */
export function SoneAccordionTrigger({
  level = 3,
  icon,
  onPress,
  onFocus,
  onBlur,
  style,
  children,
  ...rest
}: SoneAccordionTriggerProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const item = useItem("SoneAccordionTrigger");
  const focus = useFocusRing(onFocus, onBlur);
  return (
    <View role="heading" aria-level={level} style={{ flexDirection: "row" }}>
      <Pressable
        role="button"
        nativeID={item.triggerId}
        {...rest}
        aria-expanded={item.open}
        disabled={item.disabled}
        aria-disabled={item.disabled || undefined}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        onPress={(e) => {
          onPress?.(e);
          item.toggle();
        }}
        style={[
          {
            flex: 1,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: t.space4,
            paddingVertical: t.space4,
            borderRadius: t.radiusMd,
          },
          focus.focused && shadow(t.focusRing),
          item.disabled && { opacity: t.disabledOpacity },
          style,
        ]}
      >
        {({ pressed }) => (
          <PRESSED.Provider value={pressed && !item.disabled}>
            <SoneForegroundProvider
              value={{
                color: t.textPrimary,
                fontSize: t.fontSizeSm,
                fontWeight: weight(t.fontWeightMedium),
              }}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                {textChildren(children)}
              </View>
              {icon ?? <SoneAccordionIcon />}
            </SoneForegroundProvider>
          </PRESSED.Provider>
        )}
      </Pressable>
    </View>
  );
}

/** `[soneAccordionContent]` — the region the trigger shows; not drawn (nor read) while closed. */
export function SoneAccordionContent({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const item = useItem("SoneAccordionContent");
  return (
    <View
      role="region"
      aria-labelledby={item.triggerId}
      {...rest}
      style={[
        { paddingBottom: t.space4 },
        style,
        !item.open && { display: "none" },
      ]}
    >
      <SoneForegroundProvider value={{ fontSize: t.fontSizeSm }}>
        {textChildren(children)}
      </SoneForegroundProvider>
    </View>
  );
}

/** `[soneAccordionIcon]` — the chevron (or your icon) that turns over when the item is open. */
export function SoneAccordionIcon({
  style,
  children,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const item = useContext(ITEM);
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
        item?.open && { transform: [{ rotate: "180deg" }] },
        style,
      ]}
    >
      <SoneForegroundProvider
        value={{
          color: pressed ? t.textPrimary : t.textMuted,
          iconSize: t.controlIcon,
        }}
      >
        {children ?? <SoneIcon name="chevron-down" />}
      </SoneForegroundProvider>
    </View>
  );
}
