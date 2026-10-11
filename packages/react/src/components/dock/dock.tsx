"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";

import { useSoneMessages } from "../../context/messages";
import {
  useSoneTooltip,
  type TooltipAlign,
  type TooltipSide,
} from "../../tooltip/tooltip";
import { cx, definePart, flag } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export type DockPosition = "top" | "bottom" | "left" | "right";
export type DockAlign = "start" | "center" | "end";
export type DockSize = "sm" | "default";

/** Tooltips open towards the canvas, away from the edge the dock sits on. */
const TOOLTIP_SIDE: Record<DockPosition, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** One registered tool, as the dock sees it. */
interface DockItemRef {
  readonly el: RefObject<HTMLButtonElement | null>;
  disabled: boolean;
  active: boolean | undefined;
}

/** What a dock item reads from the dock it sits in (the Angular `SONE_DOCK`). */
interface SoneDockContext {
  readonly orientation: "horizontal" | "vertical";
  readonly tooltipSide: TooltipSide;
  /** The item that holds the dock's single Tab stop (`null` until the items mount). */
  readonly tabStop: DockItemRef | null;
  register(item: DockItemRef): () => void;
  /** An item's `disabled` / `active` changed. */
  changed(): void;
  focused(item: DockItemRef): void;
}

const DockContext = createContext<SoneDockContext | null>(null);

/** The registered items in document order. */
function inDocumentOrder(items: readonly DockItemRef[]): DockItemRef[] {
  return [...items].sort((a, b) => {
    const x = a.el.current;
    const y = b.el.current;
    if (!x || !y) return 0;
    // 4: Node.DOCUMENT_POSITION_FOLLOWING.
    return x.compareDocumentPosition(y) & 4 ? -1 : 1;
  });
}

export interface SoneDockProps extends HTMLAttributes<HTMLElement> {
  /** The edge it docks to. */
  readonly position?: DockPosition;
  /** Where along that edge: centred, or at its start or end. */
  readonly align?: DockAlign;
  readonly size?: DockSize;
  /** Pin to the edge of the nearest positioned ancestor (`position: relative`). Default `true`. */
  readonly floating?: boolean;
  readonly children?: ReactNode;
}

/**
 * `<sone-dock>` — a toolbar of drawing tools docked to one edge of a canvas.
 * `position` picks the edge (and with it the direction: a row on top or bottom, a
 * column on the sides); `floating` (the default) pins it inside the nearest
 * positioned ancestor. A WAI-ARIA toolbar: one Tab stop, arrow keys along its
 * direction, Home / End. Its accessible name defaults to the "Tools" message
 * (`aria-label` overrides it).
 */
export function SoneDock({
  position = "bottom",
  align = "center",
  size = "default",
  floating = true,
  onKeyDown,
  children,
  ...rest
}: SoneDockProps) {
  const m = useSoneMessages();
  const items = useRef<DockItemRef[]>([]);
  const [current, setCurrent] = useState<DockItemRef | null>(null);
  const [version, bump] = useReducer((n: number) => n + 1, 0);

  const orientation =
    position === "left" || position === "right" ? "vertical" : "horizontal";

  const enabled = (): DockItemRef[] =>
    inDocumentOrder(items.current).filter((i) => !i.disabled);

  // The last focused tool, else the active one, else the first.
  const tabStop = useMemo<DockItemRef | null>(() => {
    const list = enabled();
    if (current && list.includes(current)) return current;
    return list.find((i) => i.active) ?? list[0] ?? null;
    // `version` stands for the registered items, which live in a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, version]);

  const register = useCallback((item: DockItemRef) => {
    items.current = [...items.current, item];
    bump();
    return () => {
      items.current = items.current.filter((i) => i !== item);
      bump();
    };
  }, []);

  const context = useMemo<SoneDockContext>(
    () => ({
      orientation,
      tooltipSide: TOOLTIP_SIDE[position],
      tabStop,
      register,
      changed: bump,
      focused: setCurrent,
    }),
    [orientation, position, tabStop, register],
  );

  const onKeydown = (e: KeyboardEvent<HTMLElement>): void => {
    onKeyDown?.(e);
    const vertical = orientation === "vertical";
    const rtl =
      !vertical &&
      e.currentTarget.closest("[dir]")?.getAttribute("dir") === "rtl";
    const prev = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const list = enabled();
    if (!list.length) return;
    const at = list.findIndex((i) => i.el.current === e.target);
    let to: number;
    if (e.key === prev) to = at <= 0 ? list.length - 1 : at - 1;
    else if (e.key === next) to = at === list.length - 1 ? 0 : at + 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = list.length - 1;
    else return;
    e.preventDefault();
    const item = list[to]!;
    setCurrent(item);
    item.el.current?.focus();
  };

  return (
    <DockContext.Provider value={context}>
      {createElement(
        "sone-dock",
        {
          "data-slot": "dock",
          role: "toolbar",
          "aria-label": m.dockLabel,
          "aria-orientation": orientation,
          "data-position": position,
          "data-align": align,
          "data-orientation": orientation,
          "data-size": size,
          "data-floating": flag(floating),
          ...rest,
          onKeyDown: onKeydown,
        },
        children,
      )}
    </DockContext.Provider>
  );
}

export interface SoneDockItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The accessible name and the tooltip. */
  readonly label: string;
  /** A key that picks the tool (`V`, `Shift+R`) — shown in the tooltip, announced as `aria-keyshortcuts`. */
  readonly shortcut?: string | null;
  /** `true` / `false`: a toggle; unset: a plain button. */
  readonly active?: boolean;
  readonly tooltipDisabled?: boolean;
  readonly tooltipAlign?: TooltipAlign;
  readonly ref?: Ref<HTMLButtonElement>;
}

/**
 * `button[soneDockItem]` — one tool of a dock: an icon button named by `label`,
 * which is also its tooltip (with the `shortcut`, if any). `active` makes it a
 * toggle (`aria-pressed`): the current drawing tool. Leave it unset for a plain
 * action (zoom, undo).
 */
export function SoneDockItem({
  label,
  shortcut = null,
  active,
  disabled = false,
  tooltipDisabled = false,
  tooltipAlign = "center",
  className,
  onFocus,
  ref,
  children,
  ...rest
}: SoneDockItemProps) {
  const dock = useContext(DockContext);
  const el = useRef<HTMLButtonElement | null>(null);
  const [item] = useState<DockItemRef>(() => ({ el, disabled, active }));

  const register = dock?.register;
  useLayoutEffect(() => register?.(item), [register, item]);
  const changed = dock?.changed;
  useLayoutEffect(() => {
    if (item.disabled === disabled && item.active === active) return;
    item.disabled = disabled;
    item.active = active;
    changed?.();
  }, [item, disabled, active, changed]);

  const tooltip = shortcut ? `${label} (${shortcut})` : label;
  const tooltipRef = useSoneTooltip<HTMLButtonElement>({
    text: tooltip,
    side: dock?.tooltipSide ?? "bottom",
    align: tooltipAlign,
    disabled: tooltipDisabled,
  });
  const merged = useMemo(
    () => mergeRefs<HTMLButtonElement>(el, tooltipRef, ref),
    [tooltipRef, ref],
  );

  const tabIndex = dock?.tabStop ? (dock.tabStop === item ? 0 : -1) : undefined;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      aria-keyshortcuts={shortcut ?? undefined}
      data-tooltip={tooltip}
      data-active={flag(!!active)}
      tabIndex={tabIndex}
      disabled={disabled}
      {...rest}
      ref={merged}
      className={cx("dock-item", className)}
      data-slot="dock-item"
      onFocus={(e) => {
        onFocus?.(e);
        if (dock) dock.focused(item);
      }}
    >
      {children}
    </button>
  );
}

/** `[soneDockGroup]` — a labelled run of related tools (`role="group"`). */
export const SoneDockGroup = definePart<"div", { label?: string | null }>({
  name: "SoneDockGroup",
  tag: "div",
  className: "dock-group",
  slot: "dock-group",
  static: { role: "group" },
  props: ["label"],
  attrs: (p) => ({ "aria-label": p.label ?? undefined }),
});

/** `[soneDockSeparator]` — a rule between groups of tools, across the dock's direction. */
export function SoneDockSeparator({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const dock = useContext(DockContext);
  return (
    <div
      role="separator"
      aria-orientation={
        dock?.orientation === "vertical" ? "horizontal" : "vertical"
      }
      {...rest}
      className={cx("dock-separator", className)}
      data-slot="dock-separator"
    />
  );
}
