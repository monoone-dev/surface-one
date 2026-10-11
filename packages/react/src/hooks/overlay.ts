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

import {
  captureOpener,
  createModalFocus,
  focusInitial,
  focusLost,
} from "@surface-one/core";

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
    active: false,
    opener: null as HTMLElement | null,
    pressStartedOnLayer: false,
  });

  const behaviour = useMemo(() => {
    const s = state.current;
    const focus = createModalFocus({
      layer: () => opts.current.layer.current,
      panel: () => opts.current.panel.current,
      dismissible: () => opts.current.dismissible,
      dismiss: () => opts.current.dismiss(),
    });

    return {
      cycleFocus: focus.cycle,
      dismissIfAllowed: focus.dismissIfAllowed,
      /** Before React's `autoFocus` moves focus in: remember who opened it. */
      captureOpener(): void {
        if (!s.active) s.opener = captureOpener();
      },
      activate(): void {
        if (!focus.activate()) return;
        s.active = true;
        const panel = opts.current.panel.current;
        if (!panel) return;
        focus.ready();
        // React's `autoFocus` (or a child's own effect) already put focus inside: keep it.
        if (
          panel.contains(document.activeElement) &&
          document.activeElement !== panel
        )
          return;
        focusInitial(panel);
      },
      deactivate(): void {
        if (!focus.deactivate()) return;
        s.active = false;
        // The opener is kept until the next open: StrictMode re-runs the effect.
        const target = s.opener;
        if (focusLost(opts.current.panel.current) && target?.isConnected)
          target.focus();
      },
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
