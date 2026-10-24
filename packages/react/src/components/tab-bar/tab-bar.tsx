"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import {
  tabBarCurrent,
  tabBarItemKind,
  tabBarShowsLabel,
  type TabBarItem,
  type TabBarLabels,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { SoneIcon } from "../icon/icon";

export type { TabBarItem, TabBarLabels } from "@surface-one/core";

export interface SoneTabBarProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  readonly items: readonly TabBarItem[];
  /** The active tab's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string) => void;
  /** Names the navigation landmark (default: the "Tab bar" message). */
  readonly ariaLabel?: string | null;
  /** `active` shows the active tab's label only; `always` every label. */
  readonly labels?: TabBarLabels;
  /** A centred pill (the default); `false` is a full-width bar. */
  readonly floating?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-tab-bar>` — mobile-style bottom navigation for the web (the twin of the React
 * Native `SoneTabBar`): a `nav` of `items`, each a link (`href`, `aria-current="page"`
 * while active) or a button, with an icon and the active tab's label (`labels="always"`
 * shows every one). `value` / `defaultValue` / `onValueChange` hold the active tab.
 * `floating` (the default) is a centred pill that sticks to the bottom; `false` a
 * full-width bar.
 */
export function SoneTabBar({
  items,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  ariaLabel = null,
  labels = "active",
  floating = true,
  ...rest
}: SoneTabBarProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange as ((value: string | null) => void) | undefined,
  );
  return createElement(
    "sone-tab-bar",
    {
      "data-slot": "tab-bar",
      "data-floating": floating ? "" : undefined,
      "data-labels": labels,
      ...rest,
    },
    <nav
      className="tab-bar"
      data-slot="tab-bar-nav"
      aria-label={ariaLabel ?? messages.tabBarLabel}
    >
      <ul className="tab-bar-list" role="list">
        {items.map((item) => {
          const active = item.value === value;
          const link = tabBarItemKind(item) === "link";
          const props = {
            className: "tab-bar-item",
            "data-slot": "tab-bar-item",
            "data-active": active ? "" : undefined,
            "aria-current": tabBarCurrent(item, active) ?? undefined,
            onClick: () => {
              if (!item.disabled) setValue(item.value);
            },
          };
          const content = (
            <>
              {item.icon ? <SoneIcon icon={item.icon} /> : null}
              <span
                className={
                  tabBarShowsLabel(labels, active)
                    ? "tab-bar-label"
                    : "tab-bar-label sr-only"
                }
              >
                {item.label}
              </span>
            </>
          );
          return (
            <li key={item.value} className="tab-bar-cell">
              {link ? (
                <a {...props} href={item.href}>
                  {content}
                </a>
              ) : (
                <button {...props} type="button" disabled={item.disabled}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>,
  );
}
