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
  /** Close the overlay the way its own close button does (when it may be dismissed). */
  requestClose?(): void;
}

export const SONE_OVERLAY: InjectionKey<SoneOverlayHost> =
  Symbol("SoneOverlay");

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
    requestClose: () => {
      if (options.dismissible()) options.dismiss();
    },
  });

  let returnFocus: HTMLElement | null = null;
  let pressStartedOnLayer = false;
  const focus = createModalFocus({
    layer: () => options.layer.value,
    panel: () => options.panel.value,
    dismissible: options.dismissible,
    dismiss: options.dismiss,
  });

  const activate = (): void => {
    const opener = captureOpener();
    if (!focus.activate()) return;
    returnFocus = opener;
    void nextTick(() => {
      const panel = options.panel.value;
      if (panel && focus.ready()) focusInitial(panel);
    });
  };

  const deactivate = (): void => {
    if (!focus.deactivate()) return;
    const lost = focusLost(options.panel.value);
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
      focus.cycle(event.shiftKey);
    },
    onEscape(event: KeyboardEvent): void {
      event.stopPropagation();
      focus.dismissIfAllowed();
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
      focus.dismissIfAllowed();
    },
  };
}
