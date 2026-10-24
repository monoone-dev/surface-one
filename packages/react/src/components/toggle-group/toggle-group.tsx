"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type ReactElement,
} from "react";

import { moveGroupFocus } from "@surface-one/core";

import { cx, flag, type PolymorphicProps } from "../../utils/part";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
export type TabsVariant = "default" | "line";

type KeyHandler = ((e: KeyboardEvent<HTMLElement>) => void) | undefined;

interface ToggleGroupContextValue {
  readonly variant: ToggleVariant;
  readonly size: ToggleSize;
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
}

/** `[soneToggleGroup]` — a set of toggle buttons; arrow keys move between them. */
export function SoneToggleGroup<E extends ElementType = "div">({
  as,
  variant = "default",
  size = "default",
  spacing = 0,
  orientation = "horizontal",
  stretch = false,
  className,
  style,
  onKeyDown,
  children,
  ...rest
}: PolymorphicProps<E, SoneToggleGroupOwnProps>): ReactElement {
  const context = useMemo(() => ({ variant, size }), [variant, size]);
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
}

/** `[soneToggleGroupItem]` — takes its variant and size from the group. */
export function SoneToggleGroupItem<E extends ElementType = "button">({
  as,
  pressed = false,
  className,
  ...rest
}: PolymorphicProps<E, SoneToggleGroupItemOwnProps>): ReactElement {
  const group = useContext(ToggleGroupContext);
  return createElement(as ?? "button", {
    "data-slot": "toggle-group-item",
    "data-variant": group?.variant ?? "default",
    "data-size": group?.size ?? "default",
    "data-state": pressed ? "on" : "off",
    "aria-pressed": String(pressed),
    ...rest,
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
