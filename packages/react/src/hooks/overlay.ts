"use client";

import {
  createContext,
  useContext,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

/** What a dialog / sheet title or description registers with its overlay. */
export interface SoneOverlayLabel {
  readonly id: () => string;
}

export interface SoneOverlayHost {
  registerTitle(title: SoneOverlayLabel): void;
  unregisterTitle(title: SoneOverlayLabel): void;
  registerDescription(description: SoneOverlayLabel): void;
  unregisterDescription(description: SoneOverlayLabel): void;
}

/** The overlay a title or description registers with (the twin of the Vue `SONE_OVERLAY` key). */
export const SONE_OVERLAY = createContext<SoneOverlayHost | null>(null);

/** The overlay around the caller, if any. */
export function useSoneOverlayHost(): SoneOverlayHost | null {
  return useContext(SONE_OVERLAY);
}

const TABBABLE =
  'a[href], area[href], button, input:not([type="hidden"]), select, textarea, ' +
  'iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

function isTabbable(el: HTMLElement): boolean {
  if (el.tabIndex < 0) return false;
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.closest("fieldset:disabled, [inert]")) return false;
  // `offsetParent` is null for visible `position: fixed` elements, so check rendered boxes instead.
  return el.getClientRects().length > 0;
}

/** The open overlays, oldest first: only the topmost answers document-level keys. */
const openOverlays: object[] = [];

export interface OverlayOptions {
  /** Shown and in the DOM (the panel ref is set). */
  readonly open: boolean;
  readonly layer: RefObject<HTMLElement | null>;
  readonly panel: RefObject<HTMLElement | null>;
  readonly dismissible: boolean;
  readonly closeOnScrim: boolean;
  readonly dismiss: () => void;
}

/**
 * The modal behaviour shared by SoneDialog, SoneAlertDialog and SoneSheet — the React
 * port of the Angular `SoneOverlayBase`: focus moves in on open (to what React's
 * `autoFocus` already focused, else `[autofocus]` / `[data-autofocus]`, else the panel)
 * and back to the opener on close, Tab cycles inside, Escape and a press-and-release
 * on the scrim dismiss, and the title / description name the panel. Provide `host`
 * through `SONE_OVERLAY` around the panel's content.
 */
export function useOverlay(options: OverlayOptions) {
  const opts = useRef(options);
  useInsertionEffect(() => {
    opts.current = options;
  });

  const [title, setTitle] = useState<SoneOverlayLabel | null>(null);
  const [description, setDescription] = useState<SoneOverlayLabel | null>(null);

  const host = useMemo<SoneOverlayHost>(
    () => ({
      registerTitle: (t) => setTitle(() => t),
      unregisterTitle: (t) => setTitle((cur) => (cur === t ? null : cur)),
      registerDescription: (d) => setDescription((cur) => cur ?? d),
      unregisterDescription: (d) =>
        setDescription((cur) => (cur === d ? null : cur)),
    }),
    [],
  );

  const state = useRef({
    token: {},
    ready: false,
    active: false,
    opener: null as HTMLElement | null,
    pressStartedOnLayer: false,
  });

  const behaviour = useMemo(() => {
    const s = state.current;
    const isTopmost = (): boolean =>
      openOverlays[openOverlays.length - 1] === s.token;

    const tabbables = (): HTMLElement[] => {
      const panel = opts.current.panel.current;
      if (!panel) return [];
      const all = Array.from(
        panel.querySelectorAll<HTMLElement>(TABBABLE),
      ).filter(isTabbable);
      // A named radio group is ONE Tab stop, as the browser treats it.
      const groupStop = new Map<string, HTMLInputElement>();
      for (const el of all) {
        if (
          !(el instanceof HTMLInputElement) ||
          el.type !== "radio" ||
          !el.name
        )
          continue;
        const current = groupStop.get(el.name);
        if (!current || (el.checked && !current.checked))
          groupStop.set(el.name, el);
      }
      return all.filter(
        (el) =>
          !(el instanceof HTMLInputElement && el.type === "radio" && el.name) ||
          groupStop.get(el.name) === el,
      );
    };

    const cycleFocus = (backwards: boolean): void => {
      const panel = opts.current.panel.current;
      if (!panel) return;
      const stops = tabbables();
      if (stops.length === 0) {
        panel.focus();
        return;
      }
      const current = document.activeElement;
      const inside =
        current instanceof HTMLElement &&
        current !== panel &&
        panel.contains(current);
      let next: HTMLElement | undefined;
      if (!inside) {
        next = backwards ? stops[stops.length - 1] : stops[0];
      } else if (backwards) {
        const before = stops.filter(
          (st) =>
            st !== current &&
            !!(
              st.compareDocumentPosition(current) &
              Node.DOCUMENT_POSITION_FOLLOWING
            ),
        );
        next = before[before.length - 1] ?? stops[stops.length - 1];
      } else {
        const after = stops.filter(
          (st) =>
            st !== current &&
            !!(
              st.compareDocumentPosition(current) &
              Node.DOCUMENT_POSITION_PRECEDING
            ),
        );
        next = after[0] ?? stops[0];
      }
      next?.focus();
    };

    const dismissIfAllowed = (): void => {
      if (opts.current.dismissible) opts.current.dismiss();
    };

    // Focus fell out of every element (on `<body>`): the panel's own keydown cannot
    // hear the key, so the topmost overlay answers here.
    const onDocumentKeydown = (event: KeyboardEvent): void => {
      if (!s.ready || !isTopmost() || event.defaultPrevented) return;
      const current = document.activeElement;
      if (
        current &&
        current !== document.body &&
        current !== document.documentElement
      )
        return;
      if (event.key === "Tab") {
        event.preventDefault();
        cycleFocus(event.shiftKey);
      } else if (event.key === "Escape") {
        event.preventDefault();
        dismissIfAllowed();
      }
    };

    const onDocumentFocusIn = (event: FocusEvent): void => {
      if (!s.ready || !isTopmost()) return;
      const layer = opts.current.layer.current;
      const target = event.target;
      if (!layer || !(target instanceof Node) || layer.contains(target)) return;
      // A node placed after the overlay in the document was portaled after it opened
      // (menu, popover, nested dialog) and stacks on top — leave it be.
      if (
        layer.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_FOLLOWING
      )
        return;
      cycleFocus(false);
    };

    /** Before React's `autoFocus` moves focus in: remember who opened it. */
    const captureOpener = (): void => {
      if (s.active) return;
      // `document.body` is excluded: focus already fell there, and "returning" to it
      // would steal focus from what the opener restores.
      const opener = document.activeElement as HTMLElement | null;
      s.opener =
        opener && opener !== document.body && typeof opener.focus === "function"
          ? opener
          : null;
    };

    const activate = (): void => {
      if (s.active) return;
      s.active = true;
      openOverlays.push(s.token);
      document.addEventListener("keydown", onDocumentKeydown);
      document.addEventListener("focusin", onDocumentFocusIn);
      const panel = opts.current.panel.current;
      if (!panel) return;
      s.ready = true;
      // React's `autoFocus` (or a child's own effect) already put focus inside: keep it.
      if (
        panel.contains(document.activeElement) &&
        document.activeElement !== panel
      )
        return;
      const target = panel.querySelector<HTMLElement>(
        "[autofocus], [data-autofocus]",
      );
      (target ?? panel).focus();
      if (
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement) &&
        target.dataset["autofocus"] === "select"
      ) {
        target.select();
      }
    };

    const deactivate = (): void => {
      if (!s.active) return;
      s.active = false;
      s.ready = false;
      const i = openOverlays.indexOf(s.token);
      if (i >= 0) openOverlays.splice(i, 1);
      document.removeEventListener("keydown", onDocumentKeydown);
      document.removeEventListener("focusin", onDocumentFocusIn);
      // Only reclaim focus if it is still ours or lost — an owner that already moved it elsewhere keeps it.
      const current = document.activeElement;
      const panel = opts.current.panel.current;
      const lost =
        !current ||
        current === document.body ||
        !!panel?.contains(current) ||
        // The panel is already gone from the DOM, and focus with it.
        !current.isConnected;
      // The opener is kept until the next open: StrictMode re-runs the effect.
      const target = s.opener;
      if (lost && target?.isConnected) target.focus();
    };

    return {
      cycleFocus,
      dismissIfAllowed,
      captureOpener,
      activate,
      deactivate,
    };
  }, []);

  // Insertion effects run before the layout phase, where React applies `autoFocus`.
  useInsertionEffect(() => {
    if (options.open) behaviour.captureOpener();
  }, [options.open, behaviour]);

  useLayoutEffect(() => {
    if (!options.open) return;
    behaviour.activate();
    return behaviour.deactivate;
  }, [options.open, behaviour]);

  return {
    host,
    titleId: title?.id(),
    descriptionId: description?.id(),
    onKeyDown(event: ReactKeyboardEvent): void {
      if (event.key !== "Tab" || event.isDefaultPrevented()) return;
      event.preventDefault();
      behaviour.cycleFocus(event.shiftKey);
    },
    onEscape(event: ReactKeyboardEvent): void {
      event.stopPropagation();
      behaviour.dismissIfAllowed();
    },
    onLayerPointerDown(event: ReactPointerEvent): void {
      state.current.pressStartedOnLayer = event.target === event.currentTarget;
    },
    onLayerClick(event: ReactMouseEvent): void {
      const s = state.current;
      const startedOnLayer = s.pressStartedOnLayer;
      s.pressStartedOnLayer = false;
      if (
        event.target === event.currentTarget &&
        startedOnLayer &&
        opts.current.closeOnScrim &&
        opts.current.dismissible
      ) {
        opts.current.dismiss();
      }
    },
    requestClose(): void {
      behaviour.dismissIfAllowed();
    },
  };
}
