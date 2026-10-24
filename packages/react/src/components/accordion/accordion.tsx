"use client";

import {
  createContext,
  createElement,
  useContext,
  useId,
  useMemo,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  isAccordionItemOpen,
  moveGroupFocus,
  toggleAccordionValue,
  type AccordionType,
  type AccordionValue,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";
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
  readonly contentId: string;
  toggle(): void;
}

const ACCORDION = createContext<AccordionContext | null>(null);
const ITEM = createContext<AccordionItemContext | null>(null);

const state = (open: boolean) => (open ? "open" : "closed");

function useItem(part: string): AccordionItemContext {
  const item = useContext(ITEM);
  if (!item) throw new Error(`${part} needs a SoneAccordionItem`);
  return item;
}

export interface SoneAccordionOwnProps {
  /** The open item values, controlled with `onValueChange` (the Vue `v-model`). */
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
 * `[soneAccordion]` — headed sections that show and hide their content (WAI-ARIA
 * Accordion). `type`, `collapsible`, `value` / `defaultValue` / `onValueChange`.
 */
export function SoneAccordion<E extends ElementType = "div">({
  as,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  type = "single",
  collapsible = false,
  disabled = false,
  className,
  onKeyDown,
  ...rest
}: PolymorphicProps<E, SoneAccordionOwnProps>): ReactElement {
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
  return (
    <ACCORDION.Provider value={context}>
      {createElement(as ?? "div", {
        "data-slot": "accordion",
        "data-orientation": "vertical",
        "data-disabled": flag(disabled),
        ...rest,
        className: cx("accordion", className as string | undefined),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          (
            onKeyDown as ((e: KeyboardEvent<HTMLElement>) => void) | undefined
          )?.(event);
          const target = event.target as HTMLElement;
          if (target.closest('[data-slot="accordion"]') !== event.currentTarget)
            return;
          moveGroupFocus(event.currentTarget, "accordion-trigger", true, event);
        },
      })}
    </ACCORDION.Provider>
  );
}

export interface SoneAccordionItemOwnProps {
  /** Names the item in the accordion's value; unique by default. */
  readonly value?: string;
  readonly disabled?: boolean;
}

/** `[soneAccordionItem]` — one section: a trigger and its content. */
export function SoneAccordionItem<E extends ElementType = "div">({
  as,
  value: valueProp,
  disabled: disabledProp = false,
  className,
  ...rest
}: PolymorphicProps<E, SoneAccordionItemOwnProps>): ReactElement {
  const root = useContext(ACCORDION);
  if (!root) throw new Error("SoneAccordionItem needs a SoneAccordion");
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
      contentId: `${uid}-content`,
      toggle: () => {
        if (!disabled) toggle(value);
      },
    }),
    [open, disabled, uid, toggle, value],
  );
  return (
    <ITEM.Provider value={context}>
      {createElement(as ?? "div", {
        "data-slot": "accordion-item",
        "data-state": state(open),
        "data-disabled": flag(disabled),
        ...rest,
        className: cx("accordion-item", className as string | undefined),
      })}
    </ITEM.Provider>
  );
}

export interface SoneAccordionTriggerProps extends HTMLAttributes<HTMLElement> {
  /** The heading level of the trigger (`aria-level`). */
  readonly level?: number;
  /** Replaces the chevron (the Vue `#icon` slot): a `SoneAccordionIcon`. */
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-accordion-trigger>` — the item's heading (`level`) with the button that opens
 * and closes it.
 */
export function SoneAccordionTrigger({
  level = 3,
  icon,
  children,
  className,
  ...rest
}: SoneAccordionTriggerProps): ReactElement {
  const item = useItem("SoneAccordionTrigger");
  return createElement(
    "sone-accordion-trigger",
    {
      "data-slot": "accordion-header",
      role: "heading",
      "aria-level": level,
      "data-state": state(item.open),
      ...rest,
      className: cx("accordion-header", className),
    },
    <button
      type="button"
      className="accordion-trigger"
      data-slot="accordion-trigger"
      id={item.triggerId}
      aria-controls={item.contentId}
      aria-expanded={item.open}
      data-state={state(item.open)}
      data-disabled={flag(item.disabled)}
      disabled={item.disabled}
      onClick={item.toggle}
    >
      <span className="accordion-trigger-label">{children}</span>
      {icon ?? (
        <span
          className="accordion-icon"
          data-slot="accordion-trigger-icon"
          aria-hidden="true"
        >
          <SoneIcon icon="chevron-down" />
        </span>
      )}
    </button>,
  );
}

/** `[soneAccordionContent]` — the region the trigger shows, hidden while closed. */
export function SoneAccordionContent<E extends ElementType = "div">({
  as,
  className,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const item = useItem("SoneAccordionContent");
  return createElement(as ?? "div", {
    "data-slot": "accordion-content",
    role: "region",
    ...rest,
    className: cx("accordion-content", className as string | undefined),
    id: item.contentId,
    "aria-labelledby": item.triggerId,
    "data-state": state(item.open),
    "data-disabled": flag(item.disabled),
    hidden: !item.open,
  });
}

/** `[soneAccordionIcon]` — your own icon in place of the chevron (the trigger's `icon`). */
export const SoneAccordionIcon = definePart({
  name: "SoneAccordionIcon",
  tag: "span",
  className: "accordion-icon",
  slot: "accordion-trigger-icon",
  static: { "aria-hidden": "true" },
});
