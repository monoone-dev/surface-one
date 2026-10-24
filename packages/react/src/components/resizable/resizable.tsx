"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  createResizable,
  resizableInitialSizes,
  resizableParse,
  resizableStorageKey,
  type Resizable,
  type ResizableDirection,
  type ResizablePanelLimits,
  type ResizableStorage,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { useSoneMessages } from "../../context/messages";
import { cx, flag } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

interface PanelEntry {
  readonly el: HTMLElement;
  readonly id: string;
  readonly limits: ResizablePanelLimits;
}

interface GroupContext {
  readonly direction: ResizableDirection;
  readonly panels: readonly PanelEntry[];
  readonly handles: readonly HTMLElement[];
  readonly layout: readonly number[];
  readonly dragging: number | null;
  readonly resizable: Resizable;
  registerPanel(entry: PanelEntry): () => void;
  registerHandle(el: HTMLElement): () => void;
}

const GROUP = createContext<GroupContext | null>(null);

function useGroup(part: string): GroupContext {
  const group = useContext(GROUP);
  if (!group) throw new Error(`${part} needs a SoneResizableGroup`);
  return group;
}

const byDocumentOrder =
  <T,>(elOf: (item: T) => HTMLElement) =>
  (a: T, b: T): number =>
    elOf(a).compareDocumentPosition(elOf(b)) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1;

export interface SoneResizableGroupProps extends HTMLAttributes<HTMLElement> {
  readonly direction?: ResizableDirection;
  /** The panels' sizes in percent (controlled), with `onSizesChange`; or `defaultSizes`. */
  readonly sizes?: readonly number[];
  readonly defaultSizes?: readonly number[];
  readonly onSizesChange?: (sizes: number[]) => void;
  /** Keep the sizes in `storage` under this id. */
  readonly autoSaveId?: string | null;
  /** Where `autoSaveId` keeps them — pass `localStorage`, or your own. */
  readonly storage?: ResizableStorage | null;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<SoneResizableGroup>` — the React twin of `sone-resizable-group`: resizable panels side
 * by side (`direction="horizontal"`) or stacked (`vertical`), sizes in percent as
 * `sizes` / `defaultSizes` / `onSizesChange`. Handles are WAI-ARIA window splitters
 * (drag, arrows, Home / End, Enter). `autoSaveId` with a `storage` (`localStorage`, or
 * your own) keeps the sizes between visits.
 */
export function SoneResizableGroup({
  direction = "horizontal",
  sizes: sizesProp,
  defaultSizes = [],
  onSizesChange,
  autoSaveId = null,
  storage = null,
  className,
  children,
  ref,
  ...rest
}: SoneResizableGroupProps): ReactElement {
  const [sizes, setSizes] = useControllable<readonly number[]>(
    sizesProp,
    defaultSizes,
    onSizesChange as ((sizes: readonly number[]) => void) | undefined,
  );
  const [panels, setPanels] = useState<readonly PanelEntry[]>([]);
  const [handles, setHandles] = useState<readonly HTMLElement[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const root = useRef<HTMLElement | null>(null);
  const limits = useMemo(() => panels.map((p) => p.limits), [panels]);
  const layout = useMemo(
    () =>
      sizes.length === limits.length ? sizes : resizableInitialSizes(limits),
    [sizes, limits],
  );
  const live = useRef({
    direction,
    limits,
    layout,
    setSizes,
    autoSaveId,
    storage,
  });
  useInsertionEffect(() => {
    live.current = { direction, limits, layout, setSizes, autoSaveId, storage };
  });
  const [resizable] = useState(() =>
    createResizable({
      direction: () => live.current.direction,
      panels: () => live.current.limits,
      sizes: () => live.current.layout,
      group: () => root.current,
      setSizes: (next, done) => {
        live.current.layout = next;
        live.current.setSizes(next);
        const { autoSaveId: id, storage: store } = live.current;
        if (done && id && store)
          store.setItem(resizableStorageKey(id), JSON.stringify(next));
      },
      dragging: setDragging,
    }),
  );
  useEffect(() => {
    if (!autoSaveId || !storage) return;
    const stored = resizableParse(
      storage.getItem(resizableStorageKey(autoSaveId)),
      panels.length,
    );
    if (stored) setSizes(stored);
    // Read once the panels are known; a later change of id does not reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per panel count
  }, [panels.length]);

  const registerPanel = useCallback((entry: PanelEntry) => {
    setPanels((list) =>
      [...list, entry].sort(byDocumentOrder<PanelEntry>((p) => p.el)),
    );
    return () => setPanels((list) => list.filter((p) => p !== entry));
  }, []);
  const registerHandle = useCallback((el: HTMLElement) => {
    setHandles((list) =>
      [...list, el].sort(byDocumentOrder<HTMLElement>((h) => h)),
    );
    return () => setHandles((list) => list.filter((h) => h !== el));
  }, []);
  const context = useMemo<GroupContext>(
    () => ({
      direction,
      panels,
      handles,
      layout,
      dragging,
      resizable,
      registerPanel,
      registerHandle,
    }),
    [
      direction,
      panels,
      handles,
      layout,
      dragging,
      resizable,
      registerPanel,
      registerHandle,
    ],
  );
  const rootRef = useMemo(() => mergeRefs(root, ref), [ref]);
  return (
    <GROUP.Provider value={context}>
      {createElement(
        "sone-resizable-group",
        {
          ...rest,
          ref: rootRef,
          className: cx("resizable-group", className),
          "data-slot": "resizable-group",
          "data-direction": direction,
          "data-dragging": flag(dragging !== null),
        },
        children,
      )}
    </GROUP.Provider>
  );
}

export interface SoneResizablePanelProps extends HTMLAttributes<HTMLElement> {
  /** Its size before any is bound or stored (percent); left out, it shares the rest. */
  readonly defaultSize?: number | null;
  readonly minSize?: number;
  readonly maxSize?: number;
  /** It collapses to `collapsedSize` when dragged well past `minSize`, or on Enter. */
  readonly collapsible?: boolean;
  readonly collapsedSize?: number;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-resizable-panel>` — one panel; its size is a percentage of the group. */
export function SoneResizablePanel({
  defaultSize = null,
  minSize = 0,
  maxSize = 100,
  collapsible = false,
  collapsedSize = 0,
  id: idProp,
  className,
  style,
  children,
  ref,
  ...rest
}: SoneResizablePanelProps): ReactElement {
  const group = useGroup("SoneResizablePanel");
  const fallbackId = `sone-resizable-panel-${useId()}`;
  const id = idProp ?? fallbackId;
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [entry, setEntry] = useState<PanelEntry | null>(null);
  const { registerPanel } = group;
  useLayoutEffect(() => {
    if (!el) return;
    const next: PanelEntry = {
      el,
      id,
      limits: { defaultSize, minSize, maxSize, collapsible, collapsedSize },
    };
    setEntry(next);
    return registerPanel(next);
  }, [
    el,
    id,
    defaultSize,
    minSize,
    maxSize,
    collapsible,
    collapsedSize,
    registerPanel,
  ]);
  const at = entry ? group.panels.indexOf(entry) : -1;
  const size = at >= 0 ? group.layout[at] : undefined;
  const grow = size ?? defaultSize;
  const panelRef = useMemo(() => mergeRefs(setEl, ref), [ref]);
  return createElement(
    "sone-resizable-panel",
    {
      ...rest,
      ref: panelRef,
      id,
      className: cx("resizable-panel", className),
      "data-slot": "resizable-panel",
      style:
        grow === null || grow === undefined
          ? style
          : { ...style, flex: `${grow} 1 0px` },
      "data-size": size,
      "data-collapsed": flag(
        size !== undefined &&
          collapsible &&
          size <= collapsedSize &&
          size < minSize,
      ),
    },
    children,
  );
}

export interface SoneResizableHandleProps extends HTMLAttributes<HTMLElement> {
  /** Draw a grip on the handle. */
  readonly withHandle?: boolean;
  readonly disabled?: boolean;
  /** The splitter's name (default: the `resizableHandle` message). */
  readonly label?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-resizable-handle>` — the window splitter between two panels; `withHandle` draws a grip. */
export function SoneResizableHandle({
  withHandle = false,
  disabled = false,
  label = null,
  className,
  onKeyDown,
  onPointerDown,
  ref,
  ...rest
}: SoneResizableHandleProps): ReactElement {
  const group = useGroup("SoneResizableHandle");
  const m = useSoneMessages();
  const [el, setEl] = useState<HTMLElement | null>(null);
  const { registerHandle } = group;
  useLayoutEffect(
    () => (el ? registerHandle(el) : undefined),
    [el, registerHandle],
  );
  const index = el ? group.handles.indexOf(el) : -1;
  const before = index >= 0 ? group.panels[index] : undefined;
  const size = index >= 0 ? group.layout[index] : undefined;
  const handleRef = useMemo(() => mergeRefs(setEl, ref), [ref]);
  return createElement(
    "sone-resizable-handle",
    {
      ...rest,
      ref: handleRef,
      className: cx("resizable-handle", className),
      "data-slot": "resizable-handle",
      role: "separator",
      tabIndex: disabled ? undefined : 0,
      "aria-label": label ?? m.resizableHandle,
      "aria-orientation":
        group.direction === "horizontal" ? "vertical" : "horizontal",
      "aria-valuenow": size === undefined ? undefined : Math.round(size),
      "aria-valuemin": before?.limits.minSize ?? 0,
      "aria-valuemax": before?.limits.maxSize ?? 100,
      "aria-controls": before?.id,
      "aria-disabled": disabled ? "true" : undefined,
      "data-direction": group.direction,
      "data-dragging": flag(index >= 0 && group.dragging === index),
      onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
        onKeyDown?.(e);
        if (!disabled) group.resizable.keyDown(index, e);
      },
      onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
        onPointerDown?.(e);
        if (!disabled)
          group.resizable.pointerDown(index, e.nativeEvent, e.currentTarget);
      },
    },
    withHandle ? (
      <div className="resizable-grip" data-slot="resizable-grip" />
    ) : null,
  );
}
