"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type RefObject,
} from "react";

import { createNavigationMenu, type NavigationMenu } from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

interface RootContext {
  readonly value: string | null;
  readonly controller: NavigationMenu;
}

interface ItemContext {
  readonly key: string;
  readonly contentId: string;
  readonly open: boolean;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly content: RefObject<HTMLElement | null>;
}

const ROOT = createContext<RootContext | null>(null);
const ITEM = createContext<ItemContext | null>(null);

function useRoot(part: string): RootContext {
  const root = useContext(ROOT);
  if (!root) throw new Error(`${part} needs a SoneNavigationMenu`);
  return root;
}

function useItem(part: string): ItemContext {
  const item = useContext(ITEM);
  if (!item) throw new Error(`${part} needs a SoneNavigationMenuItem`);
  return item;
}

type Handler<E> = ((event: E) => void) | undefined;

export interface SoneNavigationMenuOwnProps {
  /** The open item's `value` (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  /** ms from resting the pointer on a trigger to opening (when nothing is open yet). */
  readonly openDelay?: number;
  /** ms from leaving an item to closing. */
  readonly closeDelay?: number;
}

/**
 * `<SoneNavigationMenu>` — the React twin of `nav[soneNavigationMenu]`: site navigation
 * (shadcn/ui and Radix NavigationMenu), not an ARIA menu. One content is open at a
 * time (`value` / `defaultValue` / `onValueChange`); it opens on click, ArrowDown or a
 * hover after `openDelay`, and closes `closeDelay` after the pointer leaves, on Escape,
 * on a click outside and when focus leaves the menu. Closed contents stay in the page
 * (`hidden`).
 */
export function SoneNavigationMenu<E extends ElementType = "nav">({
  as,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  openDelay = 200,
  closeDelay = 150,
  className,
  onBlur,
  ref,
  ...rest
}: PolymorphicProps<E, SoneNavigationMenuOwnProps>): ReactElement {
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const root = useRef<HTMLElement | null>(null);
  const live = useRef({ value, setValue, openDelay, closeDelay });
  useInsertionEffect(() => {
    live.current = { value, setValue, openDelay, closeDelay };
  });
  const [controller] = useState(() =>
    createNavigationMenu({
      value: () => live.current.value,
      setValue: (v) => {
        live.current.value = v;
        live.current.setValue(v);
      },
      openDelay: () => live.current.openDelay,
      closeDelay: () => live.current.closeDelay,
      afterRender: (fn) => setTimeout(fn, 0),
    }),
  );
  useEffect(() => controller.cancel, [controller]);
  useEffect(() => {
    if (value === null) return;
    const onPointerDown = (event: PointerEvent): void => {
      if (root.current) controller.pointerDown(root.current, event.target);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [value, controller]);

  const rootRef = useMemo(() => mergeRefs(root, ref as never), [ref]);
  const context = useMemo(() => ({ value, controller }), [value, controller]);
  return (
    <ROOT.Provider value={context}>
      {createElement(as ?? "nav", {
        ...rest,
        ref: rootRef,
        className: cx("navigation-menu", className as string | undefined),
        "data-slot": "navigation-menu",
        // React's blur bubbles, like focusout.
        onBlur: (event: ReactFocusEvent<HTMLElement>) => {
          (onBlur as Handler<ReactFocusEvent<HTMLElement>>)?.(event);
          if (root.current)
            controller.focusOut(root.current, event.relatedTarget);
        },
      })}
    </ROOT.Provider>
  );
}

/** `[soneNavigationMenuList]` — the `<ul>` of top-level items; arrow keys move along it. */
export function SoneNavigationMenuList<E extends ElementType = "ul">({
  as,
  className,
  onKeyDown,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const { controller } = useRoot("SoneNavigationMenuList");
  return createElement(as ?? "ul", {
    ...rest,
    className: cx("navigation-menu-list", className as string | undefined),
    "data-slot": "navigation-menu-list",
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
      controller.listKeyDown(event.currentTarget, event);
    },
  });
}

export interface SoneNavigationMenuItemOwnProps {
  /** What the menu's `value` says when this item is open (generated when left out). */
  readonly value?: string | null;
}

/** `[soneNavigationMenuItem]` — one `<li>`: a link, or a trigger and its content. */
export function SoneNavigationMenuItem<E extends ElementType = "li">({
  as,
  value,
  className,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: PolymorphicProps<E, SoneNavigationMenuItemOwnProps>): ReactElement {
  const root = useRoot("SoneNavigationMenuItem");
  const id = `sone-navigation-menu-${useId()}`;
  const key = value ?? id;
  const trigger = useRef<HTMLElement | null>(null);
  const content = useRef<HTMLElement | null>(null);
  const open = root.value === key;
  const item = useMemo(
    () => ({ key, contentId: `${id}-content`, open, trigger, content }),
    [key, id, open],
  );
  return (
    <ITEM.Provider value={item}>
      {createElement(as ?? "li", {
        ...rest,
        className: cx("navigation-menu-item", className as string | undefined),
        "data-slot": "navigation-menu-item",
        onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
          (onPointerEnter as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
          if (trigger.current)
            root.controller.itemEnter(key, event.pointerType);
        },
        onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
          (onPointerLeave as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
          root.controller.itemLeave(event.pointerType);
        },
      })}
    </ITEM.Provider>
  );
}

/** `[soneNavigationMenuTrigger]` — the button that reveals its item's content. */
export function SoneNavigationMenuTrigger<E extends ElementType = "button">({
  as,
  className,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const { controller } = useRoot("SoneNavigationMenuTrigger");
  const item = useItem("SoneNavigationMenuTrigger");
  const triggerRef = useMemo(
    () => mergeRefs(item.trigger, ref as never),
    [item.trigger, ref],
  );
  const tag: ElementType = as ?? "button";
  return createElement(tag, {
    ...(tag === "button" && { type: "button" }),
    ...rest,
    ref: triggerRef,
    className: cx("navigation-menu-trigger", className as string | undefined),
    "data-slot": "navigation-menu-trigger",
    "aria-expanded": item.open ? "true" : "false",
    "aria-controls": item.contentId,
    "data-state": item.open ? "open" : "closed",
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
      controller.triggerClick(item.key);
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
      controller.triggerKeyDown(item.key, event, () => item.content.current);
    },
  });
}

/** `[soneNavigationMenuContent]` — the panel of links its trigger reveals, under the item. */
export function SoneNavigationMenuContent<E extends ElementType = "div">({
  as,
  className,
  onKeyDown,
  onClick,
  ref,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const { controller } = useRoot("SoneNavigationMenuContent");
  const item = useItem("SoneNavigationMenuContent");
  const contentRef = useMemo(
    () => mergeRefs(item.content, ref as never),
    [item.content, ref],
  );
  return createElement(as ?? "div", {
    ...rest,
    ref: contentRef,
    className: cx("navigation-menu-content", className as string | undefined),
    "data-slot": "navigation-menu-content",
    id: item.contentId,
    hidden: !item.open,
    "data-state": item.open ? "open" : "closed",
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
      controller.contentKeyDown(event, item.trigger.current);
    },
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
      const target = event.target;
      if (target instanceof Element && target.closest("a[href]"))
        controller.linkClick();
    },
  });
}

/** `[soneNavigationMenuLink]` — a link; `active` marks the current page (`aria-current="page"`). */
export const SoneNavigationMenuLink = definePart<"a", { active?: boolean }>({
  name: "SoneNavigationMenuLink",
  tag: "a",
  className: "navigation-menu-link",
  slot: "navigation-menu-link",
  props: ["active"],
  attrs: (p) => ({
    "aria-current": p.active ? "page" : undefined,
    "data-active": p.active ? "" : undefined,
  }),
});
