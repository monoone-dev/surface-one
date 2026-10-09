import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";

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

export const SONE_OVERLAY: InjectionKey<SoneOverlayHost> =
  Symbol("SoneOverlay");

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
  readonly open: () => boolean;
  readonly layer: Ref<HTMLElement | null>;
  readonly panel: Ref<HTMLElement | null>;
  readonly dismissible: () => boolean;
  readonly closeOnScrim: () => boolean;
  readonly dismiss: () => void;
}

/**
 * The modal behaviour shared by SoneDialog, SoneAlertDialog and SoneSheet — the Vue
 * port of the Angular `SoneOverlayBase`: focus moves in on open (to `[autofocus]` /
 * `[data-autofocus]`, else the panel) and back to the opener on close, Tab cycles
 * inside, Escape and a press-and-release on the scrim dismiss, and the title /
 * description name the panel.
 */
export function useOverlay(options: OverlayOptions) {
  const token = {};
  const title = shallowRef<SoneOverlayLabel | null>(null);
  const description = shallowRef<SoneOverlayLabel | null>(null);
  const titleId = computed(() => title.value?.id());
  const descriptionId = computed(() => description.value?.id());

  provide(SONE_OVERLAY, {
    registerTitle: (t) => (title.value = t),
    unregisterTitle: (t) => {
      if (title.value === t) title.value = null;
    },
    registerDescription: (d) => {
      if (description.value === null) description.value = d;
    },
    unregisterDescription: (d) => {
      if (description.value === d) description.value = null;
    },
  });

  let ready = false;
  let active = false;
  let returnFocus: HTMLElement | null = null;
  let pressStartedOnLayer = false;

  const isTopmost = (): boolean =>
    openOverlays[openOverlays.length - 1] === token;

  const tabbables = (): HTMLElement[] => {
    const panel = options.panel.value;
    if (!panel) return [];
    const all = Array.from(
      panel.querySelectorAll<HTMLElement>(TABBABLE),
    ).filter(isTabbable);
    // A named radio group is ONE Tab stop, as the browser treats it.
    const groupStop = new Map<string, HTMLInputElement>();
    for (const el of all) {
      if (!(el instanceof HTMLInputElement) || el.type !== "radio" || !el.name)
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
    const panel = options.panel.value;
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
        (s) =>
          s !== current &&
          !!(
            s.compareDocumentPosition(current) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
      );
      next = before[before.length - 1] ?? stops[stops.length - 1];
    } else {
      const after = stops.filter(
        (s) =>
          s !== current &&
          !!(
            s.compareDocumentPosition(current) &
            Node.DOCUMENT_POSITION_PRECEDING
          ),
      );
      next = after[0] ?? stops[0];
    }
    next?.focus();
  };

  // Focus fell out of every element (on `<body>`): the panel's own keydown cannot
  // hear the key, so the topmost overlay answers here.
  const onDocumentKeydown = (event: KeyboardEvent): void => {
    if (!ready || !isTopmost() || event.defaultPrevented) return;
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
      if (options.dismissible()) options.dismiss();
    }
  };

  const onDocumentFocusIn = (event: FocusEvent): void => {
    if (!ready || !isTopmost()) return;
    const layer = options.layer.value;
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

  const activate = (): void => {
    if (active) return;
    active = true;
    // `document.body` is excluded: focus already fell there, and "returning" to it
    // would steal focus from what the opener restores.
    const opener = document.activeElement as HTMLElement | null;
    returnFocus =
      opener && opener !== document.body && typeof opener.focus === "function"
        ? opener
        : null;
    openOverlays.push(token);
    document.addEventListener("keydown", onDocumentKeydown);
    document.addEventListener("focusin", onDocumentFocusIn);
    void nextTick(() => {
      const panel = options.panel.value;
      if (!active || !panel) return;
      ready = true;
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
    });
  };

  const deactivate = (): void => {
    if (!active) return;
    active = false;
    ready = false;
    const i = openOverlays.indexOf(token);
    if (i >= 0) openOverlays.splice(i, 1);
    document.removeEventListener("keydown", onDocumentKeydown);
    document.removeEventListener("focusin", onDocumentFocusIn);
    // Only reclaim focus if it is still ours or lost — an owner that already moved it elsewhere keeps it.
    const current = document.activeElement;
    const lost =
      !current ||
      current === document.body ||
      !!options.panel.value?.contains(current);
    const target = returnFocus;
    returnFocus = null;
    if (lost) void nextTick(() => target?.isConnected && target.focus());
  };

  onMounted(() => {
    if (options.open()) activate();
    watch(options.open, (open) => (open ? activate() : deactivate()));
  });
  onBeforeUnmount(deactivate);

  return {
    titleId,
    descriptionId,
    onKeydown(event: KeyboardEvent): void {
      if (event.key !== "Tab" || event.defaultPrevented) return;
      event.preventDefault();
      cycleFocus(event.shiftKey);
    },
    onEscape(event: KeyboardEvent): void {
      event.stopPropagation();
      if (options.dismissible()) options.dismiss();
    },
    onLayerPointerDown(event: PointerEvent): void {
      pressStartedOnLayer = event.target === event.currentTarget;
    },
    onLayerClick(event: MouseEvent): void {
      const startedOnLayer = pressStartedOnLayer;
      pressStartedOnLayer = false;
      if (
        event.target === event.currentTarget &&
        startedOnLayer &&
        options.closeOnScrim() &&
        options.dismissible()
      ) {
        options.dismiss();
      }
    },
    requestClose(): void {
      if (options.dismissible()) options.dismiss();
    },
  };
}
