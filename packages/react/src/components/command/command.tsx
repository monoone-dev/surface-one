"use client";

import {
  createContext,
  createElement,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  commandItemMatches,
  listNavigationIndex,
  soneCommandFilter,
  type SoneCommandFilter,
} from "@surface-one/core";

import { useControllable } from "../../utils/controllable";
import { cx, flag } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export { soneCommandFilter, type SoneCommandFilter } from "@surface-one/core";

/** One option, as the command sees it. */
interface CommandItemRecord {
  readonly id: () => string;
  readonly value: () => string;
  readonly keywords: () => readonly string[];
  readonly disabled: () => boolean;
  readonly element: () => HTMLElement | null;
  choose(): void;
}

interface CommandContextValue {
  readonly search: string;
  setSearch(value: string): void;
  setActive(value: string | null): void;
  matches(value: string, keywords: readonly string[]): boolean;
  /** The highlighted option (`null` until the options have mounted). */
  readonly activeItem: CommandItemRecord | null;
  /** Some option matches (assumed until the options have mounted, as on the server). */
  readonly hasVisible: boolean;
  readonly listId: string | null;
  setListId(id: string | null): void;
  register(item: CommandItemRecord): () => void;
  /** An option's value, keywords or disabled state changed. */
  refresh(): void;
}

interface CommandGroupContextValue {
  register(item: CommandItemRecord): () => void;
  refresh(): void;
}

const CommandContext = createContext<CommandContextValue | null>(null);
const CommandGroupContext = createContext<CommandGroupContextValue | null>(
  null,
);

function useCommand(part: string): CommandContextValue {
  const command = useContext(CommandContext);
  if (!command) throw new Error(`${part} must sit inside a <SoneCommand>.`);
  return command;
}

/** Document order; options that have not mounted yet go last. */
function byDocumentOrder(a: CommandItemRecord, b: CommandItemRecord): number {
  const ea = a.element();
  const eb = b.element();
  if (!ea || !eb) return ea ? -1 : eb ? 1 : 0;
  return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/** The text `children` render, as `textContent` would read it (on the server too). */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node))
    return textOf(node.props.children);
  return "";
}

/** A registry that re-renders its owner when it changes. */
function useRegistry(): {
  items: readonly CommandItemRecord[];
  register(item: CommandItemRecord): () => void;
  refresh(): void;
} {
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const items = useRef<readonly CommandItemRecord[]>([]);
  const register = useCallback((item: CommandItemRecord) => {
    items.current = [...items.current, item];
    refresh();
    return () => {
      items.current = items.current.filter((i) => i !== item);
      refresh();
    };
  }, []);
  return { items: items.current, register, refresh };
}

/** The mounted flag: `false` on the server and in the first client render. */
function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** The keyboard handling `handleRef` exposes. */
export interface SoneCommandHandle {
  /** Forwards a key from an input that lives elsewhere (a textarea driving a slash menu). */
  handleKeydown(event: KeyboardEvent | ReactKeyboardEvent): void;
}

export interface SoneCommandProps extends HTMLAttributes<HTMLElement> {
  /** The search text (controlled), with `onSearchChange`; or `defaultSearch`. `SoneCommandInput` writes it. */
  readonly search?: string;
  readonly defaultSearch?: string;
  readonly onSearchChange?: (search: string) => void;
  /** Filter the items by `search`. Turn off for server-side search. */
  readonly shouldFilter?: boolean;
  /** A custom match function (default `soneCommandFilter`). */
  readonly filter?: SoneCommandFilter;
  /** Arrow keys wrap from the last option to the first. */
  readonly loop?: boolean;
  /** The highlighted option's value (controlled), with `onActiveChange`; or `defaultActive`. */
  readonly active?: string | null;
  readonly defaultActive?: string | null;
  readonly onActiveChange?: (active: string | null) => void;
  /** `handleKeydown(event)`. */
  readonly handleRef?: Ref<SoneCommandHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-command>` — a filterable command list (shadcn/ui Command): a combobox
 * input (`SoneCommandInput`) over a listbox (`SoneCommandList`). The input keeps
 * focus; the highlighted option is announced through `aria-activedescendant`.
 * Arrow keys, Home / End and PageUp / PageDown move the highlight, Enter selects it.
 *
 * Filtering is built in (case- and accent-insensitive, item `value` + `keywords`);
 * set `shouldFilter` to `false` when the list already comes filtered from a server.
 */
export function SoneCommand({
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  shouldFilter = true,
  filter = soneCommandFilter,
  loop = false,
  active: activeProp,
  defaultActive = null,
  onActiveChange,
  handleRef,
  className,
  onKeyDown,
  children,
  ...rest
}: SoneCommandProps): ReactElement {
  const [search, setSearch] = useControllable(
    searchProp,
    defaultSearch,
    onSearchChange,
  );
  const [active, setActive] = useControllable<string | null>(
    activeProp,
    defaultActive,
    onActiveChange,
  );
  const [listId, setListId] = useState<string | null>(null);
  const registry = useRegistry();
  const mounted = useMounted();

  const matches = (value: string, keywords: readonly string[]): boolean =>
    commandItemMatches(value, keywords, search, shouldFilter, filter);
  const visible = registry.items
    .filter((item) => matches(item.value(), item.keywords()))
    .sort(byDocumentOrder);
  const enabled = visible.filter((item) => !item.disabled());
  const activeItem = mounted
    ? (enabled.find((item) => item.value() === active) ?? enabled[0] ?? null)
    : null;
  const hasVisible = !mounted || visible.length > 0;

  const handleKeydown = (event: KeyboardEvent | ReactKeyboardEvent): void => {
    const native = "nativeEvent" in event ? event.nativeEvent : event;
    if (event.defaultPrevented || native.isComposing) return;
    if (event.key === "Enter") {
      if (activeItem) {
        event.preventDefault();
        activeItem.choose();
      }
      return;
    }
    const current = activeItem ? enabled.indexOf(activeItem) : -1;
    const next = listNavigationIndex(event.key, current, enabled.length, {
      wrap: loop,
    });
    if (next === null) return;
    event.preventDefault();
    const item = enabled[next]!;
    setActive(item.value());
    item.element()?.scrollIntoView?.({ block: "nearest" });
  };
  const keydownRef = useRef(handleKeydown);
  keydownRef.current = handleKeydown;
  useImperativeHandle(handleRef, () => ({
    handleKeydown: (event) => keydownRef.current(event),
  }));

  const value: CommandContextValue = {
    search,
    setSearch,
    setActive,
    matches,
    activeItem,
    hasVisible,
    listId,
    setListId,
    register: registry.register,
    refresh: registry.refresh,
  };

  return createElement(
    "sone-command",
    {
      ...rest,
      className: cx("command", className),
      "data-slot": "command",
      onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e);
        handleKeydown(e);
      },
    },
    <CommandContext.Provider value={value}>{children}</CommandContext.Provider>,
  );
}

export type SoneCommandInputProps = InputHTMLAttributes<HTMLInputElement> & {
  readonly ref?: Ref<HTMLInputElement>;
};

/** `SoneCommandInput` — the combobox that searches the command list and keeps focus. */
export function SoneCommandInput({
  className,
  onChange,
  ...rest
}: SoneCommandInputProps): ReactElement {
  const command = useCommand("SoneCommandInput");
  return (
    <input
      {...rest}
      className={cx("command-input", className)}
      data-slot="command-input"
      role="combobox"
      type="text"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      aria-autocomplete="list"
      aria-expanded={command.hasVisible ? "true" : "false"}
      aria-controls={command.listId ?? undefined}
      aria-activedescendant={command.activeItem?.id() ?? undefined}
      value={command.search}
      onChange={(e) => {
        onChange?.(e);
        command.setSearch(e.target.value);
        // A new search starts from the first match.
        command.setActive(null);
      }}
    />
  );
}

interface PartProps extends HTMLAttributes<HTMLElement> {
  /** The element to render instead of a `<div>`. */
  readonly as?: ElementType;
  readonly ref?: Ref<HTMLElement>;
}

/** `SoneCommandList` — the listbox; it scrolls when the options overflow. */
export function SoneCommandList({
  as = "div",
  id: idProp,
  className,
  ...rest
}: PartProps): ReactElement {
  const command = useCommand("SoneCommandList");
  const fallback = `sone-command-list-${useId()}`;
  const id = idProp ?? fallback;
  const { setListId } = command;
  useLayoutEffect(() => {
    setListId(id);
    return () => setListId(null);
  }, [id, setListId]);
  return createElement(as, {
    ...rest,
    className: cx("command-list", className),
    "data-slot": "command-list",
    // An empty listbox is invalid ARIA: with no option to show, the list is a
    // plain container for the `SoneCommandEmpty` message and the combobox collapses.
    role: command.hasVisible ? "listbox" : undefined,
    id,
  });
}

export interface SoneCommandGroupProps extends PartProps {
  readonly heading?: string | null;
}

/** `SoneCommandGroup` — a labelled group of options; it hides when none of them match. */
export function SoneCommandGroup({
  as = "div",
  heading = null,
  className,
  children,
  ...rest
}: SoneCommandGroupProps): ReactElement {
  const command = useCommand("SoneCommandGroup");
  const headingId = `sone-command-group-${useId()}`;
  const registry = useRegistry();
  const mounted = useMounted();
  const group = useMemo<CommandGroupContextValue>(
    () => ({ register: registry.register, refresh: registry.refresh }),
    [registry.register, registry.refresh],
  );
  const hasVisible =
    !mounted ||
    registry.items.some((item) =>
      command.matches(item.value(), item.keywords()),
    );
  return createElement(
    as,
    {
      ...rest,
      className: cx("command-group", className),
      "data-slot": "command-group",
      role: "group",
      "aria-labelledby": heading ? headingId : undefined,
      hidden: !hasVisible,
    },
    heading ? (
      <div
        className="command-group-heading"
        data-slot="command-group-heading"
        id={headingId}
        aria-hidden="true"
      >
        {heading}
      </div>
    ) : null,
    <CommandGroupContext.Provider value={group}>
      {children}
    </CommandGroupContext.Provider>,
  );
}

export interface SoneCommandItemProps extends Omit<PartProps, "onSelect"> {
  /** What the search matches and `onSelect` receives (default: the text content). */
  readonly value?: string | null;
  readonly keywords?: readonly string[];
  readonly disabled?: boolean;
  /** Chosen with a click or Enter; receives the item's value. */
  readonly onSelect?: (value: string) => void;
}

const NO_KEYWORDS: readonly string[] = [];

/**
 * `SoneCommandItem` — one option. `value` is what the search matches (default: the
 * text content) and what `onSelect` receives; `keywords` match too.
 */
export function SoneCommandItem({
  as = "div",
  value: valueProp = null,
  keywords = NO_KEYWORDS,
  disabled = false,
  id: idProp,
  onSelect,
  className,
  children,
  ref,
  onClick,
  onPointerMove,
  onMouseDown,
  ...rest
}: SoneCommandItemProps): ReactElement {
  const command = useCommand("SoneCommandItem");
  const group = useContext(CommandGroupContext);
  const fallbackId = `sone-command-item-${useId()}`;
  const id = idProp ?? fallbackId;
  const element = useRef<HTMLElement | null>(null);
  const value = valueProp ?? textOf(children).trim();
  const latest = useRef({ id, value, keywords, disabled, onSelect, command });
  latest.current = { id, value, keywords, disabled, onSelect, command };

  const record = useMemo<CommandItemRecord>(() => {
    const itemValue = (): string =>
      latest.current.value || (element.current?.textContent ?? "").trim();
    return {
      id: () => latest.current.id,
      value: itemValue,
      keywords: () => latest.current.keywords,
      disabled: () => latest.current.disabled,
      element: () => element.current,
      choose() {
        if (latest.current.disabled) return;
        latest.current.command.setActive(itemValue());
        latest.current.onSelect?.(itemValue());
      },
    };
  }, []);

  const { register, refresh } = command;
  useLayoutEffect(() => register(record), [register, record]);
  useLayoutEffect(() => group?.register(record), [group, record]);
  // The command and the group read these through the record: re-render them on change.
  const keywordsKey = keywords.join("\u0000");
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    refresh();
    group?.refresh();
  }, [value, keywordsKey, disabled, refresh, group]);

  const visible = command.matches(value, keywords);
  const isActive = command.activeItem === record;
  return createElement(
    as,
    {
      ...rest,
      ref: mergeRefs(element, ref),
      className: cx("menu-item command-item", className),
      "data-slot": "command-item",
      role: "option",
      id,
      "aria-selected": isActive ? "true" : "false",
      "aria-disabled": disabled ? "true" : undefined,
      "data-selected": flag(isActive),
      "data-disabled": flag(disabled),
      hidden: !visible,
      onClick: (e: ReactMouseEvent<HTMLElement>) => {
        onClick?.(e);
        record.choose();
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        onPointerMove?.(e);
        if (!disabled && !isActive) command.setActive(record.value());
      },
      onMouseDown: (e: ReactMouseEvent<HTMLElement>) => {
        onMouseDown?.(e);
        e.preventDefault();
      },
    },
    children,
  );
}

/** `SoneCommandEmpty` — shown only when no option matches. */
export function SoneCommandEmpty({
  as = "div",
  className,
  ...rest
}: PartProps): ReactElement {
  const command = useCommand("SoneCommandEmpty");
  return createElement(as, {
    ...rest,
    className: cx("command-empty", className),
    "data-slot": "command-empty",
    role: "presentation",
    hidden: command.hasVisible,
  });
}

/** `SoneCommandSeparator` — a divider between groups; hidden while searching. */
export function SoneCommandSeparator({
  as = "div",
  className,
  ...rest
}: PartProps): ReactElement {
  const command = useCommand("SoneCommandSeparator");
  return createElement(as, {
    ...rest,
    className: cx("command-separator", className),
    "data-slot": "command-separator",
    role: "presentation",
    "aria-hidden": "true",
    hidden: !!command.search.trim(),
  });
}
