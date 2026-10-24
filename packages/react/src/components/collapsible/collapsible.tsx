"use client";

import {
  createContext,
  createElement,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type ElementType,
  type MouseEvent,
  type ReactElement,
} from "react";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";

interface CollapsibleContext {
  readonly expanded: boolean;
  readonly disabled: boolean;
  readonly contentId: string;
  setContentId(id: string | undefined): void;
  toggle(): void;
}

const COLLAPSIBLE = createContext<CollapsibleContext | null>(null);

const state = (open: boolean) => (open ? "open" : "closed");

export interface SoneCollapsibleOwnProps {
  /** Shown or not, controlled with `onExpandedChange` (the Vue `v-model:expanded`). */
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly disabled?: boolean;
}

/** `[soneCollapsible]` — `expanded` / `defaultExpanded` / `onExpandedChange`. */
export function SoneCollapsible<E extends ElementType = "div">({
  as,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  disabled = false,
  ...rest
}: PolymorphicProps<E, SoneCollapsibleOwnProps>): ReactElement {
  const [expanded, setExpanded] = useControllable(
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  const fallbackId = `sone-collapsible-${useId()}-content`;
  const [ownId, setOwnId] = useState<string | undefined>();
  const context = useMemo<CollapsibleContext>(
    () => ({
      expanded,
      disabled,
      contentId: ownId ?? fallbackId,
      setContentId: setOwnId,
      toggle: () => {
        if (!disabled) setExpanded(!expanded);
      },
    }),
    [expanded, disabled, ownId, fallbackId, setExpanded],
  );
  return (
    <COLLAPSIBLE.Provider value={context}>
      {createElement(as ?? "div", {
        "data-slot": "collapsible",
        "data-state": state(expanded),
        "data-disabled": flag(disabled),
        ...rest,
      })}
    </COLLAPSIBLE.Provider>
  );
}

/** `button[soneCollapsibleTrigger]` */
export function SoneCollapsibleTrigger({
  type = "button",
  className,
  onClick,
  ...rest
}: ComponentPropsWithRef<"button">): ReactElement {
  const root = useContext(COLLAPSIBLE);
  return (
    <button
      data-slot="collapsible-trigger"
      type={type}
      {...(root && {
        "aria-controls": root.contentId,
        "aria-expanded": root.expanded,
        "data-state": state(root.expanded),
        disabled: root.disabled,
        "data-disabled": flag(root.disabled),
      })}
      {...rest}
      className={cx("collapsible-trigger", className)}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        root?.toggle();
      }}
    />
  );
}

/** `[soneCollapsibleContent]` — `hidden` while collapsed. */
export function SoneCollapsibleContent<E extends ElementType = "div">({
  as,
  id,
  className,
  ...rest
}: PolymorphicProps<E, { id?: string }>): ReactElement {
  const root = useContext(COLLAPSIBLE);
  if (!root) throw new Error("SoneCollapsibleContent needs a SoneCollapsible");
  const { setContentId } = root;
  useLayoutEffect(() => {
    setContentId(id);
    return () => setContentId(undefined);
  }, [id, setContentId]);
  return createElement(as ?? "div", {
    "data-slot": "collapsible-content",
    ...rest,
    className: cx("collapsible-content", className),
    id: id ?? root.contentId,
    "data-state": state(root.expanded),
    "data-disabled": flag(root.disabled),
    hidden: !root.expanded,
  });
}

export const SoneCollapsibleIcon = definePart({
  name: "SoneCollapsibleIcon",
  tag: "span",
  className: "collapsible-icon",
  slot: "collapsible-icon",
  static: { "aria-hidden": "true" },
});
