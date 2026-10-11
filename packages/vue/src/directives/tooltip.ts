import type { Directive, DirectiveBinding } from "vue";

import {
  attachSoneTooltip,
  resolveTooltipOptions,
  type TooltipOptions,
  type TooltipSide,
  type TooltipValue,
} from "@surface-one/core";

export type {
  TooltipAlign,
  TooltipOptions,
  TooltipSide,
  TooltipValue,
} from "@surface-one/core";

interface TooltipState {
  options: Required<TooltipOptions>;
  detach?: () => void;
}

const states = new WeakMap<HTMLElement, TooltipState>();

/** `v-sone-tooltip="'Copy'"`, or an options object; `v-sone-tooltip:top` sets the side. */
const resolveOptions = (
  binding: DirectiveBinding<TooltipValue, string, TooltipSide>,
): Required<TooltipOptions> =>
  resolveTooltipOptions(binding.value, binding.arg as TooltipSide | undefined);

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
    const state: TooltipState = { options: resolveOptions(binding) };
    state.detach = attachSoneTooltip(el, () => state.options);
    states.set(el, state);
  },
  updated(el, binding) {
    const state = states.get(el);
    if (state) state.options = resolveOptions(binding);
  },
  beforeUnmount(el) {
    states.get(el)?.detach?.();
    states.delete(el);
  },
  // Nothing to render on the server: the bubble only exists on hover / focus.
  getSSRProps: () => ({}),
};
