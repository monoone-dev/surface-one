"use client";

import {
  Children,
  cloneElement,
  createContext,
  createElement,
  Fragment,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";

import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export type ChoiceOrientation = "vertical" | "horizontal";

interface ChoiceGroupContextValue {
  /** The tab stop once the group is mounted (from the DOM); `null` before. */
  readonly stop: HTMLElement | null;
}

const ChoiceGroupContext = createContext<ChoiceGroupContextValue | null>(null);
/** Whether a card the group's own children render is the tab stop, known while rendering. */
const RenderedStopContext = createContext<boolean | undefined>(undefined);

// Read from the DOM at event time on purpose: owners bind the native `disabled`
// (or a disabled `<fieldset>` wraps the set).
function isDisabled(el: HTMLElement | null): boolean {
  return (
    !!el &&
    (el.matches(":disabled") || el.getAttribute("aria-disabled") === "true")
  );
}

const KEYS = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"];

/** The children with fragments flattened, keys kept unique. */
function flatten(children: ReactNode, prefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  Children.toArray(children).forEach((child) => {
    if (
      isValidElement<{ children?: ReactNode }>(child) &&
      child.type === Fragment
    ) {
      out.push(
        ...flatten(child.props.children, `${prefix}${String(child.key)}/`),
      );
    } else if (isValidElement(child) && prefix) {
      out.push(cloneElement(child, { key: `${prefix}${String(child.key)}` }));
    } else {
      out.push(child);
    }
  });
  return out;
}

const isCard = (
  node: ReactNode,
): node is ReactElement<SoneChoiceCardOwnProps & { disabled?: unknown }> =>
  isValidElement(node) && node.type === SoneChoiceCard;

/** The cards of a group in DOM order (not those of a nested group). */
function cardsOf(host: HTMLElement): HTMLElement[] {
  return Array.from(
    host.querySelectorAll<HTMLElement>('[data-slot="choice-card"]'),
  ).filter((el) => el.closest('[data-slot="choice-group"]') === host);
}

export interface SoneChoiceGroupOwnProps {
  readonly orientation?: ChoiceOrientation | null;
}

/**
 * `[soneChoiceGroup]` — a `radiogroup` of choice cards: one Tab stop (the checked
 * card), arrow keys move AND select, as a native radio group does.
 */
export function SoneChoiceGroup<E extends ElementType = "div">({
  as,
  orientation,
  onKeyDown,
  children,
  ref,
  ...rest
}: PolymorphicProps<E, SoneChoiceGroupOwnProps>): ReactElement {
  const host = useRef<HTMLElement | null>(null);
  const hostRef = useMemo(() => mergeRefs(host, ref as never), [ref]);
  const [stop, setStop] = useState<HTMLElement | null>(null);

  // The checked card, else the first ENABLED one — a disabled first card would
  // leave the group with no reachable Tab stop. After every commit, on purpose: a card's
  // checked or disabled state can change without the group re-rendering with new props.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- runs after every commit, see above
  useLayoutEffect(() => {
    const all = host.current ? cardsOf(host.current) : [];
    const next =
      all.find((c) => c.getAttribute("data-state") === "checked") ??
      all.find((c) => !isDisabled(c)) ??
      all[0] ??
      null;
    setStop((prev) => (prev === next ? prev : next));
  });

  // The server (and the first client render) cannot see the DOM: pick the tab stop
  // among the cards the group's own children render.
  const items = flatten(children);
  const own = items.filter(isCard);
  const renderedStop =
    own.find((v) => !!v.props.selected) ??
    own.find((v) => !v.props.disabled) ??
    own[0];

  const context = useMemo(() => ({ stop }), [stop]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    (onKeyDown as ((e: KeyboardEvent<HTMLElement>) => void) | undefined)?.(
      event,
    );
    if (!KEYS.includes(event.key) || !host.current) return;
    const enabled = cardsOf(host.current).filter((c) => !isDisabled(c));
    if (enabled.length === 0) return;
    const current = enabled.findIndex((c) => c.contains(event.target as Node));
    let next: number;
    switch (event.key) {
      case "Home":
        next = 0;
        break;
      case "End":
        next = enabled.length - 1;
        break;
      case "ArrowDown":
      case "ArrowRight":
        next = current < 0 ? 0 : (current + 1) % enabled.length;
        break;
      default:
        next =
          current < 0
            ? enabled.length - 1
            : (current - 1 + enabled.length) % enabled.length;
    }
    event.preventDefault();
    const target = enabled[next];
    target?.focus();
    if (target && target.getAttribute("data-state") !== "checked")
      target.click();
  };

  return (
    <ChoiceGroupContext.Provider value={context}>
      {createElement(
        as ?? "div",
        {
          role: "radiogroup",
          "data-slot": "choice-group",
          "aria-orientation": orientation ?? undefined,
          ...rest,
          ref: hostRef,
          onKeyDown: handleKeyDown,
        },
        items.map((child) =>
          isCard(child) ? (
            <RenderedStopContext.Provider
              key={child.key}
              value={child === renderedStop}
            >
              {child}
            </RenderedStopContext.Provider>
          ) : (
            child
          ),
        ),
      )}
    </ChoiceGroupContext.Provider>
  );
}

export interface SoneChoiceCardOwnProps {
  readonly selected?: boolean;
  readonly orientation?: ChoiceOrientation;
}

/**
 * `[soneChoiceCard]` — a large selectable card (a `<button>` by default). Inside a
 * `SoneChoiceGroup` it is a `radio`; alone it is a pressed / not-pressed toggle.
 * The owner selects it: `selected` + `onClick`.
 */
export function SoneChoiceCard<E extends ElementType = "button">({
  as,
  selected = false,
  orientation = "vertical",
  className,
  children,
  ref,
  ...rest
}: PolymorphicProps<E, SoneChoiceCardOwnProps>): ReactElement {
  const group = useContext(ChoiceGroupContext);
  const renderedStop = useContext(RenderedStopContext);
  const el = useRef<HTMLElement | null>(null);
  const [self, setSelf] = useState<HTMLElement | null>(null);
  const cardRef = useMemo(() => mergeRefs(el, setSelf, ref as never), [ref]);

  // Until the group has looked at the DOM (server render, hydration) its render-time
  // answer; then the cards in DOM order, which also sees nested cards.
  const isTabStop = group
    ? group.stop
      ? group.stop === self
      : !!renderedStop
    : false;
  const role = group ? "radio" : (rest as { role?: string }).role;
  const isRadio = role === "radio";
  return createElement(
    as ?? "button",
    {
      "data-slot": "choice-card",
      "data-state": selected ? "checked" : "unchecked",
      "data-orientation": orientation,
      "data-with-indicator": flag(
        flatten(children).some(
          (c) => isValidElement(c) && c.type === SoneChoiceCardIndicator,
        ),
      ),
      ...rest,
      role,
      "aria-checked": isRadio ? String(selected) : undefined,
      "aria-pressed": isRadio ? undefined : String(selected),
      tabIndex: group
        ? isTabStop
          ? 0
          : -1
        : (rest as { tabIndex?: number }).tabIndex,
      ref: cardRef,
      className: cx("choice-card", className),
    },
    children,
  );
}

export const SoneChoiceCardTitle = definePart({
  name: "SoneChoiceCardTitle",
  tag: "span",
  className: "choice-card-title",
  slot: "choice-card-title",
});

export const SoneChoiceCardDescription = definePart({
  name: "SoneChoiceCardDescription",
  tag: "span",
  className: "choice-card-description",
  slot: "choice-card-description",
});

/** The check / radio dot; a card with one makes room for it. */
export const SoneChoiceCardIndicator = definePart({
  name: "SoneChoiceCardIndicator",
  tag: "span",
  className: "choice-card-indicator",
  slot: "choice-card-indicator",
  static: { "aria-hidden": "true" },
});
