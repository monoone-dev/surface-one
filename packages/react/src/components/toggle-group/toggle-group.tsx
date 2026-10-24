"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from "react";

import { moveGroupFocus } from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { cx, flag, type PolymorphicProps } from "../../utils/part";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
export type TabsVariant = "default" | "line";
/** `single`: one item pressed at a time (pressing it again clears it); `multiple`: any number. */
export type ToggleGroupType = "single" | "multiple";
/** The group's value: the pressed item's value (`single`) or the pressed values (`multiple`). */
export type ToggleGroupValue = string | readonly string[] | null;

const toList = (v: ToggleGroupValue | undefined): readonly string[] =>
  v == null ? [] : typeof v === "string" ? [v] : v;

type KeyHandler = ((e: KeyboardEvent<HTMLElement>) => void) | undefined;
type ClickHandler = ((e: MouseEvent<HTMLElement>) => void) | undefined;
type FocusHandler = ((e: FocusEvent<HTMLElement>) => void) | undefined;

interface ToggleGroupContextValue {
  readonly variant: ToggleVariant;
  readonly size: ToggleSize;
  readonly type: ToggleGroupType | null;
  readonly disabled: boolean;
  readonly tabStop: string | null;
  readonly isOn: (value: string) => boolean;
  readonly toggle: (value: string) => void;
  readonly focused: (value: string) => void;
}

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export interface SoneToggleGroupOwnProps {
  readonly variant?: ToggleVariant;
  readonly size?: ToggleSize;
  /** The gap between items in spacing units; 0 joins them into one bar. */
  readonly spacing?: number;
  readonly orientation?: ToggleOrientation;
  /** Fill the container's width on one row, every item an equal share. */
  readonly stretch?: boolean;
  /** The group presses its items (`single` / `multiple`); unset, each item's `pressed` decides. */
  readonly type?: ToggleGroupType | null;
  /** The pressed value (`single`, `null` for none) or values (`multiple`), controlled. */
  readonly value?: ToggleGroupValue;
  readonly defaultValue?: ToggleGroupValue;
  readonly onValueChange?: (value: ToggleGroupValue) => void;
  /** Every item disabled. */
  readonly disabled?: boolean;
}

/**
 * `[soneToggleGroup]` — a set of toggle buttons; arrow keys move between them. Without
 * `type` each item takes its own `pressed`; with `type="single"` / `"multiple"` the group
 * presses the items that carry a `value` (`value` / `defaultValue` / `onValueChange`) and
 * is one Tab stop (roving tabindex).
 */
export function SoneToggleGroup<E extends ElementType = "div">({
  as,
  variant = "default",
  size = "default",
  spacing = 0,
  orientation = "horizontal",
  stretch = false,
  type = null,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  disabled = false,
  className,
  style,
  onKeyDown,
  children,
  ...rest
}: PolymorphicProps<E, SoneToggleGroupOwnProps>): ReactElement {
  const [value, setValue] = useControllable<ToggleGroupValue>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [focusedValue, setFocusedValue] = useState<string | null>(null);
  const isOn = useCallback((v: string) => toList(value).includes(v), [value]);
  const toggle = useCallback(
    (v: string) => {
      if (disabled) return;
      const list = toList(value);
      const on = list.includes(v);
      if (type === "multiple")
        setValue(on ? list.filter((x) => x !== v) : [...list, v]);
      else setValue(on ? null : v);
    },
    [disabled, type, value, setValue],
  );
  const tabStop = type ? (focusedValue ?? toList(value)[0] ?? null) : null;
  const context = useMemo<ToggleGroupContextValue>(
    () => ({
      variant,
      size,
      type,
      disabled,
      tabStop,
      isOn,
      toggle,
      focused: setFocusedValue,
    }),
    [variant, size, type, disabled, tabStop, isOn, toggle],
  );
  const role = (rest as { role?: string }).role ?? (type ? "group" : undefined);
  return (
    <ToggleGroupContext.Provider value={context}>
      {createElement(
        as ?? "div",
        {
          "data-slot": "toggle-group",
          "data-variant": variant,
          "data-size": size,
          "data-spacing": spacing,
          "data-orientation": orientation,
          "data-stretch": flag(stretch),
          role,
          ...rest,
          className: cx("toggle-group", className),
          style: {
            "--toggle-group-spacing": spacing,
            ...(style as CSSProperties | undefined),
          } as CSSProperties,
          onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            moveGroupFocus(
              e.currentTarget,
              "toggle-group-item",
              orientation === "vertical",
              e,
            );
            (onKeyDown as KeyHandler)?.(e);
          },
        },
        children,
      )}
    </ToggleGroupContext.Provider>
  );
}

export interface SoneToggleGroupItemOwnProps {
  readonly pressed?: boolean;
  /** Its value in a group with `type`: the group presses it. */
  readonly value?: string;
  readonly disabled?: boolean;
}

/**
 * `[soneToggleGroupItem]` — takes its variant and size from the group, and its pressed
 * state too when it has a `value` in a group with `type`.
 */
export function SoneToggleGroupItem<E extends ElementType = "button">({
  as,
  pressed = false,
  value,
  disabled = false,
  className,
  onClick,
  onFocus,
  ...rest
}: PolymorphicProps<E, SoneToggleGroupItemOwnProps>): ReactElement {
  const group = useContext(ToggleGroupContext);
  const grouped = !!group?.type && value !== undefined;
  const on = grouped ? group!.isOn(value!) : pressed;
  const isDisabled = disabled || !!group?.disabled;
  const stop = group?.tabStop ?? null;
  return createElement(as ?? "button", {
    "data-slot": "toggle-group-item",
    "data-variant": group?.variant ?? "default",
    "data-size": group?.size ?? "default",
    "data-state": on ? "on" : "off",
    "aria-pressed": String(on),
    disabled: isDisabled || undefined,
    tabIndex: stop === null ? undefined : value === stop ? 0 : -1,
    ...rest,
    onClick: (e: MouseEvent<HTMLElement>) => {
      (onClick as ClickHandler)?.(e);
      if (grouped && !isDisabled && !e.defaultPrevented) group!.toggle(value!);
    },
    onFocus: (e: FocusEvent<HTMLElement>) => {
      (onFocus as FocusHandler)?.(e);
      if (value !== undefined) group?.focused(value);
    },
    className: cx("toggle", className),
  });
}

export interface SoneToggleOwnProps {
  readonly variant?: ToggleVariant;
  readonly size?: ToggleSize;
  readonly pressed?: boolean;
}

/** `[soneToggle]` — a single two-state button. */
export function SoneToggle<E extends ElementType = "button">({
  as,
  variant = "default",
  size = "default",
  pressed = false,
  className,
  ...rest
}: PolymorphicProps<E, SoneToggleOwnProps>): ReactElement {
  return createElement(as ?? "button", {
    "data-slot": "toggle",
    "data-variant": variant,
    "data-size": size,
    "data-state": pressed ? "on" : "off",
    "aria-pressed": String(pressed),
    ...rest,
    className: cx("toggle", className),
  });
}

export interface SoneTabsListOwnProps {
  readonly variant?: TabsVariant;
  readonly orientation?: ToggleOrientation;
  /** Fill the container's width, every trigger an equal share. */
  readonly stretch?: boolean;
}

/**
 * `[soneTabsList]` — give it `role="tablist"` (and its triggers `role="tab"`) for real
 * tabs; without the roles it is a row of pressed / not-pressed buttons.
 */
export function SoneTabsList<E extends ElementType = "div">({
  as,
  variant = "default",
  orientation = "horizontal",
  stretch = false,
  className,
  onKeyDown,
  ...rest
}: PolymorphicProps<E, SoneTabsListOwnProps>): ReactElement {
  const isTablist = (rest as { role?: string }).role === "tablist";
  return createElement(as ?? "div", {
    "data-slot": "tabs-list",
    "data-variant": variant,
    "data-orientation": orientation,
    "data-stretch": flag(stretch),
    "aria-orientation":
      isTablist && orientation === "vertical" ? "vertical" : undefined,
    ...rest,
    className: cx("tabs-list", className),
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      moveGroupFocus(
        e.currentTarget,
        "tabs-trigger",
        orientation === "vertical",
        e,
      );
      (onKeyDown as KeyHandler)?.(e);
    },
  });
}

export interface SoneTabsTriggerOwnProps {
  readonly active?: boolean;
  /** An icon-only trigger. */
  readonly icon?: boolean;
}

export function SoneTabsTrigger<E extends ElementType = "button">({
  as,
  active = false,
  icon = false,
  className,
  ...rest
}: PolymorphicProps<E, SoneTabsTriggerOwnProps>): ReactElement {
  const isTab = (rest as { role?: string }).role === "tab";
  return createElement(as ?? "button", {
    "data-slot": "tabs-trigger",
    "data-state": active ? "active" : "inactive",
    "aria-selected": isTab ? String(active) : undefined,
    // A tablist is one Tab stop (WAI-ARIA Tabs): the active tab; arrows move between tabs.
    tabIndex: isTab ? (active ? 0 : -1) : undefined,
    "aria-pressed": isTab ? undefined : String(active),
    "data-icon": flag(icon),
    ...rest,
    className: cx("tabs-trigger", className),
  });
}
