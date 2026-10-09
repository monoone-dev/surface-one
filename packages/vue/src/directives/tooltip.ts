import type { Directive, DirectiveBinding } from "vue";

const SHOW_DELAY_MS = 350;
const OFFSET_PX = 8;
const MARGIN_PX = 8;
const ARROW_INSET_PX = 12;

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipOptions {
  readonly text?: string;
  readonly side?: TooltipSide;
  readonly align?: TooltipAlign;
  readonly arrow?: boolean;
  readonly disabled?: boolean;
  readonly showDelay?: number;
}

/** `v-sone-tooltip="'Copy'"`, or an options object; `v-sone-tooltip:top` sets the side. */
export type TooltipValue = string | TooltipOptions | null | undefined;

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

interface TooltipState {
  options: Required<TooltipOptions>;
  bubble: HTMLDivElement | null;
  timer: ReturnType<typeof setTimeout> | null;
  readonly listeners: [string, EventListener][];
  readonly onDocumentKeydown: (e: KeyboardEvent) => void;
}

const states = new WeakMap<HTMLElement, TooltipState>();

function resolveOptions(
  binding: DirectiveBinding<TooltipValue, string, TooltipSide>,
): Required<TooltipOptions> {
  const value =
    typeof binding.value === "string"
      ? { text: binding.value }
      : (binding.value ?? {});
  return {
    text: value.text ?? "",
    side: value.side ?? (binding.arg as TooltipSide | undefined) ?? "bottom",
    align: value.align ?? "center",
    arrow: value.arrow ?? true,
    disabled: value.disabled ?? false,
    showDelay: value.showDelay ?? SHOW_DELAY_MS,
  };
}

function clearTimer(state: TooltipState): void {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function hide(state: TooltipState): void {
  clearTimer(state);
  state.bubble?.remove();
  state.bubble = null;
}

/** The bound text, else the host's native `title` (moved aside so two tooltips never show). */
function resolveText(el: HTMLElement, state: TooltipState): string {
  const bound = state.options.text.trim();
  if (bound) return bound;
  const title = el.getAttribute("title")?.trim() ?? "";
  if (title) {
    el.removeAttribute("title");
    el.dataset["tooltip"] = title;
  }
  return title || (el.dataset["tooltip"] ?? "");
}

function place(
  el: HTMLElement,
  state: TooltipState,
  bubble: HTMLDivElement,
): void {
  const anchor = el.getBoundingClientRect();
  const box = { width: bubble.offsetWidth, height: bubble.offsetHeight };
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fits = (side: TooltipSide): boolean => {
    switch (side) {
      case "top":
        return anchor.top - OFFSET_PX - box.height >= MARGIN_PX;
      case "bottom":
        return anchor.bottom + OFFSET_PX + box.height <= vh - MARGIN_PX;
      case "left":
        return anchor.left - OFFSET_PX - box.width >= MARGIN_PX;
      case "right":
        return anchor.right + OFFSET_PX + box.width <= vw - MARGIN_PX;
    }
  };
  const preferred = state.options.side;
  const side =
    fits(preferred) || !fits(OPPOSITE[preferred])
      ? preferred
      : OPPOSITE[preferred];
  const vertical = side === "top" || side === "bottom";
  const align = state.options.align;

  let top: number;
  let left: number;
  if (vertical) {
    top =
      side === "bottom"
        ? anchor.bottom + OFFSET_PX
        : anchor.top - OFFSET_PX - box.height;
    left =
      align === "start"
        ? anchor.left
        : align === "end"
          ? anchor.right - box.width
          : anchor.left + anchor.width / 2 - box.width / 2;
  } else {
    left =
      side === "right"
        ? anchor.right + OFFSET_PX
        : anchor.left - OFFSET_PX - box.width;
    top =
      align === "start"
        ? anchor.top
        : align === "end"
          ? anchor.bottom - box.height
          : anchor.top + anchor.height / 2 - box.height / 2;
  }
  left = Math.max(MARGIN_PX, Math.min(left, vw - box.width - MARGIN_PX));
  top = Math.max(MARGIN_PX, Math.min(top, vh - box.height - MARGIN_PX));

  bubble.dataset["side"] = side;
  bubble.dataset["align"] = align;
  bubble.style.top = `${Math.round(top)}px`;
  bubble.style.left = `${Math.round(left)}px`;

  const span = vertical ? box.width : box.height;
  const target = vertical
    ? anchor.left + anchor.width / 2 - left
    : anchor.top + anchor.height / 2 - top;
  const lo = Math.min(ARROW_INSET_PX, span / 2);
  const arrowAt = Math.max(lo, Math.min(target, span - lo));
  bubble.style.setProperty(
    "--sone-tooltip-arrow-at",
    `${Math.round(arrowAt)}px`,
  );
}

function show(
  el: HTMLElement,
  state: TooltipState,
  text: string,
  delay: number,
): void {
  state.timer = null;
  if (!el.isConnected) return;
  hide(state);
  const bubble = document.createElement("div");
  bubble.className = "sone-tooltip";
  bubble.setAttribute("aria-hidden", "true");
  bubble.dataset["slot"] = "tooltip-content";
  bubble.dataset["state"] = delay > 0 ? "delayed-open" : "instant-open";
  if (state.options.arrow) bubble.dataset["arrow"] = "";
  bubble.textContent = text;
  bubble.dataset["side"] = state.options.side;
  document.body.appendChild(bubble);
  state.bubble = bubble;
  place(el, state, bubble);
}

function schedule(el: HTMLElement, state: TooltipState): void {
  const text = resolveText(el, state);
  if (!text || state.options.disabled) {
    hide(state);
    return;
  }
  clearTimer(state);
  const delay = Number.isFinite(state.options.showDelay)
    ? Math.max(0, state.options.showDelay)
    : SHOW_DELAY_MS;
  state.timer = setTimeout(() => show(el, state, text, delay), delay);
}

/**
 * `v-sone-tooltip` — the Vue twin of `[soneTooltip]`: a short label on hover and
 * focus, placed on the preferred side (flipped when it does not fit). The bubble is
 * `aria-hidden`: the control keeps naming itself as it already did, or a screen
 * reader would announce the name twice.
 */
export const vSoneTooltip: Directive<
  HTMLElement,
  TooltipValue,
  string,
  TooltipSide
> = {
  mounted(el, binding) {
    const state: TooltipState = {
      options: resolveOptions(binding),
      bubble: null,
      timer: null,
      listeners: [],
      onDocumentKeydown: (e) => {
        if (e.key === "Escape" && (state.bubble || state.timer !== null))
          hide(state);
      },
    };
    const on = (type: string, fn: () => void): void => {
      el.addEventListener(type, fn);
      state.listeners.push([type, fn]);
    };
    on("mouseenter", () => schedule(el, state));
    on("focusin", () => schedule(el, state));
    on("mouseleave", () => hide(state));
    on("focusout", () => hide(state));
    on("click", () => hide(state));
    document.addEventListener("keydown", state.onDocumentKeydown);
    states.set(el, state);
  },
  updated(el, binding) {
    const state = states.get(el);
    if (state) state.options = resolveOptions(binding);
  },
  beforeUnmount(el) {
    const state = states.get(el);
    if (!state) return;
    hide(state);
    for (const [type, fn] of state.listeners) el.removeEventListener(type, fn);
    document.removeEventListener("keydown", state.onDocumentKeydown);
    states.delete(el);
  },
  // Nothing to render on the server: the bubble only exists on hover / focus.
  getSSRProps: () => ({}),
};
