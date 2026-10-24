"use client";

import {
  createElement,
  useRef,
  useSyncExternalStore,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { useSoneMessages } from "../../context/messages";
import { SONE_OVERLAY, useOverlay } from "../../hooks/overlay";
import { useControllable } from "@surface-one/core/react/controllable";
import { cx } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

/** The props every overlay shares. Every other prop goes to the host (the scrim layer). */
export interface SoneOverlayProps extends HTMLAttributes<HTMLElement> {
  /**
   * Shown or not, controlled with `onOpenChange` — or leave it out and render the
   * overlay conditionally (it is open while rendered: `defaultOpen` is `true`),
   * listening to `onDismiss`.
   */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Escape, the scrim or the close button dismissed it. */
  readonly onDismiss?: () => void;
  /** Escape, the scrim and the close button may dismiss it. */
  readonly dismissible?: boolean;
  /** The corner close button. */
  readonly showClose?: boolean;
  /** The close button's name (default: the "Close" message). */
  readonly closeLabel?: string | null;
  /** Names the panel when it has no `SoneDialogTitle` (`aria-label` works too). */
  readonly ariaLabel?: string | null;
  /** Render in place instead of portaling to `<body>`. */
  readonly inline?: boolean;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

interface OverlaySpec {
  readonly name: string;
  readonly host: string;
  readonly layerClass: string;
  readonly layerSlot: string;
  readonly panelClass: string;
  readonly closeSlot?: string;
  /** `showClose` when the prop is left out (`true`). */
  readonly showCloseDefault?: boolean;
}

/** What an overlay with more behaviour (the drawer's swipe) adds to its panel. */
export interface OverlayExtension {
  /** Attributes and listeners for the panel. */
  readonly panelAttrs: Record<string, unknown>;
  /** Rendered first inside the panel (the drawer's handle). */
  readonly before: ReactNode;
}

/** What an extension hook gets: the panel element and the close the close button does. */
export interface OverlayExtensionContext {
  readonly panel: RefObject<HTMLDivElement | null>;
  readonly open: boolean;
  /** Escape, the scrim and the close button may dismiss it. */
  readonly dismissible: boolean;
  requestClose(): void;
}

interface OverlayPanel {
  readonly role: string;
  readonly slot: string;
  readonly closeOnScrim: boolean;
  readonly cornerClose: boolean;
  readonly attrs: Record<string, unknown>;
}

const subscribe = () => () => undefined;

/** `true` once in the browser; `false` on the server and while hydrating. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Builds an overlay component from its look (`spec`), its own props (`keys`, kept off
 * the host) and its per-render panel settings. Like the Vue `Teleport`, nothing
 * renders on the server: the portal to `<body>` mounts in the browser.
 */
export function defineOverlay<Own extends object>(
  spec: OverlaySpec,
  keys: readonly (keyof Own & string)[],
  panel: (props: Own) => OverlayPanel,
  /** A hook, called on every render, that adds panel attributes and content. */
  useExtension?: (
    props: Own,
    context: OverlayExtensionContext,
  ) => OverlayExtension,
) {
  function Overlay(props: SoneOverlayProps & Own) {
    const {
      open: openProp,
      defaultOpen = true,
      onOpenChange,
      onDismiss,
      dismissible = true,
      showClose = spec.showCloseDefault ?? true,
      closeLabel = null,
      ariaLabel: ariaLabelProp = null,
      inline = false,
      children,
      ref,
      className,
      onPointerDown,
      onClick,
      "aria-label": ariaLabelAttr,
      ...rest
    } = props as SoneOverlayProps & Record<string, unknown>;
    const own: Record<string, unknown> = {};
    for (const key of keys) {
      own[key] = rest[key];
      delete rest[key];
    }
    const settings = panel(own as Own);
    const ariaLabel = ariaLabelProp ?? ariaLabelAttr ?? null;

    const messages = useSoneMessages();
    const [open, setOpen] = useControllable(
      openProp,
      defaultOpen,
      onOpenChange,
    );
    const hydrated = useHydrated();
    const shown = open && (inline || hydrated);
    const layer = useRef<HTMLElement | null>(null);
    const panelEl = useRef<HTMLDivElement | null>(null);
    const overlay = useOverlay({
      open: shown,
      layer,
      panel: panelEl,
      dismissible,
      closeOnScrim: settings.closeOnScrim,
      dismiss: () => {
        onDismiss?.();
        setOpen(false);
      },
    });

    const extension = useExtension?.(own as Own, {
      panel: panelEl,
      open: shown,
      dismissible,
      requestClose: overlay.requestClose,
    });

    if (!shown) return null;
    const hostProps: Record<string, unknown> = {
      ...rest,
      ref: mergeRefs(layer, ref),
      className: cx(spec.layerClass, className),
      "data-slot": spec.layerSlot,
      onPointerDown: (e: PointerEvent<HTMLElement>) => {
        overlay.onLayerPointerDown(e);
        onPointerDown?.(e);
      },
      onClick: (e: MouseEvent<HTMLElement>) => {
        overlay.onLayerClick(e);
        onClick?.(e);
      },
    };
    const content = createElement(
      spec.host,
      hostProps,
      <div
        ref={panelEl}
        className={spec.panelClass}
        role={settings.role}
        data-slot={settings.slot}
        aria-modal="true"
        aria-labelledby={ariaLabel ? undefined : overlay.titleId}
        aria-label={ariaLabel ?? undefined}
        aria-describedby={overlay.descriptionId}
        tabIndex={-1}
        {...settings.attrs}
        {...extension?.panelAttrs}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Escape") overlay.onEscape(e);
          else overlay.onKeyDown(e);
        }}
      >
        {extension?.before}
        <SONE_OVERLAY.Provider value={overlay.host}>
          {children}
        </SONE_OVERLAY.Provider>
        {settings.cornerClose && showClose && dismissible ? (
          <span className="dialog-close-anchor">
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              className="dialog-close"
              {...(spec.closeSlot && { "data-slot": spec.closeSlot })}
              aria-label={closeLabel ?? messages.close}
              onClick={overlay.requestClose}
            >
              <SoneIcon icon="close" />
            </SoneButton>
          </span>
        ) : null}
      </div>,
    );
    return inline ? content : createPortal(content, document.body);
  }
  Overlay.displayName = spec.name;
  return Overlay;
}
