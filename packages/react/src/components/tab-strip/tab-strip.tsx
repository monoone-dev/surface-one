"use client";

import {
  createElement,
  useRef,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import {
  tabStripKeyAction,
  tabStripPanelId,
  tabStripTabId,
  tabStripTabIndex,
  type TabStripTab,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { SoneIcon } from "../icon/icon";

export type { TabStripStatus, TabStripTab } from "@surface-one/core";

/** Content after the tabs, pushed to the end of the strip (a search, an account). */
export function SoneTabStripTrailing({
  className,
  ...rest
}: ComponentPropsWithRef<"div">): ReactElement {
  return (
    <div
      {...rest}
      className={
        className ? `tab-strip-trailing ${className}` : "tab-strip-trailing"
      }
      data-slot="tab-strip-trailing"
    />
  );
}

export interface SoneTabStripProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onSelect"
> {
  readonly tabs?: readonly TabStripTab[];
  /** The selected tab's id (controlled), with `onActiveChange`; or `defaultActive`. */
  readonly active?: string | null;
  readonly defaultActive?: string | null;
  readonly onActiveChange?: (id: string) => void;
  /** Names the tab list (default: the "Tabs" message). */
  readonly ariaLabel?: string | null;
  /** Gives every tab a close button (and Delete / ⌘W); `onClose` removes the tab. */
  readonly closable?: boolean;
  /** Shows the "New tab" button; `onAdd` opens one. */
  readonly addable?: boolean;
  /** The id prefix the panels use, so each tab can point at its panel. */
  readonly panelIdPrefix?: string;
  readonly onClose?: (id: string) => void;
  readonly onAdd?: () => void;
  /** Content after the tabs (or a `SoneTabStripTrailing` child). */
  readonly trailing?: ReactNode;
}

/**
 * `<sone-tab-strip>` — document tabs for a desktop window (the WAI-ARIA Tabs pattern):
 * `active` / `defaultActive` / `onActiveChange` hold the selected tab's id. `closable`
 * gives every tab a close button (and Delete / ⌘W), `addable` a "New tab" button;
 * `onClose` and `onAdd` report them. ←/→, Home and End move between tabs.
 */
export function SoneTabStrip({
  tabs = [],
  active: activeProp,
  defaultActive = null,
  onActiveChange,
  ariaLabel = null,
  closable = false,
  addable = false,
  panelIdPrefix = "tab-panel",
  onClose,
  onAdd,
  trailing,
  children,
  ...rest
}: SoneTabStripProps): ReactElement {
  const messages = useSoneMessages();
  const [active, setActive] = useControllable<string | null>(
    activeProp,
    defaultActive,
    onActiveChange as ((id: string | null) => void) | undefined,
  );
  const root = useRef<HTMLElement | null>(null);
  const focus = (id: string): void => {
    root.current
      ?.querySelector<HTMLElement>(
        `#${CSS.escape(tabStripTabId(panelIdPrefix, id))}`,
      )
      ?.focus();
  };
  const onKeyDown = (event: KeyboardEvent, index: number): void => {
    const action = tabStripKeyAction(event, tabs, index, closable);
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      setActive(action.id);
      focus(action.id);
    } else {
      onClose?.(action.id);
      const next = action.next;
      if (next) requestAnimationFrame(() => focus(next));
    }
  };

  return createElement(
    "sone-tab-strip",
    { ref: root, "data-slot": "tab-strip", ...rest },
    <div
      className="tab-strip-tabs"
      data-slot="tab-strip-list"
      role="tablist"
      aria-label={ariaLabel ?? messages.tabStripLabel}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <div
            key={tab.id}
            className="tab-strip-tab"
            data-slot="tab-strip-tab"
            role="presentation"
            data-selected={selected ? "" : undefined}
          >
            <button
              type="button"
              role="tab"
              className="tab-strip-trigger"
              data-slot="tab-strip-trigger"
              id={tabStripTabId(panelIdPrefix, tab.id)}
              aria-selected={selected}
              aria-controls={tabStripPanelId(panelIdPrefix, tab.id)}
              tabIndex={tabStripTabIndex(tabs, active, i)}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="tab-strip-label">{tab.label}</span>
              {tab.note ? (
                <span
                  className="tab-strip-note"
                  data-status={tab.status ?? undefined}
                >
                  {tab.note}
                </span>
              ) : null}
              {tab.status ? (
                <span className="tab-strip-status" data-status={tab.status}>
                  <span className="sr-only">
                    {messages.tabStripStatus(tab.status)}
                  </span>
                </span>
              ) : null}
            </button>
            {closable ? (
              <button
                type="button"
                className="tab-strip-close"
                data-slot="tab-strip-close"
                tabIndex={-1}
                aria-hidden="true"
                aria-label={messages.tabStripClose(tab.label)}
                onClick={() => onClose?.(tab.id)}
              >
                <SoneIcon icon="close" />
              </button>
            ) : null}
          </div>
        );
      })}
    </div>,
    addable ? (
      <button
        className="btn tab-strip-add"
        data-slot="button"
        data-variant="ghost"
        data-size="icon-sm"
        type="button"
        aria-label={messages.tabStripAdd}
        title={messages.tabStripAdd}
        onClick={() => onAdd?.()}
      >
        <SoneIcon icon="plus" />
      </button>
    ) : null,
    <span className="tab-strip-spacer" />,
    trailing,
    children,
  );
}
